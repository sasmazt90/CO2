import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';

import { DailyMetrics } from '../engine/types';
import { getLocalISODate } from '../utils/date';

const SCREEN_TIME_JOURNAL_STORAGE_KEY =
  'digital-carbon-footprint-score/screen-time-journal';
const KEEP_DAYS = 7;
const MAX_SESSION_MINUTES = 240;
const MIN_DERIVED_MINUTES = 10;

export type ScreenTimeSessionSource = 'launch' | 'resume';

export interface ScreenTimeSessionEntry {
  startedAt: string;
  endedAt?: string;
  source: ScreenTimeSessionSource;
}

export interface ScreenTimeJournalSummary {
  metricPatch: Partial<DailyMetrics>;
  sessionCount: number;
  observedMinutes: number;
  lastEventAt?: string;
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
    Math.round(
      (new Date(to).getTime() - new Date(from).getTime()) / 60000,
    ),
  );

const trimSessions = (entries: ScreenTimeSessionEntry[]) => {
  const cutoff = Date.now() - KEEP_DAYS * 86400000;

  return entries
    .filter((entry) => new Date(entry.startedAt).getTime() >= cutoff)
    .sort((left, right) => left.startedAt.localeCompare(right.startedAt));
};

const loadScreenTimeJournal = async (): Promise<ScreenTimeSessionEntry[]> => {
  const value = await AsyncStorage.getItem(SCREEN_TIME_JOURNAL_STORAGE_KEY);

  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as ScreenTimeSessionEntry[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return trimSessions(parsed);
  } catch {
    return [];
  }
};

const saveScreenTimeJournal = async (entries: ScreenTimeSessionEntry[]) => {
  await AsyncStorage.setItem(
    SCREEN_TIME_JOURNAL_STORAGE_KEY,
    JSON.stringify(trimSessions(entries)),
  );
};

const hasOpenSession = (entries: ScreenTimeSessionEntry[]) =>
  Boolean(entries[entries.length - 1] && !entries[entries.length - 1].endedAt);

export const startScreenTimeSession = async (
  source: ScreenTimeSessionSource,
  timestamp = new Date().toISOString(),
) =>
  enqueueJournalTask(async () => {
    const entries = await loadScreenTimeJournal();

    if (hasOpenSession(entries)) {
      return entries;
    }

    const nextEntries = trimSessions([
      ...entries,
      {
        startedAt: timestamp,
        source,
      },
    ]);
    await saveScreenTimeJournal(nextEntries);
    return nextEntries;
  });

export const endScreenTimeSession = async (timestamp = new Date().toISOString()) =>
  enqueueJournalTask(async () => {
    const entries = await loadScreenTimeJournal();

    if (!hasOpenSession(entries)) {
      return entries;
    }

    const nextEntries = [...entries];
    const lastEntry = nextEntries[nextEntries.length - 1];
    nextEntries[nextEntries.length - 1] = {
      ...lastEntry,
      endedAt: timestamp,
    };
    await saveScreenTimeJournal(nextEntries);
    return trimSessions(nextEntries);
  });

const effectiveSessionEnd = (
  entry: ScreenTimeSessionEntry,
  now: Date,
) => {
  const rawEnd = entry.endedAt ? new Date(entry.endedAt) : now;
  const cappedMinutes = Math.min(
    differenceInMinutes(entry.startedAt, rawEnd),
    MAX_SESSION_MINUTES,
  );

  return new Date(new Date(entry.startedAt).getTime() + cappedMinutes * 60000);
};

export const buildScreenTimeJournalSummary = async (
  dateISO = getLocalISODate(),
  now = new Date(),
): Promise<ScreenTimeJournalSummary> =>
  enqueueJournalTask(async () => {
    const sessions = (await loadScreenTimeJournal()).filter((entry) => {
      const startDate = getLocalISODate(new Date(entry.startedAt));
      const endDate = getLocalISODate(effectiveSessionEnd(entry, now));
      return startDate === dateISO || endDate === dateISO;
    });

    if (sessions.length === 0) {
      return {
        metricPatch: {},
        sessionCount: 0,
        observedMinutes: 0,
        derivedFromJournal: false,
      };
    }

    let observedMinutes = 0;

    for (const session of sessions) {
      const sessionStart = new Date(session.startedAt);
      const sessionEnd = effectiveSessionEnd(session, now);
      const dayStart = new Date(`${dateISO}T00:00:00`);
      const dayEnd = new Date(`${dateISO}T23:59:59.999`);
      const overlapStart = Math.max(sessionStart.getTime(), dayStart.getTime());
      const overlapEnd = Math.min(sessionEnd.getTime(), dayEnd.getTime());

      if (overlapEnd > overlapStart) {
        observedMinutes += Math.round((overlapEnd - overlapStart) / 60000);
      }
    }

    const lastEventAt = sessions[sessions.length - 1]
      ? effectiveSessionEnd(sessions[sessions.length - 1], now).toISOString()
      : undefined;
    const derivedFromJournal = observedMinutes >= MIN_DERIVED_MINUTES;

    return {
      metricPatch: derivedFromJournal ? { screenTime: observedMinutes } : {},
      sessionCount: sessions.length,
      observedMinutes,
      lastEventAt,
      derivedFromJournal,
      note: derivedFromJournal
        ? `App session journal observed ${observedMinutes} minutes in ${sessions.length} foreground sessions today.`
        : `App session journal has ${sessions.length} sessions so far and is still collecting a stronger screen-time fallback.`,
    };
  });

export const startScreenTimeJournalListeners = (
  onSummary: (summary: ScreenTimeJournalSummary) => void,
) => {
  let active = true;
  let currentState = AppState.currentState;

  const publish = async () => {
    const summary = await buildScreenTimeJournalSummary();

    if (active) {
      onSummary(summary);
    }
  };

  if (currentState === 'active') {
    void startScreenTimeSession('launch').then(() => {
      void publish();
    });
  }

  const subscription = AppState.addEventListener(
    'change',
    (nextState: AppStateStatus) => {
      const wasActive = currentState === 'active';
      const isActive = nextState === 'active';

      currentState = nextState;

      if (!wasActive && isActive) {
        void startScreenTimeSession('resume').then(() => {
          void publish();
        });
        return;
      }

      if (wasActive && !isActive) {
        void endScreenTimeSession().then(() => {
          void publish();
        });
      }
    },
  );

  return () => {
    active = false;
    subscription.remove();
  };
};
