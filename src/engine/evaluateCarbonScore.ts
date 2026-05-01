import { carbonRules } from './rules';
import {
  CarbonScoreBreakdown,
  DailyMetrics,
  GroupBreakdownItem,
  TriggeredRule,
} from './types';

export const SCORE_BASELINE = 78;
export const KG_PER_NEGATIVE_IMPACT = 0.018;
export const KG_PER_POSITIVE_IMPACT = 0.004;

export const estimateRuleKgCo2 = (scoreImpact: number) =>
  Number(
    (
      scoreImpact < 0
        ? Math.abs(scoreImpact) * KG_PER_NEGATIVE_IMPACT
        : scoreImpact * KG_PER_POSITIVE_IMPACT
    ).toFixed(3),
  );

const sortPositive = (rules: TriggeredRule[]) =>
  [...rules].sort((left, right) => right.scoreImpact - left.scoreImpact);

const buildPrimaryInsight = (entries: TriggeredRule[]) => {
  const topPositive = entries
    .filter((entry) => entry.scoreImpact > 0)
    .sort((left, right) => right.scoreImpact - left.scoreImpact)[0];
  const topNegative = entries
    .filter((entry) => entry.scoreImpact < 0)
    .sort((left, right) => left.scoreImpact - right.scoreImpact)[0];

  if (topPositive && topNegative) {
    return `${topPositive.category} supported your score, while ${topNegative.category.toLowerCase()} had the biggest impact on today's footprint.`;
  }

  if (topPositive) {
    return `${topPositive.category} delivered your strongest positive signal today.`;
  }

  if (topNegative) {
    return `${topNegative.category} was the biggest reason your score moved down today.`;
  }

  return 'Your signals stayed balanced today with no major changes.';
};

export const evaluateCarbonScore = (metrics: DailyMetrics): CarbonScoreBreakdown => {
  const entries = carbonRules
    .filter((rule) => rule.trigger(metrics))
    .map<TriggeredRule>(({ trigger: _trigger, ...entry }) => ({
      ...entry,
      estimatedKgCo2: estimateRuleKgCo2(entry.scoreImpact),
    }));

  const totalImpact = entries.reduce((sum, entry) => sum + entry.scoreImpact, 0);
  const score = Math.max(0, Math.min(100, SCORE_BASELINE + totalImpact));

  const totalNegative = entries.reduce(
    (sum, entry) => sum + Math.abs(Math.min(entry.scoreImpact, 0)),
    0,
  );
  const totalPositive = entries.reduce(
    (sum, entry) => sum + Math.max(entry.scoreImpact, 0),
    0,
  );

  const estimatedKgCo2 = Math.max(
    0.04,
    Number(
      (
        0.14 +
        totalNegative * KG_PER_NEGATIVE_IMPACT -
        totalPositive * KG_PER_POSITIVE_IMPACT
      ).toFixed(2),
    ),
  );

  const grouped = new Map<string, number>();
  entries.forEach((entry) => {
    grouped.set(entry.group, (grouped.get(entry.group) ?? 0) + entry.estimatedKgCo2);
  });

  const totalGroupKgCo2 = Array.from(grouped.values()).reduce((sum, value) => sum + value, 0) || 1;
  const groupBreakdown = Array.from(grouped.entries()).map<GroupBreakdownItem>(
    ([group, estimatedKgCo2]) => ({
      group: group as GroupBreakdownItem['group'],
      impact: estimatedKgCo2,
      share: Number(((estimatedKgCo2 / totalGroupKgCo2) * 100).toFixed(1)),
      estimatedKgCo2: Number(estimatedKgCo2.toFixed(3)),
    }),
  );

  const topPositive = sortPositive(entries.filter((entry) => entry.scoreImpact > 0)).slice(0, 3);
  const topImprovementAreas = [...entries.filter((entry) => entry.scoreImpact < 0)]
    .sort((left, right) => left.scoreImpact - right.scoreImpact)
    .slice(0, 3);

  return {
    date: metrics.date,
    score,
    totalImpact,
    estimatedKgCo2,
    entries,
    groupBreakdown: groupBreakdown.sort((left, right) => right.share - left.share),
    topPositive,
    topImprovementAreas,
    quickTips: topImprovementAreas.map((entry) => entry.recommendation),
    primaryInsight: buildPrimaryInsight(entries),
  };
};
