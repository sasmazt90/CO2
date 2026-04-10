import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BadgeDefinition } from '../engine/types';
import { gradients, colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const iconByName = {
  leaf: 'leaf-outline',
  sun: 'sunny-outline',
  bolt: 'flash-outline',
  phone: 'phone-portrait-outline',
  footsteps: 'walk-outline',
} as const;

const gradientByLevel = {
  Bronze: gradients.bronze,
  Silver: gradients.silver,
  Gold: gradients.gold,
};

export const BadgeMedal = ({ badge }: { badge: BadgeDefinition }) => (
  <LinearGradient colors={gradientByLevel[badge.level]} style={styles.card}>
    <View style={styles.iconWrap}>
      <Ionicons name={iconByName[badge.icon]} size={22} color={colors.forestInk} />
    </View>
    <Text style={styles.title}>{badge.title}</Text>
    <Text style={styles.subtitle}>{badge.subtitle}</Text>
  </LinearGradient>
);

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: radius.md,
    gap: spacing.xs,
    minWidth: 108,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(248,250,247,0.65)',
    borderRadius: 999,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  title: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 11,
    textAlign: 'center',
  },
});
