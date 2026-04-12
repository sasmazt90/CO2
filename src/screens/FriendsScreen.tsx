import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { FriendCard } from '../components/FriendCard';
import { JointChallengeCard } from '../components/JointChallengeCard';
import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { SharePreviewCard } from '../components/SharePreviewCard';
import { SurfaceCard } from '../components/SurfaceCard';
import { useAppContext } from '../context/AppContext';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type LeaderboardMode = 'friends' | 'regional' | 'global';

export const FriendsScreen = () => {
  const navigation = useNavigation<any>();
  const [mode, setMode] = useState<LeaderboardMode>('friends');
  const [friendCode, setFriendCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [region, setRegion] = useState('');
  const {
    addFriend,
    badges,
    friends,
    jointChallenges,
    leaderboards,
    socialProfile,
    socialSyncStatus,
    streakDays,
    syncSocialGraph,
    todayBreakdown,
    updateSocialProfile,
    weeklyAverageScore,
  } = useAppContext();

  React.useEffect(() => {
    setDisplayName(socialProfile.displayName);
    setRegion(socialProfile.region);
  }, [socialProfile.displayName, socialProfile.region]);

  const activeLeaderboard = leaderboards[mode];
  const jointChallengeMembers = useMemo(
    () =>
      jointChallenges.map((challenge) => ({
        challenge,
        members: friends.filter((friend) => challenge.friendIds.includes(friend.id)),
      })),
    [friends, jointChallenges],
  );

  return (
    <Screen>
      <SurfaceCard>
        <SectionTitle
          title="Your circle"
          subtitle="Real friend code, online sync, and calm social setup"
        />
        <Text style={styles.meta}>
          Your code: {socialProfile.friendCode} | Sync: {socialSyncStatus}
        </Text>
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Display name"
          placeholderTextColor={colors.warmGray}
          style={styles.input}
        />
        <TextInput
          value={region}
          onChangeText={setRegion}
          placeholder="Region"
          placeholderTextColor={colors.warmGray}
          style={styles.input}
        />
        <TextInput
          value={friendCode}
          onChangeText={setFriendCode}
          autoCapitalize="characters"
          placeholder="Enter friend code"
          placeholderTextColor={colors.warmGray}
          style={styles.input}
        />
        <View style={styles.actionRow}>
          <Pressable
            onPress={() => void updateSocialProfile({ displayName, region })}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Save profile</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              void addFriend(friendCode.trim());
              setFriendCode('');
            }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Add friend</Text>
          </Pressable>
          <Pressable onPress={() => void syncSocialGraph()} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Refresh cloud</Text>
          </Pressable>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle
          title="Weekly leaderboard"
          subtitle="Friends, regional, and global score views with calm comparisons"
        />
        <View style={styles.chips}>
          {(['friends', 'regional', 'global'] as const).map((value) => (
            <Pressable
              key={value}
              onPress={() => setMode(value)}
              style={[styles.chip, mode === value && styles.chipActive]}
            >
              <Text style={[styles.chipText, mode === value && styles.chipTextActive]}>
                {value === 'friends'
                  ? 'Friends'
                  : value === 'regional'
                    ? 'Regional'
                    : 'Global'}
              </Text>
            </Pressable>
          ))}
        </View>
        {activeLeaderboard.map((friend, index) => (
          <FriendCard key={friend.id} friend={friend} index={index} />
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle title="Joint challenges" subtitle="Progress you can move together with friends" />
        {jointChallengeMembers.map(({ challenge, members }) => (
          <JointChallengeCard key={challenge.id} challenge={challenge} members={members} />
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle
          title="Share card"
          subtitle="Pastel social preview for achievements and weekly score"
          action={
            <Pressable onPress={() => navigation.navigate('ShareCard')}>
              <Text style={styles.link}>Open</Text>
            </Pressable>
          }
        />
        <View style={styles.shareCard}>
          <SharePreviewCard
            badge={badges[0]}
            score={todayBreakdown.score}
            streak={streakDays}
            weeklyAverage={weeklyAverageScore}
          />
        </View>
      </SurfaceCard>
    </Screen>
  );
};

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  input: {
    borderColor: 'rgba(160,167,162,0.18)',
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 13,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chip: {
    borderColor: 'rgba(160,167,162,0.18)',
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipActive: {
    backgroundColor: colors.softTeal,
    borderColor: colors.softTeal,
  },
  chipText: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 12,
  },
  chipTextActive: {
    color: colors.softWhite,
  },
  link: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
  },
  meta: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 18,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.softTeal,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  primaryButtonText: {
    color: colors.softWhite,
    fontFamily: typography.bodyMedium,
    fontSize: 12,
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    borderColor: colors.softTeal,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  secondaryButtonText: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 12,
  },
  shareCard: {
    gap: spacing.sm,
  },
});
