import { scientificReferences } from '../data/scientificReferences';
import { SCORE_BASELINE, KG_PER_NEGATIVE_IMPACT, KG_PER_POSITIVE_IMPACT } from '../engine/evaluateCarbonScore';
import { carbonRules, thresholds } from '../engine/rules';
import {
  CarbonScoreBreakdown,
  CollectorCapability,
  ScientificReference,
  ScoreGroup,
} from '../engine/types';
import { summarizeCollectorCoverage } from './collectorCoverage';

const orderedGroups: ScoreGroup[] = [
  'Device Energy',
  'Network & Cloud',
  'Audio',
  'Behavioral',
  'Charging',
  'Processing & Sensors',
];

export interface MethodGroupSummary {
  group: ScoreGroup;
  categoryCount: number;
  outcomeCount: number;
  referenceCount: number;
  categories: string[];
  triggeredShare: number | null;
  triggeredKgCo2: number | null;
}

export interface ScoreMethodExample {
  baseline: number;
  positiveImpact: number;
  negativeImpact: number;
  totalImpact: number;
  rawScore: number;
  clampedScore: number;
  estimatedKgCo2: number;
  triggeredRuleCount: number;
}

export interface ReferenceUsageItem {
  reference: ScientificReference;
  outcomeCount: number;
  categoryCount: number;
}

export const thresholdNotes = [
  { label: 'Location requests', value: `${thresholds.locationRequests} requests` },
  { label: 'Auto-play videos', value: `${thresholds.autoplayVideosCount} videos` },
  { label: 'Multi-device sync events', value: `${thresholds.multiDeviceSyncEvents} syncs` },
  { label: 'Duplicate media', value: `${thresholds.duplicateMedia} files` },
  { label: 'Compression tasks', value: `${thresholds.compressionTasks} tasks` },
  { label: 'Heavy app opens', value: `${thresholds.heavyAppOpens} launches` },
  { label: 'Battery extremes', value: `${thresholds.batteryExtremeMinutes} minutes` },
  { label: 'Gyroscope-heavy apps', value: `${thresholds.gyroActiveApps} apps` },
  { label: 'Radio high-power time', value: `${thresholds.radioHighPowerTime} minutes` },
];

export const buildMethodGroupSummaries = (
  breakdown: CarbonScoreBreakdown,
): MethodGroupSummary[] =>
  orderedGroups.map((group) => {
    const groupRules = carbonRules.filter((rule) => rule.group === group);
    const categories = Array.from(new Set(groupRules.map((rule) => rule.category)));
    const references = new Set(groupRules.map((rule) => rule.referenceId));
    const triggered = breakdown.groupBreakdown.find((item) => item.group === group);

    return {
      group,
      categoryCount: categories.length,
      outcomeCount: groupRules.length,
      referenceCount: references.size,
      categories,
      triggeredShare: triggered?.share ?? null,
      triggeredKgCo2: triggered?.estimatedKgCo2 ?? null,
    };
  });

export const buildScoreMethodExample = (
  breakdown: CarbonScoreBreakdown,
): ScoreMethodExample => {
  const positiveImpact = breakdown.entries.reduce(
    (sum, entry) => sum + Math.max(entry.scoreImpact, 0),
    0,
  );
  const negativeImpact = breakdown.entries.reduce(
    (sum, entry) => sum + Math.abs(Math.min(entry.scoreImpact, 0)),
    0,
  );
  const rawScore = SCORE_BASELINE + breakdown.totalImpact;

  return {
    baseline: SCORE_BASELINE,
    positiveImpact,
    negativeImpact,
    totalImpact: breakdown.totalImpact,
    rawScore,
    clampedScore: breakdown.score,
    estimatedKgCo2: breakdown.estimatedKgCo2,
    triggeredRuleCount: breakdown.entries.length,
  };
};

export const buildCollectorMethodSummary = (collectorCapabilities: CollectorCapability[]) => {
  const coverage = summarizeCollectorCoverage(collectorCapabilities);
  const waitingFamilies = collectorCapabilities
    .filter(
      (capability) =>
        capability.status === 'native-required' ||
        capability.status === 'blocked' ||
        capability.status === 'unavailable',
    )
    .sort(
      (left, right) => right.coverage.outcomeCount - left.coverage.outcomeCount,
    );

  return {
    coverage,
    waitingFamilies,
  };
};

export const buildReferenceUsage = (): ReferenceUsageItem[] =>
  scientificReferences
    .map((reference) => {
      const relatedRules = carbonRules.filter(
        (rule) => rule.referenceId === reference.id,
      );

      return {
        reference,
        outcomeCount: relatedRules.length,
        categoryCount: new Set(relatedRules.map((rule) => rule.category)).size,
      };
    })
    .sort((left, right) => right.outcomeCount - left.outcomeCount);

export const scoreFormulaLines = [
  `Score = clamp(${SCORE_BASELINE} + total rule impact, 0, 100)`,
  `CO₂e = max(0.04, 0.14 + negative impact * ${KG_PER_NEGATIVE_IMPACT} - positive impact * ${KG_PER_POSITIVE_IMPACT})`,
];
