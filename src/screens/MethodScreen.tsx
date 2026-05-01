import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BreakdownRow } from '../components/BreakdownRow';
import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { SurfaceCard } from '../components/SurfaceCard';
import { useAppContext } from '../context/AppContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import {
  buildMethodGroupSummaries,
  buildScoreMethodExample,
  scoreFormulaLines,
  thresholdNotes,
} from '../services/methodology';
import { formatKgCo2 } from '../utils/formatters';

const groupDescriptions = [
  {
    title: 'Why digital behavior affects footprint',
    body: 'Display power, radios, cloud traffic, charging patterns, and transport choices all shape the total energy used around a mobile device and its supporting infrastructure.',
  },
  {
    title: 'Data privacy and on-device processing',
    body: 'This experience keeps insights deterministic and local-first. Only user-approved signals should be read by platform integrations, and every triggered rule stays inspectable in plain language.',
  },
];

export const MethodScreen = () => {
  const { todayBreakdown } = useAppContext();

  const methodExample = useMemo(
    () => buildScoreMethodExample(todayBreakdown),
    [todayBreakdown],
  );
  const groupSummaries = useMemo(
    () => buildMethodGroupSummaries(todayBreakdown),
    [todayBreakdown],
  );

  return (
    <Screen>
      <SurfaceCard>
        <SectionTitle title="How we calculate" subtitle="CO2e is the primary unit for trends, groups, focus areas, and metric details" />
        {groupDescriptions.map((item) => (
          <View key={item.title} style={styles.block}>
            <Text style={styles.blockTitle}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle
          title="Calculation Formula"
          subtitle="The same deterministic CO2e estimate runs for every selected day"
        />
        <Text style={styles.body}>
          The app estimates kg CO2e first, then derives the 0-100 score as a simple
          normalized daily indicator. Detailed sections use CO2e because those values can
          be compared and added across metric families.
        </Text>
        {scoreFormulaLines.map((line) => (
          <Text key={line} style={styles.formula}>
            {line}
          </Text>
        ))}
        <View style={styles.metricsRow}>
          <View style={styles.metricPill}>
            <Text style={styles.metricValue}>{methodExample.baseline}</Text>
            <Text style={styles.metricLabel}>Baseline</Text>
          </View>
          <View style={styles.metricPill}>
            <Text style={styles.metricValue}>+{methodExample.positiveImpact}</Text>
            <Text style={styles.metricLabel}>Positive</Text>
          </View>
          <View style={styles.metricPill}>
            <Text style={styles.metricValue}>-{methodExample.negativeImpact}</Text>
            <Text style={styles.metricLabel}>Negative</Text>
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle
          title="Today's Example"
          subtitle={`${methodExample.triggeredRuleCount} triggered outcomes shaped today's footprint estimate`}
        />
        <Text style={styles.body}>
          Raw score = {methodExample.baseline} + {methodExample.totalImpact} ={' '}
          {methodExample.rawScore}. After clamping, the resulting score is{' '}
          {methodExample.clampedScore}, with an estimated footprint of{' '}
          {formatKgCo2(methodExample.estimatedKgCo2)}.
        </Text>
        {todayBreakdown.entries.slice(0, 4).map((entry) => (
          <BreakdownRow key={entry.id} entry={entry} />
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle
          title="Metric Families"
          subtitle="Every rule belongs to a visible scientific group"
        />
        {groupSummaries.map((group) => (
          <View key={group.group} style={styles.reference}>
            <Text style={styles.blockTitle}>{group.group}</Text>
            <Text style={styles.referenceMeta}>
              {group.categoryCount} categories | {group.outcomeCount} outcomes |{' '}
              {group.referenceCount} sources
            </Text>
            <Text style={styles.body}>{group.categories.join(', ')}</Text>
            {group.triggeredShare !== null ? (
              <Text style={styles.groupImpact}>
                Today's share: {group.triggeredShare}% of modeled impact, about{' '}
                {formatKgCo2(group.triggeredKgCo2 ?? 0)}
              </Text>
            ) : (
              <Text style={styles.groupImpact}>
                No triggered impact from this group in the current calculation.
              </Text>
            )}
          </View>
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle
          title="Threshold Notes"
          subtitle="Default constants for open-ended conditions"
        />
        {thresholdNotes.map((item) => (
          <View key={item.label} style={styles.row}>
            <Text style={styles.rowLabel}>{item.label}</Text>
            <Text style={styles.rowValue}>{item.value}</Text>
          </View>
        ))}
      </SurfaceCard>
    </Screen>
  );
};

const styles = StyleSheet.create({
  block: {
    gap: spacing.xs,
  },
  blockTitle: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 15,
  },
  body: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
  },
  formula: {
    backgroundColor: 'rgba(221,235,221,0.62)',
    borderRadius: 8,
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricPill: {
    backgroundColor: 'rgba(248,250,247,0.78)',
    borderColor: 'rgba(160,167,162,0.12)',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  metricValue: {
    color: colors.forestInk,
    fontFamily: typography.numbers,
    fontSize: 20,
  },
  metricLabel: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 11,
    marginTop: 2,
  },
  groupImpact: {
    color: colors.deepTeal,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
    flex: 1,
  },
  rowValue: {
    color: colors.deepTeal,
    fontFamily: typography.body,
    fontSize: 12,
  },
  reference: {
    borderTopColor: 'rgba(160,167,162,0.12)',
    borderTopWidth: 1,
    gap: spacing.xxs,
    paddingTop: spacing.sm,
  },
  referenceMeta: {
    color: colors.deepTeal,
    fontFamily: typography.body,
    fontSize: 12,
  },
});
