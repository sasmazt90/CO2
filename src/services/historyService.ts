import AsyncStorage from '@react-native-async-storage/async-storage';

import { createNeutralMetrics } from '../data/defaultMetrics';
import { evaluateCarbonScore } from '../engine/evaluateCarbonScore';
import { DailyMetrics, HistorySnapshot } from '../engine/types';
import { differenceInDays, getLocalISODate, shiftISODate } from '../utils/date';

const HISTORY_STORAGE_KEY = 'digital-carbon-footprint-score/history';
const HISTORY_LIMIT = 30;

const cloneMetrics = (metrics: DailyMetrics): DailyMetrics => ({
  ...metrics,
});

export const createTodayMetricSeed = () => createNeutralMetrics(getLocalISODate());

const fillMissingDays = (snapshots: HistorySnapshot[]) => {
  if (snapshots.length === 0) {
    return snapshots;
  }

  const ordered = [...snapshots].sort((left, right) =>
    left.metrics.date.localeCompare(right.metrics.date),
  );
  const filled: HistorySnapshot[] = [ordered[0]];

  for (let index = 1; index < ordered.length; index += 1) {
    const previous = filled[filled.length - 1];
    const current = ordered[index];
    const gap = differenceInDays(previous.metrics.date, current.metrics.date);

    if (gap > 1) {
      for (let offset = 1; offset < gap; offset += 1) {
        const nextDate = shiftISODate(previous.metrics.date, offset);
        filled.push({
          metrics: { ...previous.metrics, date: nextDate },
          savedAt: previous.savedAt,
        });
      }
    }

    filled.push(current);
  }

  return filled;
};

export const createSeedHistory = (): HistorySnapshot[] =>
  [];

export const loadHistorySnapshots = async (): Promise<HistorySnapshot[]> => {
  const value = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
  if (!value) {
    return createSeedHistory();
  }

  try {
    const parsed = JSON.parse(value) as HistorySnapshot[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return createSeedHistory();
    }

    return fillMissingDays(parsed).slice(-HISTORY_LIMIT);
  } catch {
    return createSeedHistory();
  }
};

export const saveHistorySnapshots = async (snapshots: HistorySnapshot[]) => {
  await AsyncStorage.setItem(
    HISTORY_STORAGE_KEY,
    JSON.stringify(snapshots.slice(-HISTORY_LIMIT)),
  );
};

export const upsertTodaySnapshot = (
  snapshots: HistorySnapshot[],
  metrics: DailyMetrics,
): HistorySnapshot[] => {
  const savedAt = new Date().toISOString();
  const next = [...snapshots];
  const index = next.findIndex((item) => item.metrics.date === metrics.date);
  const snapshot = { metrics: cloneMetrics(metrics), savedAt };

  if (index >= 0) {
    next[index] = snapshot;
  } else {
    next.push(snapshot);
  }

  return fillMissingDays(next)
    .sort((left, right) => left.metrics.date.localeCompare(right.metrics.date))
    .slice(-HISTORY_LIMIT);
};

export const buildHistoryBreakdowns = (snapshots: HistorySnapshot[]) =>
  snapshots.map((snapshot) => ({
    metrics: snapshot.metrics,
    breakdown: evaluateCarbonScore(snapshot.metrics),
  }));
