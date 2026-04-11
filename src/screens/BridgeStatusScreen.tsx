import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { NativeBridgePlanCard } from '../components/NativeBridgePlanCard';
import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { SurfaceCard } from '../components/SurfaceCard';
import { useAppContext } from '../context/AppContext';
import {
  buildNativeBridgePlans,
  summarizeNativeBridgePlans,
} from '../services/nativeBridgePlanner';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const BridgeStatusScreen = () => {
  const navigation = useNavigation<any>();
  const { collectorCapabilities } = useAppContext();

  const plans = useMemo(
    () => buildNativeBridgePlans(collectorCapabilities),
    [collectorCapabilities],
  );
  const summary = useMemo(() => summarizeNativeBridgePlans(plans), [plans]);

  return (
    <Screen>
      <SurfaceCard>
        <SectionTitle
          title="Bridge Status"
          subtitle="Platform-by-platform readiness for the collector families behind the score"
          action={
            <Pressable onPress={() => navigation.navigate('DataSources')}>
              <Text style={styles.link}>Data Sources</Text>
            </Pressable>
          }
        />
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryValue}>{summary.highPriorityFamilies}</Text>
            <Text style={styles.summaryLabel}>High</Text>
          </View>
          <View>
            <Text style={styles.summaryValue}>{summary.iosOperationalFamilies}</Text>
            <Text style={styles.summaryLabel}>iOS ready</Text>
          </View>
          <View>
            <Text style={styles.summaryValue}>{summary.androidOperationalFamilies}</Text>
            <Text style={styles.summaryLabel}>Android ready</Text>
          </View>
          <View>
            <Text style={styles.summaryValue}>{summary.nativeGapOutcomes}</Text>
            <Text style={styles.summaryLabel}>Gap rules</Text>
          </View>
        </View>
        <Text style={styles.body}>
          High-priority bridge work currently represents {summary.immediateFocusOutcomes}{' '}
          rule outcomes. This view keeps the next native rollout honest about what is
          already live, what is partial, and what should stay transparently estimated.
        </Text>
      </SurfaceCard>

      {plans.map((plan) => (
        <NativeBridgePlanCard key={plan.collectorId} plan={plan} />
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
  body: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
  link: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
  },
});
