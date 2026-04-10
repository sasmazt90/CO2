import { carbonRules } from './rules';
import {
  CarbonScoreBreakdown,
  DailyMetrics,
  GroupBreakdownItem,
  TriggeredRule,
} from './types';

const SCORE_BASELINE = 78;
const KG_PER_NEGATIVE_IMPACT = 0.018;

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
    .map<TriggeredRule>(({ trigger: _trigger, ...entry }) => entry);

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
    Number((0.14 + totalNegative * KG_PER_NEGATIVE_IMPACT - totalPositive * 0.004).toFixed(2)),
  );

  const grouped = new Map<string, number>();
  entries.forEach((entry) => {
    const normalizedImpact =
      Math.abs(Math.min(entry.scoreImpact, 0)) + Math.max(entry.scoreImpact, 0) * 0.4;
    grouped.set(entry.group, (grouped.get(entry.group) ?? 0) + normalizedImpact);
  });

  const totalGroupImpact = Array.from(grouped.values()).reduce((sum, value) => sum + value, 0) || 1;
  const groupBreakdown = Array.from(grouped.entries()).map<GroupBreakdownItem>(([group, impact]) => ({
    group: group as GroupBreakdownItem['group'],
    impact,
    share: Number(((impact / totalGroupImpact) * 100).toFixed(1)),
    estimatedKgCo2: Number(((impact / totalGroupImpact) * estimatedKgCo2).toFixed(2)),
  }));

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
