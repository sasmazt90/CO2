import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { DateRangePickerModal, DateRangeValue } from '../components/DateRangePickerModal';
import { PieBreakdownChart } from '../components/PieBreakdownChart';
import { ScoreRing } from '../components/ScoreRing';
import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { SurfaceCard } from '../components/SurfaceCard';
import { TrendChart } from '../components/TrendChart';
import { useAppContext } from '../context/AppContext';
import { TriggeredRule } from '../engine/types';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import {
  co2eLabel,
  formatDeltaPercent,
  formatKgCo2,
  formatKgCo2Compact,
  formatShortDate,
  toFootprintScore,
} from '../utils/formatters';
import { metricGroups } from '../data/metricCatalog';

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const toIso = (date: Date) => date.toISOString().slice(0, 10);

const average = (values: number[]) =>
  values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

const aggregateTopFocus = (entries: TriggeredRule[]) => {
  const byCategory = new Map<
    string,
    { category: string; value: number; note: string }
  >();

  for (const entry of entries.filter((item) => item.scoreImpact < 0)) {
    const current = byCategory.get(entry.category);
    const nextValue = (current?.value ?? 0) + entry.estimatedKgCo2;
    byCategory.set(entry.category, {
      category: entry.category,
      value: nextValue,
      note: entry.recommendation,
    });
  }

  return Array.from(byCategory.values())
    .sort((left, right) => right.value - left.value)
    .slice(0, 5);
};

