import Slider from '@react-native-community/slider';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { SurfaceCard } from '../components/SurfaceCard';
import { useAppContext } from '../context/AppContext';
import { DailyMetrics } from '../engine/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type SliderControlKey =
  | 'avgBrightness'
  | 'idleScreenOn'
  | 'backgroundActiveApps'
  | 'backgroundComputeTime'
  | 'btOnTime'
  | 'btActiveDevices'
  | 'avgTemp'
  | 'cpuHighUsage'
  | 'cloudSyncSessions'
  | 'steps'
  | 'socialMediaTime'
  | 'videoStreamingTime'
  | 'mobileDataUsage'
  | 'heavyAppOpens'
  | 'unusedAppsCount'
  | 'mobileUpdatesData'
  | 'multiDeviceSyncEvents'
  | 'backupRunsPerDay'
  | 'largeMobileTransfers'
  | 'autoplayVideosCount'
  | 'lowSignalTime'
  | 'radioHighPowerTime'
  | 'widgetCount'
  | 'hotspotDuration'
  | 'vpnUsageTime'
  | 'speakerCallTime'
  | 'avgMusicVolume'
  | 'musicListeningTime'
  | 'singleCallDuration'
  | 'callCount'
  | 'btAudioTime'
  | 'cameraUsage'
  | 'arAppUsage'
  | 'gyroActiveApps'
  | 'proximityActiveTime'
  | 'faceIDUnlocks'
  | 'duplicateMedia'
  | 'compressionTasks'
  | 'timeAt100WhilePlugged'
  | 'chargingBetween00_06'
  | 'chargeSessions'
  | 'fastChargeSessions'
  | 'timeBelow20'
  | 'timeAbove80'
  | 'notificationsPerDay';

type ToggleControlKey = 'liveWallpaperEnabled' | 'recorded4KVideo';

type ProfileMetricKey = SliderControlKey | ToggleControlKey;

type SliderControl = {
  key: SliderControlKey;
  label: string;
  min: number;
  max: number;
  step: number;
  suffix: string;
};

const visualControls: SliderControl[] = [
  { key: 'avgBrightness', label: 'Typical brightness', min: 0, max: 1, step: 0.05, suffix: '' },
  { key: 'idleScreenOn', label: 'Idle screen-on time', min: 0, max: 60, step: 1, suffix: ' min' },
  { key: 'widgetCount', label: 'Widgets', min: 0, max: 10, step: 1, suffix: '' },
];

const systemControls: SliderControl[] = [
  { key: 'avgTemp', label: 'Typical device temperature', min: 30, max: 45, step: 1, suffix: ' C' },
  { key: 'backgroundActiveApps', label: 'Background active apps', min: 0, max: 20, step: 1, suffix: '' },
  { key: 'backgroundComputeTime', label: 'Background compute time', min: 0, max: 240, step: 5, suffix: ' min' },
  { key: 'cpuHighUsage', label: 'CPU spike count', min: 0, max: 24, step: 1, suffix: '' },
];

const networkControls: SliderControl[] = [
  { key: 'btOnTime', label: 'Bluetooth on time', min: 0, max: 24, step: 1, suffix: ' h' },
  { key: 'btActiveDevices', label: 'Connected Bluetooth devices', min: 0, max: 4, step: 1, suffix: '' },
  { key: 'hotspotDuration', label: 'Hotspot minutes', min: 0, max: 180, step: 5, suffix: ' min' },
  { key: 'vpnUsageTime', label: 'VPN minutes', min: 0, max: 240, step: 5, suffix: ' min' },
  { key: 'largeMobileTransfers', label: 'Large mobile transfers', min: 0, max: 2000, step: 25, suffix: ' MB' },
  { key: 'autoplayVideosCount', label: 'Autoplay videos', min: 0, max: 20, step: 1, suffix: '' },
  { key: 'lowSignalTime', label: 'Weak signal time', min: 0, max: 240, step: 5, suffix: ' min' },
  { key: 'radioHighPowerTime', label: 'High-power radio time', min: 0, max: 240, step: 5, suffix: ' min' },
];

const audioControls: SliderControl[] = [
  { key: 'speakerCallTime', label: 'Speakerphone minutes', min: 0, max: 60, step: 5, suffix: ' min' },
  { key: 'avgMusicVolume', label: 'Typical music volume', min: 0, max: 1, step: 0.05, suffix: '' },
  { key: 'musicListeningTime', label: 'Music listening time', min: 0, max: 360, step: 5, suffix: ' min' },
  { key: 'singleCallDuration', label: 'Longest call', min: 0, max: 120, step: 5, suffix: ' min' },
  { key: 'callCount', label: 'Call count', min: 0, max: 20, step: 1, suffix: '' },
  { key: 'btAudioTime', label: 'Bluetooth audio minutes', min: 0, max: 360, step: 5, suffix: ' min' },
];

