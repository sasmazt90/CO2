import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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

export const BadgeMedal = ({
  badge,
  unlocked = true,
  onPress,
}: {
  badge: BadgeDefinition;
  unlocked?: boolean;
  onPress?: () => void;
}) => (
  <Pressable disabled={!onPress} onPress={onPress}>
    <LinearGradient
      colors={unlocked ? gradientByLevel[badge.level] : ['#EEF2EF', '#E2E8E3']}
      style={[styles.card, !unlocked && styles.cardLocked]}
    >
      <View style={[styles.iconWrap, !unlocked && styles.iconWrapLocked]}>
        <Ionicons name={iconByName[badge.icon]} size={22} color={colors.forestInk} />
      </View>
      <Text style={styles.title}>{badge.title}</Text>
      <Text style={styles.subtitle}>{badge.subtitle}</Text>
    </LinearGradient>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: radius.md,
    gap: spacing.xs,
    minWidth: 132,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  cardLocked: {
    opacity: 0.58,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(248,250,247,0.65)',
    borderRadius: 999,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  iconWrapLocked: {
    backgroundColor: 'rgba(248,250,247,0.92)',
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
