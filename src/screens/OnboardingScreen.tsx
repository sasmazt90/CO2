import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandLogo } from '../components/BrandLogo';
import { Screen } from '../components/Screen';
import { useAppContext } from '../context/AppContext';
import { PermissionState } from '../engine/types';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const onboardingCards = [
  {
    title: 'A gentle daily carbon coach',
    body: 'Digital Carbon Footprint Score turns device behavior and lifestyle signals into one calm daily score with clear, supportive next steps.',
  },
  {
    title: 'Transparent and local-first',
    body: 'Every score change shows the exact rule, recommendation, and scientific source behind it. No hidden tracking, no external AI APIs.',
  },
  {
    title: 'Small habits, visible progress',
    body: 'Challenges, badges, trends, and social comparisons help good habits stick without guilt-heavy messaging.',
  },
];

const permissionLabels: { key: keyof PermissionState; title: string; subtitle: string }[] = [
  {
    key: 'screenTime',
    title: 'Screen time data',
    subtitle: 'Used for screen-time, app-usage, and idle-display estimates.',
  },
  {
    key: 'motion',
    title: 'Activity & motion',
    subtitle: 'Used for step trends, movement cues, and travel habit coaching.',
  },
  {
    key: 'location',
    title: 'Location (optional)',
    subtitle: 'Used only for mobility patterns and transport suggestions.',
  },
  {
    key: 'notifications',
    title: 'Notifications',
    subtitle: 'Used for burst analysis and calm notification coaching.',
  },
];

export const OnboardingScreen = () => {
  const { completeOnboarding } = useAppContext();
  const [permissions, setPermissions] = useState<PermissionState>({
    screenTime: true,
    motion: true,
    location: true,
    notifications: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const completedCount = useMemo(
    () => Object.values(permissions).filter(Boolean).length,
    [permissions],
  );

  return (
    <Screen>
      <LinearGradient colors={['rgba(255,255,255,0.7)', 'rgba(221,235,221,0.82)']} style={styles.hero}>
        <BrandLogo size={60} />
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>Digital Carbon Footprint Score</Text>
          <Text style={styles.heroBody}>
            Daily carbon score, scientific transparency, and eco-positive coaching in one calm mobile experience.
          </Text>
        </View>
      </LinearGradient>

      {onboardingCards.map((card) => (
        <View key={card.title} style={styles.infoCard}>
          <Text style={styles.cardTitle}>{card.title}</Text>
          <Text style={styles.cardBody}>{card.body}</Text>
        </View>
      ))}

      <View style={styles.permissionCard}>
        <Text style={styles.cardTitle}>Choose what the app can read</Text>
        <Text style={styles.cardBody}>
          Only system-provided, user-approved signals are used. Results stay on-device in this prototype flow.
        </Text>
        {permissionLabels.map((item) => (
          <Pressable
            key={item.key}
            onPress={() =>
              setPermissions((current) => ({ ...current, [item.key]: !current[item.key] }))
            }
            style={[
              styles.permissionRow,
              permissions[item.key] && styles.permissionRowActive,
            ]}
          >
            <View style={styles.permissionCopy}>
              <Text style={styles.permissionTitle}>{item.title}</Text>
              <Text style={styles.permissionSubtitle}>{item.subtitle}</Text>
            </View>
            <View style={[styles.switch, permissions[item.key] && styles.switchActive]}>
              <View
                style={[
                  styles.switchThumb,
                  permissions[item.key] && styles.switchThumbActive,
                ]}
              />
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerNote}>{completedCount}/4 permissions selected</Text>
        <Pressable
          disabled={submitting}
          onPress={async () => {
            setSubmitting(true);
            await completeOnboarding(permissions);
          }}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>
            {submitting ? 'Preparing...' : 'Start my calm score'}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius.md,
    gap: spacing.md,
    padding: spacing.lg,
  },
  heroCopy: {
    gap: spacing.xs,
  },
  heroTitle: {
    color: colors.forestInk,
    fontFamily: typography.title,
    fontSize: 28,
  },
  heroBody: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: 'rgba(248,250,247,0.8)',
    borderColor: 'rgba(160,167,162,0.1)',
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  permissionCard: {
    backgroundColor: 'rgba(248,250,247,0.88)',
    borderColor: 'rgba(160,167,162,0.12)',
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  cardTitle: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 18,
  },
  cardBody: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  permissionRow: {
    alignItems: 'center',
    borderColor: 'rgba(160,167,162,0.12)',
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    padding: spacing.sm,
  },
  permissionRowActive: {
    borderColor: 'rgba(137,210,198,0.4)',
    backgroundColor: 'rgba(179,229,201,0.25)',
  },
  permissionCopy: {
    flex: 1,
    gap: 2,
  },
  permissionTitle: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 14,
  },
  permissionSubtitle: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
  },
  switch: {
    backgroundColor: 'rgba(160,167,162,0.2)',
    borderRadius: 999,
    height: 28,
    justifyContent: 'center',
    paddingHorizontal: 3,
    width: 50,
  },
  switchActive: {
    backgroundColor: colors.softTeal,
  },
  switchThumb: {
    backgroundColor: colors.softWhite,
    borderRadius: 999,
    height: 22,
    width: 22,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  footer: {
    gap: spacing.sm,
  },
  footerNote: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: colors.softTeal,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  primaryButtonText: {
    color: colors.softWhite,
    fontFamily: typography.bodyMedium,
    fontSize: 15,
    textAlign: 'center',
  },
});
