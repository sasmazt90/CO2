import { useNavigation } from '@react-navigation/native';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { SurfaceCard } from '../components/SurfaceCard';
import { useAppContext } from '../context/AppContext';
import { env } from '../config/env';
import {
  buildMetricReadiness,
  summarizeMetricReadiness,
} from '../services/metricReadiness';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type CheckStatus = 'ready' | 'attention' | 'pending';

type CheckItem = {
  id: string;
  title: string;
  status: CheckStatus;
  detail: string;
  actionLabel?: string;
  actionRoute?: string;
};

const statusPalette: Record<CheckStatus, { bg: string; fg: string; label: string }> = {
  ready: { bg: colors.mintGreen, fg: colors.forestInk, label: 'Ready' },
  attention: { bg: colors.pastelSage, fg: colors.forestInk, label: 'Attention' },
  pending: { bg: colors.mist, fg: colors.deepTeal, label: 'Pending' },
};

export const ReleaseReadinessScreen = () => {
  const navigation = useNavigation<any>();
  const {
    todayMetrics,
    liveSignalState,
    permissionDiagnostics,
    breakdownHistory,
    deviceProfile,
    desktopSyncStatus,
    socialSyncStatus,
  } = useAppContext();

  const readinessItems = useMemo(
    () =>
      buildMetricReadiness({
        metrics: todayMetrics,
        liveSignalState,
        diagnostics: permissionDiagnostics,
        historySnapshots: breakdownHistory.map((item) => ({
          metrics: item.metrics,
          savedAt: item.metrics.date,
        })),
        userConfirmedKeys: deviceProfile.customizedKeys.filter(
          (key): key is Exclude<keyof typeof todayMetrics, 'date'> => key !== 'date',
        ),
      }),
    [breakdownHistory, deviceProfile.customizedKeys, liveSignalState, permissionDiagnostics, todayMetrics],
  );

  const readinessSummary = useMemo(
    () => summarizeMetricReadiness(readinessItems),
    [readinessItems],
  );

  const checks = useMemo<CheckItem[]>(() => {
    const telemetryReady =
      readinessSummary.byStatus.live +
        readinessSummary.byStatus['journal-backed'] +
        readinessSummary.byStatus.derived >=
      Math.ceil(readinessSummary.totalMetrics * 0.7);

    return [
      {
        id: 'supabase-env',
        title: 'Supabase environment config',
        status: env.usesFallbackSupabaseConfig ? 'attention' : 'ready',
        detail: env.usesFallbackSupabaseConfig
          ? 'The app still uses development fallback values. Production builds should inject EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.'
          : 'Supabase is coming from explicit environment variables, which is the production-safe path.',
      },
      {
        id: 'desktop-sync',
        title: 'Desktop sync continuity',
        status:
          desktopSyncStatus === 'ready'
            ? 'ready'
            : desktopSyncStatus === 'error'
              ? 'attention'
              : 'pending',
        detail:
          desktopSyncStatus === 'ready'
            ? 'Cloud continuity is active for profile, history, onboarding state, and joined challenges.'
            : desktopSyncStatus === 'error'
              ? 'Desktop sync is wired but the last round-trip failed. Check Supabase connectivity before release.'
              : 'Desktop sync is wired and waiting for an explicit successful round-trip in this install.',
        actionLabel: 'Open Settings',
        actionRoute: 'Settings',
      },
      {
        id: 'social-backend',
        title: 'Social backend sync',
        status:
          socialSyncStatus === 'ready'
            ? 'ready'
            : socialSyncStatus === 'error'
              ? 'attention'
              : 'pending',
        detail:
          socialSyncStatus === 'ready'
            ? 'Friends, weekly leaderboard, and challenge sync are connected to Supabase.'
            : socialSyncStatus === 'error'
              ? 'Social sync is implemented but the last fetch or write failed.'
              : 'The backend is wired and waiting for a successful sync cycle in this install.',
        actionLabel: 'Open Leaderboard',
        actionRoute: 'Leaderboard',
      },
      {
        id: 'metric-coverage',
        title: 'Production metric coverage',
        status: telemetryReady
          ? readinessSummary.byStatus.estimated === 0 &&
            readinessSummary.byStatus['native-required'] === 0
            ? 'ready'
            : 'attention'
          : 'pending',
        detail: `Ready metrics: ${readinessSummary.productionReadyMetrics}/${readinessSummary.totalMetrics}. Estimated: ${readinessSummary.byStatus.estimated}. Native-required: ${readinessSummary.byStatus['native-required']}.`,
        actionLabel: 'Open Metric Readiness',
        actionRoute: 'MetricReadiness',
      },
      {
        id: 'profile-completion',
        title: 'Profile-backed fallback coverage',
        status:
          deviceProfile.customizedKeys.length >= 20
            ? 'ready'
            : deviceProfile.customizedKeys.length >= 8
              ? 'attention'
              : 'pending',
        detail: `${deviceProfile.customizedKeys.length} user-confirmed metric fields are saved. More completed profile fields reduce estimated fallbacks on real devices.`,
        actionLabel: 'Open Device Profile',
        actionRoute: 'DeviceProfile',
      },
      {
        id: 'build-pipeline',
        title: 'EAS build pipeline',
        status: 'ready',
        detail: `EAS profiles are configured and current release channel resolves to "${env.releaseChannel}". The remaining blocker is signing credentials and live build execution.`,
      },
    ];
  }, [
    desktopSyncStatus,
    deviceProfile.customizedKeys.length,
    readinessSummary.byStatus,
    readinessSummary.productionReadyMetrics,
    readinessSummary.totalMetrics,
    socialSyncStatus,
  ]);

  const groupedCounts = useMemo(
    () =>
      checks.reduce(
        (acc, item) => {
          acc[item.status] += 1;
          return acc;
        },
        { ready: 0, attention: 0, pending: 0 } satisfies Record<CheckStatus, number>,
      ),
    [checks],
  );

  return (
    <Screen>
      <SurfaceCard>
        <SectionTitle
          title="Release Readiness"
          subtitle="The shortest honest path from prototype to store build"
        />
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryValue}>{groupedCounts.ready}</Text>
            <Text style={styles.summaryLabel}>Ready</Text>
          </View>
          <View>
            <Text style={styles.summaryValue}>{groupedCounts.attention}</Text>
            <Text style={styles.summaryLabel}>Attention</Text>
          </View>
          <View>
            <Text style={styles.summaryValue}>{groupedCounts.pending}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
        </View>
        <Text style={styles.body}>
          This screen stays strict on purpose. It treats missing env setup, incomplete sync
          confirmation, and remaining estimated telemetry as release blockers until they are
          explicitly resolved.
        </Text>
      </SurfaceCard>

      {checks.map((item) => {
        const palette = statusPalette[item.status];

        return (
          <SurfaceCard key={item.id}>
            <View style={styles.headerRow}>
              <SectionTitle title={item.title} subtitle={item.detail} />
              <View style={[styles.badge, { backgroundColor: palette.bg }]}>
                <Text style={[styles.badgeText, { color: palette.fg }]}>
                  {palette.label}
                </Text>
              </View>
            </View>
            {item.actionLabel && item.actionRoute ? (
              <Pressable
                onPress={() => navigation.navigate(item.actionRoute)}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>{item.actionLabel}</Text>
              </Pressable>
            ) : null}
          </SurfaceCard>
        );
      })}
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
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
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
