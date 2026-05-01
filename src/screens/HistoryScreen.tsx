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
import { formatKgCo2, monthDayLabel, toFootprintScore } from '../utils/formatters';

type RangeMode = 'weekly' | 'monthly';

export const HistoryScreen = () => {
  const { breakdownHistory, weeklyAverageScore } = useAppContext();
  const [range, setRange] = useState<RangeMode>('weekly');

  const weeklyTrend = useMemo(
    () =>
      breakdownHistory.slice(-7).map((item) => ({
        date: item.breakdown.date,
        value: toFootprintScore(item.breakdown.score),
      })),
    [breakdownHistory],
  );

  const monthlyTrend = useMemo(() => {
    const lastTwentyEight = breakdownHistory.slice(-28);
    if (lastTwentyEight.length < 8) {
      return weeklyTrend;
    }

    const buckets: { date: string; value: number }[] = [];
    for (let index = 0; index < lastTwentyEight.length; index += 7) {
      const slice = lastTwentyEight.slice(index, index + 7);
      buckets.push({
        date: slice[slice.length - 1].breakdown.date,
        value: Math.round(
          slice.reduce((sum, item) => sum + toFootprintScore(item.breakdown.score), 0) / slice.length,
        ),
      });
    }

    return buckets;
  }, [breakdownHistory, weeklyTrend]);

  const activeTrend = range === 'weekly' ? weeklyTrend : monthlyTrend;
  const delta =
    activeTrend.length > 1
      ? activeTrend[activeTrend.length - 1].value - activeTrend[0].value
      : 0;

  const recentEntries = useMemo(
    () => [...breakdownHistory].reverse().slice(0, 7),
    [breakdownHistory],
  );

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
        <Text style={styles.caption}>Current 7-day average: {toFootprintScore(weeklyAverageScore)}</Text>
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle title="Daily journal" subtitle="Saved local snapshots with the strongest daily signal" />
        <View style={styles.list}>
          {recentEntries.map((entry) => {
            const topSignal =
              entry.breakdown.topImprovementAreas[0]?.category ??
              entry.breakdown.topPositive[0]?.category ??
              'Steady signals';

            return (
              <View key={entry.breakdown.date} style={styles.journalRow}>
                <View style={styles.journalCopy}>
                  <Text style={styles.journalDate}>{monthDayLabel(entry.breakdown.date)}</Text>
                  <Text style={styles.item}>{topSignal}</Text>
                  <Text style={styles.journalMeta}>{entry.breakdown.primaryInsight}</Text>
                </View>
                <View style={styles.journalScoreWrap}>
                  <Text style={styles.journalScore}>{toFootprintScore(entry.breakdown.score)}</Text>
                  <Text style={styles.journalKg}>
                    {formatKgCo2(entry.breakdown.estimatedKgCo2)}
                  </Text>
                </View>
              </View>
            );
          })}
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
  caption: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
    marginTop: spacing.xs,
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
  journalRow: {
    borderTopColor: 'rgba(160,167,162,0.1)',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  journalCopy: {
    flex: 1,
    gap: 2,
  },
  journalDate: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 12,
  },
  journalMeta: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
  },
  journalScoreWrap: {
    alignItems: 'flex-end',
    minWidth: 72,
  },
  journalScore: {
    color: colors.forestInk,
    fontFamily: typography.numbers,
    fontSize: 24,
  },
  journalKg: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 11,
  },
});
