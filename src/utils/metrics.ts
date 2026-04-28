import { metricCatalog, metricGroups } from '../data/metricCatalog';
import { DailyMetrics, ScoreGroup, TriggeredRule } from '../engine/types';
import { carbonRules } from '../engine/rules';

export type TrackableMetricKey = (typeof metricCatalog)[number]['key'];
export type MetricTrackingState = Record<TrackableMetricKey, boolean>;

export const createDefaultTrackingState = (): MetricTrackingState =>
  Object.fromEntries(metricCatalog.map((metric) => [metric.key, true])) as MetricTrackingState;

export const applyTrackedMetrics = (
  metrics: DailyMetrics,
  trackedMetrics: MetricTrackingState,
): DailyMetrics => {
  const next = { ...metrics } as DailyMetrics;

  for (const metric of metricCatalog) {
    if (trackedMetrics[metric.key]) {
      continue;
    }

    if (typeof next[metric.key] === 'boolean') {
      ((next as unknown) as Record<string, unknown>)[metric.key] = false;
    } else {
      ((next as unknown) as Record<string, unknown>)[metric.key] = 0;
    }
  }

  return next;
};

export const metricDefinitionByKey = Object.fromEntries(
  metricCatalog.map((metric) => [metric.key, metric]),
) as Record<TrackableMetricKey, (typeof metricCatalog)[number]>;

export const sumMetricRuleImpacts = (ruleIds: string[], entries: TriggeredRule[]) =>
  entries
    .filter((entry) => ruleIds.includes(entry.id))
    .reduce((sum, entry) => sum + Math.abs(entry.scoreImpact), 0);

export const sumMetricRuleKgCo2 = (ruleIds: string[], entries: TriggeredRule[]) =>
  entries
    .filter((entry) => ruleIds.includes(entry.id))
    .reduce((sum, entry) => sum + entry.estimatedKgCo2, 0);

export const metricSections = metricGroups.map((group) => {
  const metrics = metricCatalog.filter((metric) => metric.group === group);
  return { group, metrics };
});

export const getMetricDisplayValue = (
  metrics: DailyMetrics,
  key: TrackableMetricKey,
): string | number | boolean => metrics[key];

export const getGroupImpactMap = (entries: TriggeredRule[]) =>
  Object.fromEntries(
    metricGroups.map((group) => [
      group,
      metricCatalog
        .filter((metric) => metric.group === group)
        .reduce((sum, metric) => sum + sumMetricRuleImpacts(metric.ruleIds, entries), 0),
    ]),
  ) as Record<ScoreGroup, number>;

export const getGroupKgCo2Map = (entries: TriggeredRule[]) =>
  Object.fromEntries(
    metricGroups.map((group) => [
      group,
      metricCatalog
        .filter((metric) => metric.group === group)
        .reduce((sum, metric) => sum + sumMetricRuleKgCo2(metric.ruleIds, entries), 0),
    ]),
  ) as Record<ScoreGroup, number>;

export const getMetricSources = (ruleIds: string[]) =>
  carbonRules.filter((rule) => ruleIds.includes(rule.id));

export const getMetricToggleValue = (
  trackedMetrics: MetricTrackingState,
  group: ScoreGroup,
) =>
  metricCatalog
    .filter((metric) => metric.group === group)
    .every((metric) => trackedMetrics[metric.key]);