const cloudControls: SliderControl[] = [
  { key: 'steps', label: 'Typical step count', min: 0, max: 15000, step: 250, suffix: '' },
  { key: 'socialMediaTime', label: 'Social media time', min: 0, max: 360, step: 5, suffix: ' min' },
  { key: 'videoStreamingTime', label: 'Video streaming time', min: 0, max: 360, step: 5, suffix: ' min' },
  { key: 'mobileDataUsage', label: 'Mobile data usage', min: 0, max: 2000, step: 25, suffix: ' MB' },
  { key: 'heavyAppOpens', label: 'Heavy app opens', min: 0, max: 30, step: 1, suffix: '' },
  { key: 'unusedAppsCount', label: 'Unused apps count', min: 0, max: 30, step: 1, suffix: '' },
  { key: 'notificationsPerDay', label: 'Typical notification load', min: 0, max: 240, step: 5, suffix: ' / day' },
  { key: 'cloudSyncSessions', label: 'Cloud sync sessions', min: 0, max: 8, step: 1, suffix: '' },
  { key: 'mobileUpdatesData', label: 'Updates over mobile', min: 0, max: 500, step: 10, suffix: ' MB' },
  { key: 'multiDeviceSyncEvents', label: 'Multi-device sync events', min: 0, max: 12, step: 1, suffix: '' },
  { key: 'backupRunsPerDay', label: 'Backups per day', min: 0, max: 4, step: 1, suffix: '' },
];

const sensorControls: SliderControl[] = [
  { key: 'cameraUsage', label: 'Camera usage', min: 0, max: 180, step: 5, suffix: ' min' },
  { key: 'arAppUsage', label: 'AR usage', min: 0, max: 90, step: 5, suffix: ' min' },
  { key: 'gyroActiveApps', label: 'Gyro-heavy app sessions', min: 0, max: 12, step: 1, suffix: '' },
  { key: 'proximityActiveTime', label: 'Proximity active time', min: 0, max: 120, step: 5, suffix: ' min' },
  { key: 'faceIDUnlocks', label: 'Biometric unlock count', min: 0, max: 150, step: 1, suffix: '' },
  { key: 'duplicateMedia', label: 'Duplicate media items', min: 0, max: 300, step: 5, suffix: '' },
  { key: 'compressionTasks', label: 'Compression tasks', min: 0, max: 20, step: 1, suffix: '' },
];

const chargingControls: SliderControl[] = [
  { key: 'timeAt100WhilePlugged', label: 'Time at 100% while plugged', min: 0, max: 240, step: 5, suffix: ' min' },
  { key: 'chargingBetween00_06', label: 'Charging between 00:00-06:00', min: 0, max: 360, step: 5, suffix: ' min' },
  { key: 'chargeSessions', label: 'Charge sessions', min: 0, max: 8, step: 1, suffix: '' },
  { key: 'fastChargeSessions', label: 'Fast charge sessions', min: 0, max: 6, step: 1, suffix: '' },
  { key: 'timeBelow20', label: 'Time below 20%', min: 0, max: 300, step: 5, suffix: ' min' },
  { key: 'timeAbove80', label: 'Time above 80%', min: 0, max: 300, step: 5, suffix: ' min' },
];

const formatSliderValue = (key: SliderControlKey, value: number, suffix: string) => {
  if (key === 'avgMusicVolume') {
    return `${Math.round(value * 100)}%`;
  }

  if (key === 'avgBrightness') {
    return `${Math.round(value * 100)}%`;
  }

  return `${Math.round(value)}${suffix}`;
};

