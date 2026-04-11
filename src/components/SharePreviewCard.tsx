import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BadgeDefinition } from '../engine/types';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { BadgeMedal } from './BadgeMedal';
import { BrandLogo } from './BrandLogo';

export const SharePreviewCard = ({
  score,
  weeklyAverage,
  streak,
  badge,
}: {
  score: number;
  weeklyAverage: number;
  streak: number;
  badge?: BadgeDefinition;
}) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <BrandLogo size={42} />
      <View>
        <Text style={styles.title}>Digital Carbon Footprint Score</Text>
        <Text style={styles.subtitle}>Weekly eco-positive snapshot</Text>
      </View>
    </View>
    <View style={styles.heroRow}>
      <View>
        <Text style={styles.eyebrow}>This week</Text>
        <Text style={styles.score}>{weeklyAverage}</Text>
      </View>
      <View style={styles.stats}>
        <Text style={styles.stat}>Today {score}</Text>
        <Text style={styles.stat}>{streak} day streak</Text>
      </View>
    </View>
    <Text style={styles.copy}>
      Softer habits, lower waste, and calmer digital energy this week.
    </Text>
    {badge ? <BadgeMedal badge={badge} /> : null}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F8FAF7',
    borderColor: 'rgba(160,167,162,0.12)',
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  title: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 18,
  },
  subtitle: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
    marginTop: 2,
  },
  heroRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 12,
  },
  score: {
    color: colors.forestInk,
    fontFamily: typography.numbers,
    fontSize: 54,
    lineHeight: 58,
  },
  stats: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  stat: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 13,
  },
  copy: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
});