export const HomeScreen = () => {
  const { breakdownHistory, joinedChallenges, streakDays } = useAppContext();
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [infoOpen, setInfoOpen] = React.useState(false);
  const [range, setRange] = React.useState<DateRangeValue>(() => {
    const end = new Date();
    return {
      start: toIso(addDays(end, -6)),
      end: toIso(end),
    };
  });

  const currentPeriod = React.useMemo(
    () =>
      breakdownHistory.filter(
        (item) => item.breakdown.date >= range.start && item.breakdown.date <= range.end,
      ),
    [breakdownHistory, range.end, range.start],
  );

  const periodLength = React.useMemo(() => {
    const start = new Date(range.start);
    const end = new Date(range.end);
    return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
  }, [range.end, range.start]);

  const previousRange = React.useMemo(() => {
    const startDate = new Date(range.start);
    const previousEnd = addDays(startDate, -1);
    const previousStart = addDays(previousEnd, -(periodLength - 1));
    return {
      start: toIso(previousStart),
      end: toIso(previousEnd),
    };
  }, [periodLength, range.start]);

  const previousPeriod = React.useMemo(
    () =>
      breakdownHistory.filter(
        (item) =>
          item.breakdown.date >= previousRange.start && item.breakdown.date <= previousRange.end,
      ),
    [breakdownHistory, previousRange.end, previousRange.start],
  );

  const currentAverageFootprint = average(
    currentPeriod.map((item) => item.breakdown.estimatedKgCo2),
  );
  const previousAverageFootprint = average(
    previousPeriod.map((item) => item.breakdown.estimatedKgCo2),
  );
  const currentAverageScore = Math.round(
    average(currentPeriod.map((item) => item.breakdown.score)),
  );
  const firstSelectedFootprint = currentPeriod[0]?.breakdown.estimatedKgCo2 ?? 0;
  const lastSelectedFootprint =
    currentPeriod[currentPeriod.length - 1]?.breakdown.estimatedKgCo2 ?? currentAverageFootprint;
  const hasPreviousComparison = previousAverageFootprint > 0;
  const comparisonPercent = hasPreviousComparison
    ? ((previousAverageFootprint - currentAverageFootprint) / previousAverageFootprint) * 100
    : firstSelectedFootprint > 0
      ? ((firstSelectedFootprint - lastSelectedFootprint) / firstSelectedFootprint) * 100
      : 0;
  const comparisonRingProgress = Math.min(100, Math.max(6, Math.abs(comparisonPercent)));
  const comparisonCopy =
    hasPreviousComparison
      ? comparisonPercent >= 0
        ? 'Lower footprint than the previous period.'
        : 'Higher footprint than the previous period.'
      : comparisonPercent >= 0
        ? 'Lower footprint than the start of this period.'
        : 'Higher footprint than the start of this period.';

  const aggregatedGroups = metricGroups.map((group) => {
    const impact = currentPeriod.reduce((sum, item) => {
      const current = item.breakdown.groupBreakdown.find((entry) => entry.group === group);
      return sum + (current?.impact ?? 0);
    }, 0);

    const kg = currentPeriod.reduce((sum, item) => {
      const current = item.breakdown.groupBreakdown.find((entry) => entry.group === group);
      return sum + (current?.estimatedKgCo2 ?? 0);
    }, 0);

    return {
      group,
      impact,
      estimatedKgCo2: kg,
      share: 0,
    };
  });
  const totalKgCo2 = aggregatedGroups.reduce((sum, item) => sum + item.estimatedKgCo2, 0);
  const pieItems = aggregatedGroups.map((item) => ({
    ...item,
    share: totalKgCo2 > 0 ? (item.estimatedKgCo2 / totalKgCo2) * 100 : 0,
  }));

  const topFocus = aggregateTopFocus(currentPeriod.flatMap((item) => item.breakdown.entries));
  const trendData = currentPeriod.map((item) => ({
    date: item.breakdown.date,
    value: item.breakdown.estimatedKgCo2,
  }));

  return (
    <Screen>
      <SurfaceCard>
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.eyebrow}>Overall footprint score</Text>
            <Text style={styles.heroTitle}>{toFootprintScore(currentAverageScore)}/100</Text>
          </View>
          <Pressable onPress={() => setPickerOpen(true)} style={styles.filterButton}>
            <Ionicons color={colors.deepTeal} name="calendar-outline" size={18} />
            <Text style={styles.filterButtonText}>
              {formatShortDate(range.start)} - {formatShortDate(range.end)}
            </Text>
          </Pressable>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.ringWrap}>
          <ScoreRing score={comparisonRingProgress} showCenterContent={false} />
          <View style={styles.ringCenter}>
            <Text style={styles.ringOverline}>vs previous</Text>
            <Text style={styles.ringValue}>{formatDeltaPercent(comparisonPercent)}</Text>
          </View>
        </View>
        <View style={styles.comparisonHeader}>
          <Text style={styles.comparisonCopy}>{comparisonCopy}</Text>
          <Pressable onPress={() => setInfoOpen(true)} style={styles.infoButton}>
            <Ionicons color={colors.deepTeal} name="information-circle-outline" size={18} />
          </Pressable>
        </View>
        <Text style={styles.co2Title}>Average {co2eLabel}: {formatKgCo2(currentAverageFootprint)}</Text>
        <View style={styles.statsRow}>
          <View>
            <Text style={styles.statValue}>{periodLength}</Text>
            <Text style={styles.statLabel}>Days compared</Text>
          </View>
          <View>
            <Text style={styles.statValue}>{streakDays}</Text>
            <Text style={styles.statLabel}>Streak days</Text>
          </View>
          <View>
            <Text style={styles.statValue}>{joinedChallenges.length}</Text>
            <Text style={styles.statLabel}>Challenges</Text>
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle
          title="Trend"
          subtitle={`${periodLength}-day ${co2eLabel} movement inside the selected period`}
        />
        <TrendChart data={trendData} />
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle
          title="Emission breakdown"
          subtitle={`Share of modeled digital footprint by category group in ${co2eLabel}`}
        />
        <PieBreakdownChart items={pieItems} />
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle
          title="Top 5 Areas to Focus"
          subtitle="The heaviest footprint drivers from the selected period"
        />
        <Text style={styles.focusIntro}>
          The biggest reductions will come from the categories below.
        </Text>
        <View style={styles.focusList}>
          {topFocus.map((item) => (
            <View key={item.category} style={styles.focusItem}>
              <View style={styles.focusHeader}>
                <Text style={styles.focusTitle}>{item.category}</Text>
                <Text style={styles.focusValue}>{formatKgCo2Compact(item.value)}</Text>
              </View>
              <View style={styles.focusTrack}>
                <View style={[styles.focusFill, { width: `${Math.min(100, item.value * 500)}%` }]} />
              </View>
              <Text style={styles.focusNote}>{item.note}</Text>
            </View>
          ))}
        </View>
      </SurfaceCard>

      <DateRangePickerModal
        onApply={setRange}
        onClose={() => setPickerOpen(false)}
        open={pickerOpen}
        value={range}
      />

      <Modal animationType="fade" transparent visible={infoOpen}>
        <View style={styles.modalOverlay}>
          <View style={styles.infoModal}>
            <Pressable onPress={() => setInfoOpen(false)} style={styles.modalClose}>
              <Ionicons color={colors.forestInk} name="close-outline" size={22} />
            </Pressable>
            <Text style={styles.infoTitle}>Comparison logic</Text>
            <Text style={styles.infoBody}>
              This percentage compares the selected period against the immediately previous period with the same number of days. Positive values mean your average digital footprint went down.
            </Text>
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  eyebrow: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
    textTransform: 'uppercase',
  },
  heroTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  heroTitle: {
    color: colors.forestInk,
    fontFamily: typography.numbers,
    fontSize: 40,
    lineHeight: 44,
  },
  filterButton: {
    alignItems: 'center',
    borderColor: colors.softTeal,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterButtonText: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 12,
  },
  ringWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    alignItems: 'center',
    position: 'absolute',
  },
  ringOverline: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
  },
  ringValue: {
    color: colors.forestInk,
    fontFamily: typography.numbers,
    fontSize: 44,
    lineHeight: 48,
  },
  comparisonHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  comparisonCopy: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  infoButton: {
    padding: 2,
  },
  co2Title: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  statValue: {
    color: colors.forestInk,
    fontFamily: typography.numbers,
    fontSize: 24,
    textAlign: 'center',
  },
  statLabel: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  focusIntro: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
  },
  focusList: {
    gap: spacing.md,
  },
  focusItem: {
    gap: spacing.xs,
  },
  focusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  focusTitle: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 14,
  },
  focusValue: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
  },
  focusTrack: {
    backgroundColor: 'rgba(160,167,162,0.12)',
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
  },
  focusFill: {
    backgroundColor: colors.softTeal,
    borderRadius: 999,
    height: 8,
  },
  focusNote: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(26,31,28,0.18)',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  infoModal: {
    backgroundColor: colors.softWhite,
    borderRadius: 24,
    gap: spacing.sm,
    padding: spacing.lg,
    width: '100%',
  },
  modalClose: {
    alignSelf: 'flex-end',
  },
  infoTitle: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 18,
  },
  infoBody: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 21,
  },
});
