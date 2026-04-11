import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Battery from 'expo-battery';

import { DailyMetrics } from '../engine/types';
import { getLocalISODate } from '../utils/date';

const BATTERY_JOURNAL_STORAGE_KEY = 'digital-carbon-footprint-score/battery-journal';
const KEEP_DAYS = 7;
const MIN_SAMPLE_GAP_MINUTES = 4;
const MAX_INFERRED_INTERVAL_MINUTES = 90;
const MIN_DERIVED_COVERAGE_MINUTES = 30;

export type BatteryJournalSource =
  | 'sync'
  | 'level-change'
  | 'state-change'
  | 'resume';

export interface BatteryJournalEntry {
  timestamp: string;
  batteryLevel: number;
  batteryState: Battery.BatteryState;
  lowPowerMode: boolean;
  source: BatteryJournalSource;
}

export interface BatteryJournalSummary {
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

const roundBatteryLevel = (level: number) => Math.round(level * 1000) / 1000;

const isChargingState = (batteryState: Battery.BatteryState) =>
  batteryState === Battery.BatteryState.CHARGING ||
  batteryState === Battery.BatteryState.FULL;

const differenceInMinutes = (from: string | Date, to: string | Date) =>
  Math.max(
    0,
    Math.round(
      (new Date(to).getTime() - new Date(from).getTime()) / 60000,
    ),
  );

const trimJournal = (entries: BatteryJournalEntry[]) => {
  const cutoff = Date.now() - KEEP_DAYS * 86400000;

  return entries
    .filter((entry) => new Date(entry.timestamp).getTime() >= cutoff)
    .sort((left, right) => left.timestamp.localeCompare(right.timestamp));
};

const loadBatteryJournal = async (): Promise<BatteryJournalEntry[]> => {
  const value = await AsyncStorage.getItem(BATTERY_JOURNAL_STORAGE_KEY);

  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as BatteryJournalEntry[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return trimJournal(parsed);
  } catch {
    return [];
  }
};

const saveBatteryJournal = async (entries: BatteryJournalEntry[]) => {
  await AsyncStorage.setItem(
    BATTERY_JOURNAL_STORAGE_KEY,
    JSON.stringify(trimJournal(entries)),
  );
};

const shouldAppendEntry = (
  lastEntry: BatteryJournalEntry | undefined,
  nextEntry: BatteryJournalEntry,
) => {
  if (!lastEntry) {
    return true;
  }

  const minutesSinceLast = differenceInMinutes(lastEntry.timestamp, nextEntry.timestamp);
  const levelDelta = Math.abs(lastEntry.batteryLevel - nextEntry.batteryLevel);

  if (minutesSinceLast >= MIN_SAMPLE_GAP_MINUTES) {
    return true;
  }

  if (lastEntry.batteryState !== nextEntry.batteryState) {
    return true;
  }

  if (lastEntry.lowPowerMode !== nextEntry.lowPowerMode) {
    return true;
  }

  return levelDelta >= 0.01;
};

const overlapWithNightWindow = (
  start: Date,
  end: Date,
  dateISO: string,
) => {
  const windowStart = new Date(`${dateISO}T00:00:00`);
  const windowEnd = new Date(`${dateISO}T06:00:00`);
  const overlapStart = Math.max(start.getTime(), windowStart.getTime());
  const overlapEnd = Math.min(end.getTime(), windowEnd.getTime());

  if (overlapEnd <= overlapStart) {
    return 0;
  }

  return Math.round((overlapEnd - overlapStart) / 60000);
};

export const recordBatterySnapshot = async ({
  batteryLevel,
  batteryState,
  lowPowerMode,
  source,
  timestamp = new Date().toISOString(),
}: Omit<BatteryJournalEntry, 'timestamp'> & { timestamp?: string }) =>
  enqueueJournalTask(async () => {
    const nextEntry: BatteryJournalEntry = {
      timestamp,
      batteryLevel: roundBatteryLevel(batteryLevel),
      batteryState,
      lowPowerMode,
      source,
    };

    const currentEntries = await loadBatteryJournal();
    const lastEntry = currentEntries[currentEntries.length - 1];

    if (!shouldAppendEntry(lastEntry, nextEntry)) {
      return trimJournal(currentEntries);
    }

    const nextEntries = trimJournal([...currentEntries, nextEntry]);
    await saveBatteryJournal(nextEntries);
    return nextEntries;
  });

export const buildBatteryJournalSummary = async (
  dateISO = getLocalISODate(),
  now = new Date(),
): Promise<BatteryJournalSummary> =>
  enqueueJournalTask(async () => {
    const entries = (await loadBatteryJournal()).filter(
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

    if (sampleCount < 2) {
      return {
        metricPatch: {},
        sampleCount,
        lastSampleAt,
        derivedFromJournal: false,
        note: 'Battery journal started collecting local charging samples today.',
      };
    }

    let timeBelow20 = 0;
    let timeAbove80 = 0;
    let chargingBetween00_06 = 0;
    let timeAt100WhilePlugged = 0;
    let chargeSessions = 0;
    let observedMinutes = 0;

    for (let index = 0; index < entries.length; index += 1) {
      const entry = entries[index];
      const previous = entries[index - 1];
      const entryStart = new Date(entry.timestamp);
      const rawEnd =
        index < entries.length - 1
          ? new Date(entries[index + 1].timestamp)
          : now;
      const intervalMinutes = Math.min(
        differenceInMinutes(entryStart, rawEnd),
        MAX_INFERRED_INTERVAL_MINUTES,
      );
      const entryEnd = new Date(
        entryStart.getTime() + intervalMinutes * 60000,
      );
      const charging = isChargingState(entry.batteryState);

      if (charging && !previous) {
        chargeSessions += 1;
      } else if (
        charging &&
        previous &&
        !isChargingState(previous.batteryState)
      ) {
        chargeSessions += 1;
      }

      if (intervalMinutes <= 0) {
        continue;
      }

      observedMinutes += intervalMinutes;

      if (entry.batteryLevel < 0.2) {
        timeBelow20 += intervalMinutes;
      }

      if (entry.batteryLevel > 0.8) {
        timeAbove80 += intervalMinutes;
      }

      if (charging) {
        chargingBetween00_06 += overlapWithNightWindow(
          entryStart,
          entryEnd,
          dateISO,
        );

        if (entry.batteryLevel >= 0.99) {
          timeAt100WhilePlugged += intervalMinutes;
        }
      }
    }

    if (observedMinutes < MIN_DERIVED_COVERAGE_MINUTES) {
      return {
        metricPatch: {},
        sampleCount,
        lastSampleAt,
        derivedFromJournal: false,
        note: `Battery journal has ${sampleCount} samples but needs more coverage before replacing daily charging metrics.`,
      };
    }

    return {
      metricPatch: {
        chargeSessions,
        chargingBetween00_06,
        timeAt100WhilePlugged,
        timeBelow20,
        timeAbove80,
      },
      sampleCount,
      lastSampleAt,
      derivedFromJournal: true,
      note: `Battery journal contributed ${sampleCount} local samples to today's charging metrics.`,
    };
  });

const captureCurrentBatterySnapshot = async (source: BatteryJournalSource) => {
  const [batteryLevel, batteryState, lowPowerMode] = await Promise.all([
    Battery.getBatteryLevelAsync(),
    Battery.getBatteryStateAsync(),
    Battery.isLowPowerModeEnabledAsync(),
  ]);

  await recordBatterySnapshot({
    batteryLevel,
    batteryState,
    lowPowerMode,
    source,
  });

  return buildBatteryJournalSummary();
};

export const startBatteryJournalListeners = (
  onSummary: (summary: BatteryJournalSummary) => void,
) => {
  let active = true;
  let levelSubscription: Battery.Subscription | null = null;
  let stateSubscription: Battery.Subscription | null = null;

  const publish = async (source: BatteryJournalSource) => {
    try {
      const summary = await captureCurrentBatterySnapshot(source);

      if (active) {
        onSummary(summary);
      }
    } catch {
      // Ignore unsupported battery listener surfaces and keep the app stable.
    }
  };

  try {
    levelSubscription = Battery.addBatteryLevelListener(() => {
      void publish('level-change');
    });
    stateSubscription = Battery.addBatteryStateListener(() => {
      void publish('state-change');
    });
  } catch {
    return () => undefined;
  }

  return () => {
    active = false;
    levelSubscription?.remove();
    stateSubscription?.remove();
  };
};
