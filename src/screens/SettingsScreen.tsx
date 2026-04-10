import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { SurfaceCard } from '../components/SurfaceCard';
import { useAppContext } from '../context/AppContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const { permissions, liveSignalState } = useAppContext();

  return (
    <Screen>
      <SurfaceCard>
        <SectionTitle title="Privacy" subtitle="Calm, transparent, and ethical by default" />
        <Text style={styles.body}>
          This app only uses system-provided, user-approved data in the current experience. No hidden tracking, and no external AI APIs.
        </Text>
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle title="Permissions" subtitle="Current onboarding choices" />
        {Object.entries(permissions).map(([key, value]) => (
          <View key={key} style={styles.row}>
            <Text style={styles.label}>{key}</Text>
            <Text style={styles.value}>{value ? 'Enabled' : 'Disabled'}</Text>
          </View>
        ))}
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
          {liveSignalState.deviceName ? ` • ${liveSignalState.deviceName}` : ''}
        </Text>
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
});
