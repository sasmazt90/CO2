import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

import { DailyMetrics } from '../engine/types';
import { getLocalISODate } from '../utils/date';

const MOBILITY_JOURNAL_STORAGE_KEY =
  'digital-carbon-footprint-score/mobility-journal';
const KEEP_DAYS = 7;
const MAX_INFERRED_INTERVAL_MINUTES = 20;
const MIN_DERIVED_SAMPLE_COUNT = 2;
const VEHICLE_SPEED_THRESHOLD = 4;
const TRIP_BREAK_MINUTES = 20;
const MAX_SHORT_TRIP_MINUTES = 15;

export type MobilityJournalSource = 'sync' | 'watch';

export interface MobilityJournalEntry {
  timestamp: string;
  speedMps: number;
  accuracyMeters: number | null;
  source: MobilityJournalSource;
}

export interface MobilityJournalSummary {
  metricPatch: Partial<DailyMetrics>;
  sampleCount: number;
  lastSampleAt?: string;
  derivedFromJournal: boolean;
  note?: string;
}

let journalQueue: Promise<unknown> = Promise.resolve();

const enqueueJournalTask = <T>(task: () => Promise<T>): Promise<T> => {
  const next = journalQueue.then(task, task);
  journalQueue = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
};

const differenceInMinutes = (from: string | Date, to: string | Date) =>
  Math.max(
    0,
    Math.round((new Date(to).getTime() - new Date(from).getTime()) / 60000),
  );

const trimEntries = (entries: MobilityJournalEntry[]) => {
  const cutoff = Date.now() - KEEP_DAYS * 86400000;

  return entries
    .filter((entry) => new Date(entry.timestamp).getTime() >= cutoff)
    .sort((left, right) => left.timestamp.localeCompare(right.timestamp));
};

const loadMobilityJournal = async (): Promise<MobilityJournalEntry[]> => {
  const value = await AsyncStorage.getItem(MOBILITY_JOURNAL_STORAGE_KEY);

  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as MobilityJournalEntry[];
    return Array.isArray(parsed) ? trimEntries(parsed) : [];
  } catch {
    return [];
  }
};

const saveMobilityJournal = async (entries: MobilityJournalEntry[]) => {
  await AsyncStorage.setItem(
    MOBILITY_JOURNAL_STORAGE_KEY,
    JSON.stringify(trimEntries(entries)),
  );
};

const normalizeSpeed = (speed: number | null | undefined) =>
  typeof speed === 'number' && Number.isFinite(speed) ? Math.max(0, speed) : 0;

const normalizeAccuracy = (accuracy: number | null | undefined) =>
  typeof accuracy === 'number' && Number.isFinite(accuracy) ? Math.max(0, accuracy) : null;

const shouldAppendEntry = (
  lastEntry: MobilityJournalEntry | undefined,
  nextEntry: MobilityJournalEntry,
) => {
  if (!lastEntry) {
    return true;
  }

  const minutesSinceLast = differenceInMinutes(lastEntry.timestamp, nextEntry.timestamp);

  if (minutesSinceLast >= 5) {
    return true;
  }

  return Math.abs(lastEntry.speedMps - nextEntry.speedMps) >= 1;
};

export const recordMobilitySnapshot = async ({
  speedMps,
  accuracyMeters,
  source,
  timestamp = new Date().toISOString(),
}: {
  speedMps: number | null | undefined;
  accuracyMeters: number | null | undefined;
  source: MobilityJournalSource;
  timestamp?: string;
}) =>
  enqueueJournalTask(async () => {
    const nextEntry: MobilityJournalEntry = {
      timestamp,
      speedMps: normalizeSpeed(speedMps),
      accuracyMeters: normalizeAccuracy(accuracyMeters),
      source,
    };

    const currentEntries = await loadMobilityJournal();
    const lastEntry = currentEntries[currentEntries.length - 1];

    if (!shouldAppendEntry(lastEntry, nextEntry)) {
      return trimEntries(currentEntries);
    }

    const nextEntries = trimEntries([...currentEntries, nextEntry]);
    await saveMobilityJournal(nextEntries);
    return nextEntries;
  });