export const DeviceProfileScreen = () => {
  const { deviceProfile, todayMetrics, updateDeviceProfile } = useAppContext();

  const [draft, setDraft] = useState<Partial<DailyMetrics>>({
    backgroundActiveApps: todayMetrics.backgroundActiveApps,
    backgroundComputeTime: todayMetrics.backgroundComputeTime,
    avgBrightness: todayMetrics.avgBrightness,
    avgTemp: todayMetrics.avgTemp,
    idleScreenOn: todayMetrics.idleScreenOn,
    btOnTime: todayMetrics.btOnTime,
    btActiveDevices: todayMetrics.btActiveDevices,
    cpuHighUsage: todayMetrics.cpuHighUsage,
    cloudSyncSessions: todayMetrics.cloudSyncSessions,
    steps: todayMetrics.steps,
    socialMediaTime: todayMetrics.socialMediaTime,
    videoStreamingTime: todayMetrics.videoStreamingTime,
    mobileDataUsage: todayMetrics.mobileDataUsage,
    heavyAppOpens: todayMetrics.heavyAppOpens,
    unusedAppsCount: todayMetrics.unusedAppsCount,
    mobileUpdatesData: todayMetrics.mobileUpdatesData,
    multiDeviceSyncEvents: todayMetrics.multiDeviceSyncEvents,
    backupRunsPerDay: todayMetrics.backupRunsPerDay,
    largeMobileTransfers: todayMetrics.largeMobileTransfers,
    autoplayVideosCount: todayMetrics.autoplayVideosCount,
    lowSignalTime: todayMetrics.lowSignalTime,
    radioHighPowerTime: todayMetrics.radioHighPowerTime,
    widgetCount: todayMetrics.widgetCount,
    liveWallpaperEnabled: todayMetrics.liveWallpaperEnabled,
    hotspotDuration: todayMetrics.hotspotDuration,
    vpnUsageTime: todayMetrics.vpnUsageTime,
    speakerCallTime: todayMetrics.speakerCallTime,
    avgMusicVolume: todayMetrics.avgMusicVolume,
    musicListeningTime: todayMetrics.musicListeningTime,
    singleCallDuration: todayMetrics.singleCallDuration,
    callCount: todayMetrics.callCount,
    btAudioTime: todayMetrics.btAudioTime,
    recorded4KVideo: todayMetrics.recorded4KVideo,
    cameraUsage: todayMetrics.cameraUsage,
    arAppUsage: todayMetrics.arAppUsage,
    gyroActiveApps: todayMetrics.gyroActiveApps,
    proximityActiveTime: todayMetrics.proximityActiveTime,
    faceIDUnlocks: todayMetrics.faceIDUnlocks,
    duplicateMedia: todayMetrics.duplicateMedia,
    compressionTasks: todayMetrics.compressionTasks,
    timeAt100WhilePlugged: todayMetrics.timeAt100WhilePlugged,
    chargingBetween00_06: todayMetrics.chargingBetween00_06,
    chargeSessions: todayMetrics.chargeSessions,
    fastChargeSessions: todayMetrics.fastChargeSessions,
    timeBelow20: todayMetrics.timeBelow20,
    timeAbove80: todayMetrics.timeAbove80,
    notificationsPerDay: todayMetrics.notificationsPerDay,
    ...deviceProfile.patch,
  });

  const customizedKeys = useMemo(
    () =>
      Object.entries(draft)
        .filter(([, value]) => value !== undefined)
        .map(([key]) => key as keyof DailyMetrics),
    [draft],
  );

  const renderSlider = (control: SliderControl) => (
    <View key={control.key} style={styles.control}>
      <View style={styles.controlHeader}>
        <Text style={styles.label}>{control.label}</Text>
        <Text style={styles.value}>
          {formatSliderValue(control.key, (draft[control.key] as number) ?? 0, control.suffix)}
        </Text>
      </View>
      <Slider
        minimumTrackTintColor={colors.softTeal}
        maximumTrackTintColor="rgba(160,167,162,0.18)"
        thumbTintColor={colors.pastelGreen}
        minimumValue={control.min}
        maximumValue={control.max}
        step={control.step}
        value={(draft[control.key] as number) ?? 0}
        onValueChange={(value) =>
          setDraft((current) => ({ ...current, [control.key]: value }))
        }
      />
    </View>
  );

  return (
    <Screen>
      <SurfaceCard>
        <SectionTitle
          title="Device Profile"
          subtitle="User-confirmed values for metrics the OS does not expose safely"
        />
        <Text style={styles.body}>
          These values are explicit profile inputs, not hidden tracking. They help finish
          stubborn metrics without pretending the platform gave us data it did not.
        </Text>
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle title="Visual setup" subtitle="Home screen energy surfaces" />
        <View style={styles.row}>
          <Text style={styles.label}>Live wallpaper enabled</Text>
          <Switch
            value={Boolean(draft.liveWallpaperEnabled)}
            onValueChange={(value) =>
              setDraft((current) => ({ ...current, liveWallpaperEnabled: value }))
            }
            thumbColor={colors.softWhite}
            trackColor={{ false: colors.line, true: colors.softTeal }}
          />
        </View>
        {visualControls.map(renderSlider)}
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle title="System load" subtitle="Manual completion for background surfaces" />
        {systemControls.map(renderSlider)}
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle title="Radios & network" subtitle="User-confirmed daily defaults" />
        {networkControls.map(renderSlider)}
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle title="Audio & calls" subtitle="Manual completion for OS-limited surfaces" />
        {audioControls.map(renderSlider)}
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle title="Cloud habits" subtitle="Daily network defaults you can confirm" />
        {cloudControls.map(renderSlider)}
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle title="Charging habits" subtitle="Manual completion for battery cadence" />
        {chargingControls.map(renderSlider)}
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle title="Sensors & capture" subtitle="Manual confirmation for high-cost events" />
        <View style={styles.row}>
          <Text style={styles.label}>4K video recorded today</Text>
          <Switch
            value={Boolean(draft.recorded4KVideo)}
            onValueChange={(value) =>
              setDraft((current) => ({ ...current, recorded4KVideo: value }))
            }
            thumbColor={colors.softWhite}
            trackColor={{ false: colors.line, true: colors.softTeal }}
          />
        </View>
        {sensorControls.map(renderSlider)}
        <Pressable
          onPress={() => void updateDeviceProfile(draft, customizedKeys)}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Save device profile</Text>
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
  },
  control: {
    gap: spacing.xs,
  },
  controlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
    flex: 1,
    paddingRight: spacing.sm,
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
});
