import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { SurfaceCard } from '../components/SurfaceCard';
import { TrendChart } from '../components/TrendChart';
import { useAppContext } from '../context/AppContext';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type RangeMode = 'weekly' | 'monthly';

export const HistoryScreen = () => {
  const { breakdownHistory } = useAppContext();
  const [range, setRange] = useState<RangeMode>('weekly');

  const weeklyTrend = useMemo(
    () =>
      breakdownHistory.map((item) => ({
        date: item.breakdown.date,
        value: item.breakdown.score,
      })),
    [breakdownHistory],
  );

  const monthlyTrend = [
    { date: '2026-03-14', value: 64 },
    { date: '2026-03-21', value: 69 },
    { date: '2026-03-28', value: 73 },
    { date: '2026-04-04', value: 78 },
  ];

  const activeTrend = range === 'weekly' ? weeklyTrend : monthlyTrend;
  const delta = activeTrend[activeTrend.length - 1].value - activeTrend[0].value;

  return (
    <Screen>
      <SurfaceCard>
        <SectionTitle title="History" subtitle="Weekly and monthly score movement" />
        <View style={styles.chips}>
          {(['weekly', 'monthly'] as const).map((mode) => (
            <Pressable
              key={mode}
              onPress={() => setRange(mode)}
              style={[styles.chip, range === mode && styles.chipActive]}
            >
              <Text style={[styles.chipText, range === mode && styles.chipTextActive]}>
                {mode === 'weekly' ? 'Weekly' : 'Monthly'}
              </Text>
            </Pressable>
          ))}
        </View>
        <TrendChart data={activeTrend} />
        <Text style={styles.delta}>
          {delta >= 0 ? '+' : ''}
          {delta} points from the start of this {range}.
        </Text>
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle title="Improvement highlights" subtitle="Signals that moved in a greener direction" />
        <View style={styles.list}>
          <Text style={styles.item}>Brightness stayed efficient on 3 of the last 7 days.</Text>
          <Text style={styles.item}>Overcharging dropped to 0 minutes on the last 5 days.</Text>
          <Text style={styles.item}>Low-signal radio time fell sharply compared with the start of the period.</Text>
        </View>
      </SurfaceCard>
    </Screen>
  );
};

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  chip: {
    borderColor: 'rgba(160,167,162,0.18)',
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipActive: {
    backgroundColor: colors.softTeal,
    borderColor: colors.softTeal,
  },
  chipText: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 12,
  },
  chipTextActive: {
    color: colors.softWhite,
  },
  delta: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 13,
  },
  list: {
    gap: spacing.sm,
  },
  item: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
  },
});
