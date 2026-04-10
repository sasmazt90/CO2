import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BreakdownRow } from '../components/BreakdownRow';
import { GroupBar } from '../components/GroupBar';
import { ScoreRing } from '../components/ScoreRing';
import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { SurfaceCard } from '../components/SurfaceCard';
import { TrendChart } from '../components/TrendChart';
import { useAppContext } from '../context/AppContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { formatKgCo2 } from '../utils/formatters';

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { todayBreakdown, breakdownHistory, carbonPoints, streakDays } = useAppContext();
  const trendData = breakdownHistory.map((item) => ({
    date: item.breakdown.date,
    value: item.breakdown.score,
  }));

  return (
    <Screen>
      <SurfaceCard>
        <Text style={styles.eyebrow}>Today&apos;s Digital Carbon Score</Text>
        <ScoreRing
          score={todayBreakdown.score}
          label={formatKgCo2(todayBreakdown.estimatedKgCo2)}
          secondary={todayBreakdown.primaryInsight}
        />
        <View style={styles.statsRow}>
          <View>
            <Text style={styles.statValue}>{carbonPoints}</Text>
            <Text style={styles.statLabel}>CarbonPoints</Text>
          </View>
          <View>
            <Text style={styles.statValue}>{streakDays}</Text>
            <Text style={styles.statLabel}>Streak days</Text>
          </View>
          <View>
            <Text style={styles.statValue}>{todayBreakdown.entries.length}</Text>
            <Text style={styles.statLabel}>Triggered rules</Text>
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle
          title="7-day trend"
          subtitle="How the score moved through the past week"
          action={
            <Pressable onPress={() => navigation.navigate('History')}>
              <Text style={styles.link}>Open</Text>
            </Pressable>
          }
        />
        <TrendChart data={trendData} />
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle title="Emission breakdown" subtitle="Estimated contribution by category group" />
        {todayBreakdown.groupBreakdown.map((item) => (
          <GroupBar key={item.group} item={item} />
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle
          title="Quick insight"
          subtitle="Your calm coach is focusing on the biggest levers first"
          action={
            <Pressable onPress={() => navigation.navigate('Insights')}>
              <Text style={styles.link}>View Tips</Text>
            </Pressable>
          }
        />
        {todayBreakdown.topImprovementAreas.map((entry) => (
          <BreakdownRow key={entry.id} entry={entry} />
        ))}
      </SurfaceCard>
    </Screen>
  );
};

const styles = StyleSheet.create({
  eyebrow: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
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
  link: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
  },
});
