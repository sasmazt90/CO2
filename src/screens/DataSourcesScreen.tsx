import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CollectorCapabilityCard } from '../components/CollectorCapabilityCard';
import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { SurfaceCard } from '../components/SurfaceCard';
import { useAppContext } from '../context/AppContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const DataSourcesScreen = () => {
  const { collectorCapabilities } = useAppContext();

  const summary = useMemo(() => {
    const live = collectorCapabilities.filter((item) => item.status === 'live').length;
    const estimated = collectorCapabilities.filter((item) => item.status === 'estimated').length;
    const nativeRequired = collectorCapabilities.filter(
      (item) => item.status === 'native-required',
    ).length;
    const blocked = collectorCapabilities.filter((item) => item.status === 'blocked').length;

    return { live, estimated, nativeRequired, blocked };
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
            <Text style={styles.summaryValue}>{summary.live}</Text>
            <Text style={styles.summaryLabel}>Live</Text>
          </View>
          <View>
            <Text style={styles.summaryValue}>{summary.estimated}</Text>
            <Text style={styles.summaryLabel}>Estimated</Text>
          </View>
          <View>
            <Text style={styles.summaryValue}>{summary.nativeRequired}</Text>
            <Text style={styles.summaryLabel}>Native</Text>
          </View>
          <View>
            <Text style={styles.summaryValue}>{summary.blocked}</Text>
            <Text style={styles.summaryLabel}>Blocked</Text>
          </View>
        </View>
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
