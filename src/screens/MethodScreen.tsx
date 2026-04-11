import { useNavigation } from '@react-navigation/native';
import React, { useMemo } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { BreakdownRow } from '../components/BreakdownRow';
import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { SurfaceCard } from '../components/SurfaceCard';
import { useAppContext } from '../context/AppContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import {
  buildCollectorMethodSummary,
  buildMethodGroupSummaries,
  buildReferenceUsage,
  buildScoreMethodExample,
  scoreFormulaLines,
  thresholdNotes,
} from '../services/methodology';
import { formatKgCo2 } from '../utils/formatters';

const groupDescriptions = [
  {
    title: 'Why digital behavior affects CO2',
    body: 'Display power, radios, cloud traffic, charging patterns, and transport choices all shape the total energy used around a mobile device and its supporting infrastructure.',
  },
  {
    title: 'Data privacy and on-device processing',
    body: 'This experience keeps insights deterministic and local-first. Only user-approved signals should be read by platform integrations, and every triggered rule stays inspectable in plain language.',
  },
];

export const MethodScreen = () => {
  const navigation = useNavigation<any>();
  const { collectorCapabilities, todayBreakdown } = useAppContext();

  const methodExample = useMemo(
    () => buildScoreMethodExample(todayBreakdown),
    [todayBreakdown],
  );
  const groupSummaries = useMemo(
    () => buildMethodGroupSummaries(todayBreakdown),
    [todayBreakdown],
  );
  const collectorSummary = useMemo(
    () => buildCollectorMethodSummary(collectorCapabilities),
    [collectorCapabilities],
  );
  const referenceUsage = useMemo(() => buildReferenceUsage(), []);

  return (
    <Screen>
      <SurfaceCard>
        <SectionTitle
          title="Our Scientific Method"
          subtitle="Formulas, metric families, collector coverage, and sources"
          action={
            <Pressable onPress={() => navigation.navigate('DataSources')}>
              <Text style={styles.link}>Data Sources</Text>
            </Pressable>
          }
        />
        {groupDescriptions.map((item) => (
          <View key={item.title} style={styles.block}>
            <Text style={styles.blockTitle}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle
          title="Scoring Formula"
          subtitle="The same deterministic math runs every day"
        />
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
          subtitle={`${methodExample.triggeredRuleCount} triggered outcomes shaped today's score`}
        />
        <Text style={styles.body}>
          Raw score = {methodExample.baseline} + {methodExample.totalImpact} ={' '}
          {methodExample.rawScore}. After clamping, today's score is{' '}
          {methodExample.clampedScore}, with an estimated footprint of{' '}
          {formatKgCo2(methodExample.estimatedKgCo2)}.
        </Text>
        {todayBreakdown.entries.slice(0, 4).map((entry) => (
          <BreakdownRow key={entry.id} entry={entry} />
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle
          title="Collector Transparency"
          subtitle={`${collectorSummary.coverage.byStatus.live.outcomeCount}/${collectorSummary.coverage.totalOutcomes} outcomes are backed by live collectors today`}
          action={
            <Pressable onPress={() => navigation.navigate('BridgeStatus')}>
              <Text style={styles.link}>Bridge Status</Text>
            </Pressable>
          }
        />
        <Text style={styles.body}>
          Live families cover {collectorSummary.coverage.byStatus.live.categoryCount} of{' '}
          {collectorSummary.coverage.totalCategories} categories. Native-required
          families still hold {collectorSummary.coverage.byStatus['native-required'].outcomeCount}{' '}
          outcomes, and blocked or unavailable access affects{' '}
          {collectorSummary.coverage.byStatus.blocked.outcomeCount +
            collectorSummary.coverage.byStatus.unavailable.outcomeCount}
          .
        </Text>
        {collectorSummary.waitingFamilies.slice(0, 3).map((family) => (
          <View key={family.id} style={styles.reference}>
            <Text style={styles.blockTitle}>{family.title}</Text>
            <Text style={styles.referenceMeta}>
              {family.coverage.categoryCount} categories | {family.coverage.outcomeCount}{' '}
              outcomes
            </Text>
            <Text style={styles.body}>{family.summary}</Text>
          </View>
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
                No triggered impact from this group in today's calculation.
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

      <SurfaceCard>
        <SectionTitle
          title="References"
          subtitle="Tap any source to open the full paper or documentation"
        />
        {referenceUsage.map(({ reference, outcomeCount, categoryCount }) => (
          <Pressable
            key={reference.id}
            onPress={() => void Linking.openURL(reference.url)}
            style={styles.reference}
          >
            <Text style={styles.blockTitle}>{reference.title}</Text>
            <Text style={styles.referenceMeta}>
              {reference.organization} | {categoryCount} categories | {outcomeCount}{' '}
              outcomes
            </Text>
            <Text style={styles.body}>{reference.citation}</Text>
            <Text style={styles.note}>{reference.note}</Text>
          </Pressable>
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
  link: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
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
  note: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
  },
});
