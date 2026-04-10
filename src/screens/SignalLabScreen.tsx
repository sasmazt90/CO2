import Slider from '@react-native-community/slider';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { SurfaceCard } from '../components/SurfaceCard';
import { useAppContext } from '../context/AppContext';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { formatMinutes, formatPercent } from '../utils/formatters';

type MetricControl = {
  key:
    | 'avgBrightness'
    | 'screenTime'
    | 'videoStreamingTime'
    | 'socialMediaTime'
    | 'notificationsPerDay'
    | 'steps'
    | 'timeAt100WhilePlugged'
    | 'mobileDataUsage';
  label: string;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
};

const controls: MetricControl[] = [
  {
    key: 'avgBrightness',
    label: 'Brightness',
    min: 0,
    max: 1,
    step: 0.01,
    format: formatPercent,
  },
  {
    key: 'screenTime',
    label: 'Screen time',
    min: 0,
    max: 360,
    step: 1,
    format: formatMinutes,
  },
  {
    key: 'videoStreamingTime',
    label: 'Video streaming',
    min: 0,
    max: 180,
    step: 1,
    format: formatMinutes,
  },
  {
    key: 'socialMediaTime',
    label: 'Social media time',
    min: 0,
    max: 180,
    step: 1,
    format: formatMinutes,
  },
  {
    key: 'notificationsPerDay',
    label: 'Notifications',
    min: 0,
    max: 220,
    step: 1,
    format: (value) => `${Math.round(value)} / day`,
  },
  {
    key: 'steps',
    label: 'Steps',
    min: 0,
    max: 14000,
    step: 100,
    format: (value) => `${Math.round(value)} steps`,
  },
  {
    key: 'timeAt100WhilePlugged',
    label: 'Time at 100% while plugged',
    min: 0,
    max: 90,
    step: 1,
    format: formatMinutes,
  },
  {
    key: 'mobileDataUsage',
    label: 'Mobile data',
    min: 0,
    max: 1200,
    step: 10,
    format: (value) => `${Math.round(value)} MB`,
  },
];

export const SignalLabScreen = () => {
  const {
    liveSignalState,
    syncLiveSignals,
    todayBreakdown,
    todayMetrics,
    updateTodayMetricPatch,
  } = useAppContext();

  return (
    <Screen>
      <SurfaceCard>
        <SectionTitle title="Signal Lab" subtitle="Blend live device sync with manual calibration" />
        <Text style={styles.body}>
          Use this screen to tune the highest-impact metrics and see the score update immediately. Live sync only fills signals that the device can safely expose.
        </Text>
        <Pressable onPress={() => void syncLiveSignals()} style={styles.button}>
          <Text style={styles.buttonText}>
            {liveSignalState.status === 'syncing' ? 'Syncing...' : 'Sync live signals'}
          </Text>
        </Pressable>
        {liveSignalState.syncedAt ? (
          <Text style={styles.caption}>Last synced: {new Date(liveSignalState.syncedAt).toLocaleString()}</Text>
        ) : null}
        {liveSignalState.notes.map((note) => (
          <Text key={note} style={styles.note}>
            • {note}
          </Text>
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle title="Today right now" subtitle={`Live score: ${todayBreakdown.score}`} />
        {controls.map((control) => (
          <View key={control.key} style={styles.control}>
            <View style={styles.controlHeader}>
              <Text style={styles.controlLabel}>{control.label}</Text>
              <Text style={styles.controlValue}>
                {control.format(todayMetrics[control.key] as number)}
              </Text>
            </View>
            <Slider
              minimumTrackTintColor={colors.softTeal}
              maximumTrackTintColor="rgba(160,167,162,0.18)"
              thumbTintColor={colors.pastelGreen}
              minimumValue={control.min}
              maximumValue={control.max}
              step={control.step}
              value={todayMetrics[control.key] as number}
              onValueChange={(value) =>
                updateTodayMetricPatch({ [control.key]: value } as Partial<typeof todayMetrics>)
              }
            />
          </View>
        ))}
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
  button: {
    alignSelf: 'flex-start',
    backgroundColor: colors.softTeal,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  buttonText: {
    color: colors.softWhite,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
  },
  caption: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
  },
  note: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 18,
  },
  control: {
    gap: spacing.xs,
  },
  controlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlLabel: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
  },
  controlValue: {
    color: colors.deepTeal,
    fontFamily: typography.body,
    fontSize: 12,
  },
});
