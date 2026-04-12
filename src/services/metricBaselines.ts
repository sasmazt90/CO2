import { DailyMetrics, HistorySnapshot } from '../engine/types';

type BaselineMetricKey =
  | 'sleepBaseline'
  | 'backgroundComputeBaseline'
  | 'proximityBaseline'
  | 'faceIDBaseline';

const SOURCE_KEY_BY_BASELINE: Record<BaselineMetricKey, keyof DailyMetrics> = {
  sleepBaseline: 'sleepEnergy',
  backgroundComputeBaseline: 'backgroundComputeTime',
  proximityBaseline: 'proximityActiveTime',
  faceIDBaseline: 'faceIDUnlocks',
};

const MIN_HISTORY_DAYS = 3;

const average = (values: number[]) =>
  Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);

export const deriveMetricBaselines = ({
  currentMetrics,
  historySnapshots,
}: {
  currentMetrics: DailyMetrics;
  historySnapshots: HistorySnapshot[];
}): Partial<DailyMetrics> => {
  const historicalMetrics = historySnapshots
    .map((item) => item.metrics)
    .filter((item) => item.date !== currentMetrics.date);

  if (historicalMetrics.length < MIN_HISTORY_DAYS) {
    return {};
  }

  const patch: Partial<DailyMetrics> = {};

  (Object.keys(SOURCE_KEY_BY_BASELINE) as BaselineMetricKey[]).forEach((key) => {
    const sourceKey = SOURCE_KEY_BY_BASELINE[key];
    const values = historicalMetrics
      .map((item) => item[sourceKey])
      .filter(
        (value): value is number =>
          typeof value === 'number' && Number.isFinite(value),
      );

    if (values.length >= MIN_HISTORY_DAYS) {
      patch[key] = Math.max(1, average(values)) as never;
    }
  });

  return patch;
};

export const hasDerivedMetricBaseline = ({
  key,
  currentMetrics,
  historySnapshots,
}: {
  key: BaselineMetricKey;
  currentMetrics: DailyMetrics;
  historySnapshots: HistorySnapshot[];
}) => {
  const historicalMetrics = historySnapshots
    .map((item) => item.metrics)
    .filter((item) => item.date !== currentMetrics.date);

  if (historicalMetrics.length < MIN_HISTORY_DAYS) {
    return false;
  }

  const sourceKey = SOURCE_KEY_BY_BASELINE[key];
  const values = historicalMetrics
    .map((item) => item[sourceKey])
    .filter(
      (value): value is number =>
        typeof value === 'number' && Number.isFinite(value),
    );

  return values.length >= MIN_HISTORY_DAYS;
};