const countShortVehicleTrips = (entries: MobilityJournalEntry[]) => {
  let trips = 0;
  let currentTripStart: Date | null = null;
  let currentTripEnd: Date | null = null;

  const flushTrip = () => {
    if (!currentTripStart || !currentTripEnd) {
      currentTripStart = null;
      currentTripEnd = null;
      return;
    }

    const duration = differenceInMinutes(currentTripStart, currentTripEnd);

    if (duration > 0 && duration <= MAX_SHORT_TRIP_MINUTES) {
      trips += 1;
    }

    currentTripStart = null;
    currentTripEnd = null;
  };

  for (const entry of entries) {
    const timestamp = new Date(entry.timestamp);
    const looksLikeVehicle = entry.speedMps >= VEHICLE_SPEED_THRESHOLD;

    if (!looksLikeVehicle) {
      flushTrip();
      continue;
    }

    if (!currentTripStart) {
      currentTripStart = timestamp;
      currentTripEnd = timestamp;
      continue;
    }

    const gap = currentTripEnd
      ? differenceInMinutes(currentTripEnd, timestamp)
      : 0;

    if (gap > TRIP_BREAK_MINUTES) {
      flushTrip();
      currentTripStart = timestamp;
    }

    currentTripEnd = timestamp;
  }

  flushTrip();
  return trips;
};

export const buildMobilityJournalSummary = async (
  dateISO = getLocalISODate(),
  now = new Date(),
): Promise<MobilityJournalSummary> =>
  enqueueJournalTask(async () => {
    const entries = (await loadMobilityJournal()).filter(
      (entry) => getLocalISODate(new Date(entry.timestamp)) === dateISO,
    );

    if (entries.length === 0) {
      return {
        metricPatch: {},
        sampleCount: 0,
        derivedFromJournal: false,
      };
    }

    const sampleCount = entries.length;
    const lastSampleAt = entries[entries.length - 1]?.timestamp;

    if (sampleCount < MIN_DERIVED_SAMPLE_COUNT) {
      return {
        metricPatch: {},
        sampleCount,
        lastSampleAt,
        derivedFromJournal: false,
        note: 'Mobility journal started collecting foreground location samples today.',
      };
    }

    let navigationMinutes = 0;

    for (let index = 0; index < entries.length; index += 1) {
      const entry = entries[index];
      const nextTimestamp =
        index < entries.length - 1 ? entries[index + 1].timestamp : now.toISOString();
      const intervalMinutes = Math.min(
        differenceInMinutes(entry.timestamp, nextTimestamp),
        MAX_INFERRED_INTERVAL_MINUTES,
      );

      if (intervalMinutes <= 0) {
        continue;
      }

      if (entry.speedMps >= 1.5) {
        navigationMinutes += intervalMinutes;
      }
    }

    const shortVehicleTrips = countShortVehicleTrips(entries);

    return {
      metricPatch: {
        shortVehicleTrips,
        navigationTime: Math.max(0, Math.round(navigationMinutes)),
        locationRequests: sampleCount,
        locationAlwaysOnApps: 0,
      },
      sampleCount,
      lastSampleAt,
      derivedFromJournal: true,
      note: `Mobility journal reconstructed ${sampleCount} foreground location samples into navigation and short-trip metrics.`,
    };
  });

export const startMobilityJournalListeners = async (
  onSummary: (summary: MobilityJournalSummary) => void,
) => {
  try {
    const permission = await Location.getForegroundPermissionsAsync();

    if (!permission.granted) {
      return () => undefined;
    }

    let active = true;
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 200,
        timeInterval: 10 * 60 * 1000,
        mayShowUserSettingsDialog: false,
      },
      async (location) => {
        try {
          await recordMobilitySnapshot({
            speedMps: location.coords.speed,
            accuracyMeters: location.coords.accuracy ?? null,
            source: 'watch',
          });

          const summary = await buildMobilityJournalSummary();

          if (active) {
            onSummary(summary);
          }
        } catch {
          // Keep the watcher calm on unsupported devices.
        }
      },
    );

    return () => {
      active = false;
      subscription.remove();
    };
  } catch {
    return () => undefined;
  }
};

export const recordMobilityLocation = async (
  location: Location.LocationObject,
  source: MobilityJournalSource,
) =>
  recordMobilitySnapshot({
    speedMps: location.coords.speed,
    accuracyMeters: location.coords.accuracy ?? null,
    source,
  });
