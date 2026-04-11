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
import { summarizeCollectorCoverage } from '../services/collectorCoverage';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { formatKgCo2 } from '../utils/formatters';

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const {
    todayBreakdown,
    breakdownHistory,
    carbonPoints,
    collectorCapabilities,
    streakDays,
    liveSignalState,
    notificationFeed,
    syncLiveSignals,
  } = useAppContext();
  const coverageSummary = summarizeCollectorCoverage(collectorCapabilities);
  const liveCollectors = coverageSummary.byStatus.live.familyCount;
  const nativeCollectors = coverageSummary.byStatus['native-required'].familyCount;
  const trendData = breakdownHistory.slice(-7).map((item) => ({
    date: item.breakdown.date,
    value: item.breakdown.score,
  }));

  return (
    <Screen>
      <SurfaceCard>
        <SectionTitle
          title="Collector readiness"
          subtitle={`${liveCollectors} live families covering ${coverageSummary.byStatus.live.outcomeCount}/${coverageSummary.totalOutcomes} outcomes`}
          action={
            <Pressable onPress={() => navigation.navigate('DataSources')}>
              <Text style={styles.link}>Open</Text>
            </Pressable>
          }
        />
        <Text style={styles.signalCopy}>
          {nativeCollectors} families still wait on native bridges, while the rest
          stay transparent as live or estimated inputs.
        </Text>
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle
          title="Live signals"
          subtitle={liveSignalState.syncedAt ? `Synced ${new Date(liveSignalState.syncedAt).toLocaleTimeString()}` : 'No live sync yet'}
          action={
            <Pressable onPress={() => navigation.navigate('SignalLab')}>
              <Text style={styles.link}>Signal Lab</Text>
            </Pressable>
          }
        />
        <Text style={styles.signalCopy}>
          {liveSignalState.notes[0] ??
            "Use live sync to pull available device signals into today's score."}
        </Text>
        <Pressable onPress={() => void syncLiveSignals()} style={styles.syncButton}>
          <Text style={styles.syncButtonText}>
            {liveSignalState.status === 'syncing' ? 'Syncing...' : 'Sync now'}
          </Text>
        </Pressable>
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle
          title="Today&apos;s notification queue"
          subtitle={`${notificationFeed.filter((item) => !item.read).length} unread rule updates`}
          action={
            <Pressable onPress={() => navigation.navigate('NotificationCenter')}>
              <Text style={styles.link}>Open</Text>
            </Pressable>
          }
        />
        <Text style={styles.signalCopy}>
          {notificationFeed[0]?.body ??
            'Triggered rules will appear here with calm guidance and scientific attribution.'}
        </Text>
      </SurfaceCard>

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
  signalCopy: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
  },
  syncButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.pastelGreen,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  syncButtonText: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 12,
  },
});
