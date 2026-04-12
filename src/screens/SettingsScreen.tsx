import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PermissionDiagnosticCard } from '../components/PermissionDiagnosticCard';
import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { SurfaceCard } from '../components/SurfaceCard';
import { useAppContext } from '../context/AppContext';
import { summarizeCollectorCoverage } from '../services/collectorCoverage';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const {
    collectorCapabilities,
    permissions,
    liveSignalState,
    permissionDiagnostics,
    refreshPermissionDiagnostics,
  } = useAppContext();
  const coverageSummary = summarizeCollectorCoverage(collectorCapabilities);
  const liveCollectors = coverageSummary.byStatus.live.familyCount;
  const blockedCollectors =
    coverageSummary.byStatus.blocked.familyCount +
    coverageSummary.byStatus.unavailable.familyCount;
  const appUsageSourceLabel =
    liveSignalState.appUsageSource === 'native-module'
      ? 'Native usage bridge'
      : liveSignalState.appUsageSource === 'app-session-journal'
        ? 'App session journal'
        : 'Seeded estimates';

  return (
    <Screen>
      <SurfaceCard>
        <SectionTitle title="Privacy" subtitle="Calm, transparent, and ethical by default" />
        <Text style={styles.body}>
          This app only uses system-provided, user-approved data in the current experience. No hidden tracking, and no external AI APIs.
        </Text>
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle
          title="Permissions"
          subtitle="Current onboarding choices and actual runtime access"
        />
        {Object.entries(permissions).map(([key, value]) => (
          <View key={key} style={styles.row}>
            <Text style={styles.label}>{key}</Text>
            <Text style={styles.value}>{value ? 'Enabled' : 'Disabled'}</Text>
          </View>
        ))}
        <Pressable
          onPress={() => void refreshPermissionDiagnostics()}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Refresh diagnostics</Text>
        </Pressable>
      </SurfaceCard>

      {permissionDiagnostics.map((diagnostic) => (
        <PermissionDiagnosticCard key={diagnostic.id} diagnostic={diagnostic} />
      ))}

      <SurfaceCard>
        <SectionTitle title="Collector readiness" subtitle="How the score is being fed right now" />
        <Text style={styles.body}>
          Live families: {liveCollectors} | Blocked families: {blockedCollectors} |
          Live coverage: {coverageSummary.byStatus.live.outcomeCount}/
          {coverageSummary.totalOutcomes} outcomes
        </Text>
        <Pressable onPress={() => navigation.navigate('DataSources')} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Open Data Sources</Text>
        </Pressable>
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle title="Theme" subtitle="EcoCalm only" />
        <Text style={styles.body}>
          Dark mode is intentionally disabled so the score language stays airy, soft, and consistent across the full app.
        </Text>
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle title="Signal sync" subtitle="Available on-device readings" />
        <Text style={styles.body}>
          Status: {liveSignalState.status}
          {liveSignalState.deviceName ? ` - ${liveSignalState.deviceName}` : ''}
        </Text>
        <Text style={styles.body}>
          App usage source: {appUsageSourceLabel}
          {liveSignalState.appUsageSupportsCategories ? ' | category metrics are available' : ''}
        </Text>
        {liveSignalState.appSessionCount ? (
          <Text style={styles.body}>
            App session journal: {liveSignalState.appSessionMinutes ?? 0} minutes across{' '}
            {liveSignalState.appSessionCount} sessions
            {liveSignalState.appSessionDerived ? ' | screen-time fallback is active' : ''}
          </Text>
        ) : null}
        {liveSignalState.batteryJournalSamples ? (
          <Text style={styles.body}>
            Battery journal: {liveSignalState.batteryJournalSamples} samples today
            {liveSignalState.batteryJournalDerived
              ? ' | charging metrics are journal-backed'
              : ''}
          </Text>
        ) : null}
        <Pressable onPress={() => navigation.navigate('SignalLab')} style={styles.button}>
          <Text style={styles.buttonText}>Open Signal Lab</Text>
        </Pressable>
      </SurfaceCard>
    </Screen>
  );
};

const styles = StyleSheet.create({
  body: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  label: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
  },
  value: {
    color: colors.deepTeal,
    fontFamily: typography.body,
    fontSize: 12,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: colors.softTeal,
    borderRadius: 8,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  buttonText: {
    color: colors.softWhite,
    fontFamily: typography.bodyMedium,
    fontSize: 12,
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    borderColor: colors.softTeal,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  secondaryButtonText: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 12,
  },
});
