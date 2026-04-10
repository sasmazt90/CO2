import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BadgeMedal } from '../components/BadgeMedal';
import { FriendCard } from '../components/FriendCard';
import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { SurfaceCard } from '../components/SurfaceCard';
import { useAppContext } from '../context/AppContext';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const FriendsScreen = () => {
  const { badges, friends, weeklyAverageScore } = useAppContext();

  return (
    <Screen>
      <SurfaceCard>
        <SectionTitle title="Weekly leaderboard" subtitle="Friends view with soft ranking bars and calm comparisons" />
        {friends.map((friend, index) => (
          <FriendCard key={friend.id} friend={friend} index={index} />
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle title="Share card" subtitle="Pastel social preview for achievements and weekly score" />
        <View style={styles.shareCard}>
          <Text style={styles.shareEyebrow}>This week</Text>
          <Text style={styles.shareScore}>{weeklyAverageScore}</Text>
          <Text style={styles.shareCopy}>Soft progress, lower emissions, and a steadier digital rhythm.</Text>
          {badges[0] ? <BadgeMedal badge={badges[0]} /> : null}
        </View>
      </SurfaceCard>
    </Screen>
  );
};

const styles = StyleSheet.create({
  shareCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(221,235,221,0.55)',
    borderRadius: radius.md,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  shareEyebrow: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 12,
  },
  shareScore: {
    color: colors.forestInk,
    fontFamily: typography.numbers,
    fontSize: 48,
  },
  shareCopy: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
});
