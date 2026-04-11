import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CollectorCapabilityCard } from '../components/CollectorCapabilityCard';
import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { SurfaceCard } from '../components/SurfaceCard';
import { useAppContext } from '../context/AppContext';
import { summarizeCollectorCoverage } from '../services/collectorCoverage';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const DataSourcesScreen = () => {
  const { collectorCapabilities } = useAppContext();

  const summary = useMemo(() => {
    const coverage = summarizeCollectorCoverage(collectorCapabilities);

    return {
      ...coverage,
      needsAccessFamilies:
        coverage.byStatus.blocked.familyCount +
        coverage.byStatus.unavailable.familyCount,
      needsAccessOutcomes:
        coverage.byStatus.blocked.outcomeCount +
        coverage.byStatus.unavailable.outcomeCount,
    };
  }, [collectorCapabilities]);

  return (
    <Screen>
      <SurfaceCard>
        <SectionTitle
          title="Data Sources"
          subtitle="Which metric families are live, estimated, blocked, or waiting on native bridges"
        />
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryValue}>{summary.byStatus.live.familyCount}</Text>
            <Text style={styles.summaryLabel}>Live</Text>
          </View>
          <View>
            <Text style={styles.summaryValue}>{summary.byStatus.estimated.familyCount}</Text>
            <Text style={styles.summaryLabel}>Estimated</Text>
          </View>
          <View>
            <Text style={styles.summaryValue}>
              {summary.byStatus['native-required'].familyCount}
            </Text>
            <Text style={styles.summaryLabel}>Native</Text>
          </View>
          <View>
            <Text style={styles.summaryValue}>{summary.needsAccessFamilies}</Text>
            <Text style={styles.summaryLabel}>Access</Text>
          </View>
        </View>
        <Text style={styles.coverageCopy}>
          Live collectors currently back {summary.byStatus.live.outcomeCount} of{' '}
          {summary.totalOutcomes} rule outcomes across {summary.byStatus.live.categoryCount}{' '}
          of {summary.totalCategories} categories.
        </Text>
        <Text style={styles.coverageSecondary}>
          Native bridges would unlock {summary.byStatus['native-required'].outcomeCount}{' '}
          more outcomes, while blocked or unavailable access affects{' '}
          {summary.needsAccessOutcomes}.
        </Text>
      </SurfaceCard>

      {collectorCapabilities.map((capability) => (
        <CollectorCapabilityCard key={capability.id} capability={capability} />
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
  coverageCopy: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
  coverageSecondary: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
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
    marginTop: 2,
    textAlign: 'center',
  },
});
