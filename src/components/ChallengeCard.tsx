import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChallengeDefinition, DailyMetrics } from '../engine/types';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { SurfaceCard } from './SurfaceCard';

export const ChallengeCard = ({
  challenge,
  metrics,
  joined,
  onToggle,
}: {
  challenge: ChallengeDefinition;
  metrics: DailyMetrics;
  joined: boolean;
  onToggle: () => void;
}) => {
  const progress = challenge.progress(metrics);

  return (
    <SurfaceCard style={styles.card}>
      <Text style={styles.title}>{challenge.title}</Text>
      <Text style={styles.description}>{challenge.description}</Text>
      <Text style={styles.meta}>{challenge.targetLabel}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.max(progress * 100, 6)}%` }]} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.points}>{challenge.points} reward points</Text>
        <Pressable onPress={onToggle} style={[styles.button, joined && styles.buttonActive]}>
          <Text style={[styles.buttonText, joined && styles.buttonTextActive]}>
            {joined ? 'Joined' : 'Join'}
          </Text>
        </Pressable>
      </View>
    </SurfaceCard>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    width: 288,
  },
  title: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 17,
  },
  description: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
  },
  meta: {
    color: colors.deepTeal,
    fontFamily: typography.body,
    fontSize: 12,
  },
  track: {
    backgroundColor: 'rgba(160,167,162,0.12)',
    borderRadius: radius.sm,
    height: 8,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: colors.pastelGreen,
    borderRadius: radius.sm,
    height: 8,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  points: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
  },
  button: {
    borderColor: colors.softTeal,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  buttonActive: {
    backgroundColor: colors.softTeal,
  },
  buttonText: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 12,
  },
  buttonTextActive: {
    color: colors.softWhite,
  },
});
