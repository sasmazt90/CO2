import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { SurfaceCard } from '../components/SurfaceCard';
import { useAppContext } from '../context/AppContext';
import {
  getNativeAppUsageBridgeStatus,
  getNativeAppUsageSnapshotAsync,
  openNativeAppUsageSettingsAsync,
} from '../services/appUsageCollector';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const metricRows = [
  { label: 'Screen time', key: 'screenTime' },
  { label: 'Social media', key: 'socialMediaTime' },
  { label: 'Video streaming', key: 'videoStreamingTime' },
  { label: 'Heavy app opens', key: 'heavyAppOpens' },
  { label: 'Unused apps', key: 'unusedAppsCount' },
  { label: 'Mobile data', key: 'mobileDataUsage', suffix: ' MB' },
] as const;

export const UsageAccessScreen = () => {
  const { liveSignalState, todayMetrics, refreshPermissionDiagnostics } = useAppContext();
  const [snapshotMetrics, setSnapshotMetrics] = useState<string[]>([]);
  const bridgeStatus = getNativeAppUsageBridgeStatus();
  const sourceLabel =
    liveSignalState.appUsageSource === 'native-module'
      ? 'Native usage bridge'
      : liveSignalState.appUsageSource === 'app-session-journal'
        ? 'App session journal'
        : 'Seeded estimates';

  const loadSnapshot = async () => {
    const snapshot = await getNativeAppUsageSnapshotAsync();
    setSnapshotMetrics(snapshot?.providedMetrics ?? []);
  };

  useEffect(() => {
    void loadSnapshot();
  }, []);

  return (
    <Screen>
      <SurfaceCard>
        <SectionTitle
          title="Usage Access"
          subtitle="How app usage reaches the score on this device"
        />
        <View style={styles.row}>
          <Text style={styles.label}>Platform</Text>
          <Text style={styles.value}>{bridgeStatus.platform}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Bridge installed</Text>
          <Text style={styles.value}>{bridgeStatus.installed ? 'Yes' : 'No'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Device-wide support</Text>
          <Text style={styles.value}>
            {bridgeStatus.supportsDeviceWideUsage ? 'Available' : 'Limited'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Access granted</Text>
          <Text style={styles.value}>{bridgeStatus.accessGranted ? 'Yes' : 'No'}</Text>
        </View>
        <Text style={styles.metricLine}>
          Supported native metrics:{' '}
          {bridgeStatus.supportedMetrics.length > 0
            ? bridgeStatus.supportedMetrics.join(', ')
            : 'none yet'}
        </Text>
        <Text style={styles.body}>{bridgeStatus.note}</Text>
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle
          title="Current source"
          subtitle="What is feeding screen-related metrics right now"
        />
        <Text style={styles.body}>
          Source: {sourceLabel}
          {liveSignalState.appUsageSupportsCategories ? ' | category metrics are active' : ''}
        </Text>
        <Text style={styles.metricLine}>
          Metrics in last native snapshot:{' '}
          {snapshotMetrics.length > 0 ? snapshotMetrics.join(', ') : 'none'}
        </Text>
        {metricRows.map((row) => (
          <View key={row.key} style={styles.row}>
            <Text style={styles.label}>{row.label}</Text>
            <Text style={styles.value}>
              {todayMetrics[row.key]}
              {'suffix' in row && row.suffix ? row.suffix : ''}
            </Text>
          </View>
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle
          title="Next step"
          subtitle="Stay calm and keep the data path explicit"
        />
        <Text style={styles.body}>
          If Android usage access is available, enabling it lets the native bridge supply
          device-wide totals for screen time, social media, and streaming. If not, the app
          keeps using the local session journal and seeded fallbacks.
        </Text>
        {bridgeStatus.supportedMetrics.includes('mobileDataUsageMb') ? (
          <Text style={styles.metricLine}>
            Mobile data starts counting from the first native bridge sync of each day, so
            earlier syncs make the daily baseline more faithful.
          </Text>
        ) : null}
        {bridgeStatus.canOpenSettings ? (
          <Pressable
            onPress={() => void openNativeAppUsageSettingsAsync()}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Open usage access settings</Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={() => {
            void refreshPermissionDiagnostics();
            void loadSnapshot();
          }}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Refresh status</Text>
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
  metricLine: {
    color: colors.deepTeal,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 18,
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
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.softTeal,
    borderRadius: 8,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  primaryButtonText: {
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
