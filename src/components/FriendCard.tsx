import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FriendScore } from '../engine/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { SurfaceCard } from './SurfaceCard';

export const FriendCard = ({
  friend,
  index,
}: {
  friend: FriendScore;
  index: number;
}) => (
  <SurfaceCard>
    <View style={styles.row}>
      <View>
        <Text style={styles.rank}>#{index + 1}</Text>
        <Text style={styles.name}>{friend.name}</Text>
        <Text style={styles.meta}>
          {friend.region} - {friend.sharedBadge}
        </Text>
      </View>
      <View style={styles.scoreWrap}>
        <Text style={styles.score}>{friend.weeklyScore}</Text>
        <Text style={styles.delta}>
          {friend.delta >= 0 ? '+' : ''}
          {friend.delta} this week
        </Text>
        <Text style={styles.meta}>{friend.streak} day streak</Text>
      </View>
    </View>
  </SurfaceCard>
);

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rank: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 12,
  },
  name: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 16,
    marginTop: 2,
  },
  meta: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
    marginTop: spacing.xxs,
  },
  scoreWrap: {
    alignItems: 'flex-end',
  },
  score: {
    color: colors.forestInk,
    fontFamily: typography.numbers,
    fontSize: 28,
  },
  delta: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    marginTop: spacing.xxs,
  },
});
