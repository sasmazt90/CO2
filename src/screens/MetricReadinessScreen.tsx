import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { SurfaceCard } from '../components/SurfaceCard';
import { useAppContext } from '../context/AppContext';
import {
  MetricReadinessStatus,
  buildMetricReadiness,
  summarizeMetricReadiness,
} from '../services/metricReadiness';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const statusLabel: Record<MetricReadinessStatus, string> = {
  live: 'Live',
  'journal-backed': 'Journal',
  derived: 'Derived',
  estimated: 'Estimated',
  'native-required': 'Native',
  blocked: 'Blocked',
};

const statusStyle: Record<
  MetricReadinessStatus,
  { backgroundColor: string; color: string }
> = {
  live: { backgroundColor: colors.mintGreen, color: colors.forestInk },
  'journal-backed': { backgroundColor: colors.pastelGreen, color: colors.forestInk },
  derived: { backgroundColor: colors.pastelSage, color: colors.forestInk },
  estimated: { backgroundColor: colors.mist, color: colors.deepTeal },
  'native-required': { backgroundColor: '#EAF0EC', color: colors.warmGray },
  blocked: { backgroundColor: '#F0F3F1', color: colors.warmGray },
};

export const MetricReadinessScreen = () => {
  const navigation = useNavigation<any>();
  const { todayMetrics, liveSignalState, permissionDiagnostics } = useAppContext();

  const readinessItems = useMemo(
    () =>
      buildMetricReadiness({
        metrics: todayMetrics,
        liveSignalState,
        diagnostics: permissionDiagnostics,
      }),
    [liveSignalState, permissionDiagnostics, todayMetrics],
  );

  const summary = useMemo(
    () => summarizeMetricReadiness(readinessItems),
    [readinessItems],
  );

  const grouped = useMemo(() => {
    const groups = new Map<string, typeof readinessItems>();

    for (const item of readinessItems) {
      const current = groups.get(item.group) ?? [];
      current.push(item);
      groups.set(item.group, current);
    }

    return Array.from(groups.entries());
  }, [readinessItems]);

  return (
    <Screen>
      <SurfaceCard>
        <SectionTitle
          title="Metric Readiness"
          subtitle="A production-readiness audit for every scoring metric"
          action={
            <Pressable onPress={() => navigation.navigate('DataSources')}>
              <Text style={styles.link}>Data Sources</Text>
            </Pressable>
          }
        />
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryValue}>{summary.productionReadyMetrics}</Text>
            <Text style={styles.summaryLabel}>Ready</Text>
          </View>
          <View>
            <Text style={styles.summaryValue}>{summary.byStatus.estimated}</Text>
            <Text style={styles.summaryLabel}>Estimated</Text>
          </View>
          <View>
            <Text style={styles.summaryValue}>
              {summary.byStatus['native-required']}
            </Text>
            <Text style={styles.summaryLabel}>Native</Text>
          </View>
          <View>
            <Text style={styles.summaryValue}>{summary.byStatus.blocked}</Text>
            <Text style={styles.summaryLabel}>Blocked</Text>
          </View>
        </View>
        <Text style={styles.body}>
          Production-ready coverage is {Math.round(summary.readinessShare * 100)}% across{' '}
          {summary.totalMetrics} metrics. We count `live`, `journal-backed`, and `derived`
          metrics as ready enough to trust in a production rollout.
        </Text>
        <Text style={styles.secondary}>
          This screen is intentionally strict: anything still heuristic stays marked as
          estimated, even if the rule engine already uses it.
        </Text>
      </SurfaceCard>

      {grouped.map(([group, items]) => (
        <SurfaceCard key={group}>
          <SectionTitle
            title={group}
            subtitle={`${items.filter((item) => item.status === 'live' || item.status === 'journal-backed' || item.status === 'derived').length}/${items.length} metrics production-ready`}
          />
          <View style={styles.metricList}>
            {items.map((item) => {
              const palette = statusStyle[item.status];

              return (
                <View key={item.key} style={styles.metricRow}>
                  <View style={styles.metricCopy}>
                    <View style={styles.metricTopRow}>
                      <Text style={styles.metricLabel}>{item.label}</Text>
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: palette.backgroundColor },
                        ]}
                      >
                        <Text style={[styles.badgeText, { color: palette.color }]}>
                          {statusLabel[item.status]}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.metricMeta}>
                      Value: {item.valuePreview} | Source: {item.sourceLabel}
                    </Text>
                    <Text style={styles.metricSummary}>{item.summary}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </SurfaceCard>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  summaryValue: {
    color: colors.forestInk,
    fontFamily: typography.numbers,
    fontSize: 28,
    textAlign: 'center',
  },
  summaryLabel: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
    textAlign: 'center',
  },
  body: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.sm,
  },
  secondary: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 18,
  },
  link: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
  },
  metricList: {
    gap: spacing.sm,
  },
  metricRow: {
    borderBottomColor: 'rgba(160,167,162,0.12)',
    borderBottomWidth: 1,
    paddingBottom: spacing.sm,
  },
  metricCopy: {
    gap: 4,
  },
  metricTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  metricLabel: {
    color: colors.forestInk,
    flex: 1,
    fontFamily: typography.bodyMedium,
    fontSize: 14,
  },
  metricMeta: {
    color: colors.deepTeal,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
  },
  metricSummary: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
  },
  badge: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: typography.bodyMedium,
    fontSize: 11,
  },
});
