import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FriendScore, JointChallenge } from '../engine/types';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { SurfaceCard } from './SurfaceCard';

export const JointChallengeCard = ({
  challenge,
  members,
}: {
  challenge: JointChallenge;
  members: FriendScore[];
}) => (
  <SurfaceCard>
    <Text style={styles.title}>{challenge.title}</Text>
    <Text style={styles.body}>{challenge.targetLabel}</Text>
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.max(challenge.progress * 100, 8)}%` }]} />
    </View>
    <Text style={styles.reward}>{challenge.sharedReward}</Text>
    <View style={styles.members}>
      {members.map((member) => (
        <View key={member.id} style={styles.memberChip}>
          <Text style={styles.memberText}>{member.name}</Text>
        </View>
      ))}
    </View>
  </SurfaceCard>
);

const styles = StyleSheet.create({
  title: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 16,
  },
  body: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
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
  reward: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 12,
  },
  members: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  memberChip: {
    backgroundColor: 'rgba(221,235,221,0.6)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  memberText: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 12,
  },
});
