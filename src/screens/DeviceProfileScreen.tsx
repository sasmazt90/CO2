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

type ProfileMetricKey =
  | 'btOnTime'
  | 'btActiveDevices'
  | 'widgetCount'
  | 'liveWallpaperEnabled'
  | 'hotspotDuration'
  | 'vpnUsageTime'
  | 'speakerCallTime'
  | 'avgMusicVolume'
  | 'singleCallDuration'
  | 'callCount'
  | 'btAudioTime'
  | 'notificationsPerDay';

const visualControls: Array<{
  key: Extract<ProfileMetricKey, 'widgetCount'>;
  label: string;
  min: number;
  max: number;
  step: number;
  suffix: string;
}> = [
  { key: 'widgetCount', label: 'Widgets', min: 0, max: 10, step: 1, suffix: '' },
];

const radioControls: Array<{
  key: Extract<ProfileMetricKey, 'btOnTime' | 'btActiveDevices' | 'hotspotDuration' | 'vpnUsageTime'>;
  label: string;
  min: number;
  max: number;
  step: number;
  suffix: string;
}> = [
  { key: 'btOnTime', label: 'Bluetooth on time', min: 0, max: 24, step: 1, suffix: ' h' },
  { key: 'btActiveDevices', label: 'Connected Bluetooth devices', min: 0, max: 4, step: 1, suffix: '' },
  { key: 'hotspotDuration', label: 'Hotspot minutes', min: 0, max: 180, step: 5, suffix: ' min' },
  { key: 'vpnUsageTime', label: 'VPN minutes', min: 0, max: 240, step: 5, suffix: ' min' },
];

const audioControls: Array<{
  key: Extract<
    ProfileMetricKey,
    'speakerCallTime' | 'avgMusicVolume' | 'singleCallDuration' | 'callCount' | 'btAudioTime'
  >;
  label: string;
  min: number;
  max: number;
  step: number;
  suffix: string;
}> = [
  { key: 'speakerCallTime', label: 'Speakerphone minutes', min: 0, max: 60, step: 5, suffix: ' min' },
  { key: 'avgMusicVolume', label: 'Typical music volume', min: 0, max: 1, step: 0.05, suffix: '' },
  { key: 'singleCallDuration', label: 'Longest call', min: 0, max: 120, step: 5, suffix: ' min' },
  { key: 'callCount', label: 'Call count', min: 0, max: 20, step: 1, suffix: '' },
  { key: 'btAudioTime', label: 'Bluetooth audio minutes', min: 0, max: 360, step: 5, suffix: ' min' },
];

const habitControls: Array<{
  key: Extract<ProfileMetricKey, 'widgetCount' | 'vpnUsageTime' | 'notificationsPerDay'>;
  label: string;
  min: number;
  max: number;
  step: number;
  suffix: string;
}> = [
  {
    key: 'notificationsPerDay',
    label: 'Typical notification load',
    min: 0,
    max: 240,
    step: 5,
    suffix: ' / day',
  },
];

export const DeviceProfileScreen = () => {
  const { deviceProfile, todayMetrics, updateDeviceProfile } = useAppContext();

  const [draft, setDraft] = useState<Partial<DailyMetrics>>({
    btOnTime: todayMetrics.btOnTime,
    btActiveDevices: todayMetrics.btActiveDevices,
    widgetCount: todayMetrics.widgetCount,
    liveWallpaperEnabled: todayMetrics.liveWallpaperEnabled,
    hotspotDuration: todayMetrics.hotspotDuration,
    vpnUsageTime: todayMetrics.vpnUsageTime,
    speakerCallTime: todayMetrics.speakerCallTime,
    avgMusicVolume: todayMetrics.avgMusicVolume,
    singleCallDuration: todayMetrics.singleCallDuration,
    callCount: todayMetrics.callCount,
    btAudioTime: todayMetrics.btAudioTime,
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

  return (
    <Screen>
      <SurfaceCard>
        <SectionTitle
          title="Device Profile"
          subtitle="User-confirmed values for metrics the OS does not expose safely"
        />
        <Text style={styles.body}>
          These values are explicit profile inputs, not hidden tracking. They help finish
          stubborn metrics like widgets, live wallpapers, and VPN usage without pretending
          the platform gave us data it did not.
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
        {visualControls.map((control) => (
          <View key={control.key} style={styles.control}>
            <View style={styles.controlHeader}>
              <Text style={styles.label}>{control.label}</Text>
              <Text style={styles.value}>
                {Math.round((draft[control.key] as number) ?? 0)}
                {control.suffix}
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
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle title="Radios & network" subtitle="User-confirmed daily defaults" />
        {radioControls.map((control) => (
          <View key={control.key} style={styles.control}>
            <View style={styles.controlHeader}>
              <Text style={styles.label}>{control.label}</Text>
              <Text style={styles.value}>
                {Math.round((draft[control.key] as number) ?? 0)}
                {control.suffix}
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
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle title="Audio & calls" subtitle="Manual completion for OS-limited surfaces" />
        {audioControls.map((control) => (
          <View key={control.key} style={styles.control}>
            <View style={styles.controlHeader}>
              <Text style={styles.label}>{control.label}</Text>
              <Text style={styles.value}>
                {control.key === 'avgMusicVolume'
                  ? `${Math.round((((draft[control.key] as number) ?? 0) * 100))}%`
                  : `${Math.round((draft[control.key] as number) ?? 0)}${control.suffix}`}
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
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle title="Daily habit defaults" subtitle="Transparent user-entered values" />
        {habitControls.map((control) => (
          <View key={control.key} style={styles.control}>
            <View style={styles.controlHeader}>
              <Text style={styles.label}>{control.label}</Text>
              <Text style={styles.value}>
                {Math.round((draft[control.key] as number) ?? 0)}
                {control.suffix}
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
        ))}
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
