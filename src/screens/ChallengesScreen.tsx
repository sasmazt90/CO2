import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ChallengeCard } from '../components/ChallengeCard';
import { InlineAdBanner } from '../components/InlineAdBanner';
import { JointChallengeCard } from '../components/JointChallengeCard';
import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { SurfaceCard } from '../components/SurfaceCard';
import { useAppContext } from '../context/AppContext';
import { metricGroups } from '../data/metricCatalog';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type CustomChallengeDraft = {
  title: string;
  group: (typeof metricGroups)[number];
  duration: 'weekly' | 'monthly';
  invitedFriendIds: string[];
};

export const ChallengesScreen = () => {
  const {
    acceptInvite,
    availableChallenges,
    cancelInvite,
    challengeInvites,
    friends,
    inviteToChallenge,
    joinedChallenges,
    jointChallenges,
    socialProfile,
    todayMetrics,
    toggleChallenge,
  } = useAppContext();
  const [draft, setDraft] = React.useState<CustomChallengeDraft>({
    title: 'Custom footprint challenge',
    group: metricGroups[0],
    duration: 'weekly',
    invitedFriendIds: [],
  });

  const incomingInvites = challengeInvites.filter(
    (invite) => invite.inviteeProfileId === socialProfile.id && invite.status === 'pending',
  );
  const outgoingInvites = challengeInvites.filter(
    (invite) => invite.creatorProfileId === socialProfile.id && invite.status === 'pending',
  );

  const createCustomChallenge = async () => {
    if (draft.invitedFriendIds.length === 0) {
      Alert.alert(
        'Add at least one friend',
        'Invite at least one friend before creating a shared challenge.',
      );
      return;
    }

    const title = `${draft.group} ${draft.duration === 'weekly' ? 'Sprint' : 'Cycle'}`;
    const targetLabel = `${draft.duration === 'weekly' ? '7-day' : '30-day'} shared challenge in ${draft.group}`;
    let sharedChallengeKey: string | undefined;

    for (const friendId of draft.invitedFriendIds) {
      const nextKey = await inviteToChallenge(undefined, friendId, {
        customTitle: title,
        customTargetLabel: targetLabel,
        customGroup: draft.group,
        duration: draft.duration,
        challengeKey: sharedChallengeKey,
      });

      if (!sharedChallengeKey && nextKey) {
        sharedChallengeKey = nextKey;
      }
    }

    setDraft({
      title: 'Custom footprint challenge',
      group: metricGroups[0],
      duration: 'weekly',
      invitedFriendIds: [],
    });
  };

  return (
    <Screen>
      <SurfaceCard>
        <SectionTitle title="Weekly challenges" subtitle="Swipe through ready-made footprint challenges" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
          {availableChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              joined={joinedChallenges.includes(challenge.id)}
              metrics={todayMetrics}
              onToggle={() => toggleChallenge(challenge.id)}
            />
          ))}
        </ScrollView>
      </SurfaceCard>

      <InlineAdBanner placement="challengesBanner" />

      {incomingInvites.length > 0 ? (
        <SurfaceCard>
          <SectionTitle title="Invitations" subtitle="Accept shared challenges before they start" />
          {incomingInvites.map((invite) => (
            <View key={invite.id} style={styles.inviteCard}>
              <Text style={styles.customTitle}>{invite.title}</Text>
              <Text style={styles.subtle}>
                {invite.creatorName} invited you • {invite.duration}
              </Text>
              <Text style={styles.subtle}>{invite.targetLabel}</Text>
              <View style={styles.actionRow}>
                <Pressable onPress={() => void acceptInvite(invite.id)} style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Accept</Text>
                </Pressable>
                <Pressable onPress={() => void cancelInvite(invite.id)} style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Decline</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </SurfaceCard>
      ) : null}

      <SurfaceCard>
        <SectionTitle title="Create challenge" subtitle="Invite friends into a weekly or monthly challenge you define" />
        <View style={styles.selectorRow}>
          {metricGroups.map((group) => (
            <Text
              key={group}
              onPress={() => setDraft((current) => ({ ...current, group }))}
              style={[styles.chip, draft.group === group && styles.chipActive]}
            >
              {group}
            </Text>
          ))}
        </View>
        <View style={styles.selectorRow}>
          {(['weekly', 'monthly'] as const).map((duration) => (
            <Text
              key={duration}
              onPress={() => setDraft((current) => ({ ...current, duration }))}
              style={[styles.chip, draft.duration === duration && styles.chipActive]}
            >
              {duration}
            </Text>
          ))}
        </View>
        <Text style={styles.subtle}>Invited friends stay in waiting state until they accept.</Text>
        <View style={styles.selectorRow}>
          {friends.map((friend) => {
            const selected = draft.invitedFriendIds.includes(friend.id);
            return (
              <Text
                key={friend.id}
                onPress={() =>
                  setDraft((current) => ({
                    ...current,
                    invitedFriendIds: selected
                      ? current.invitedFriendIds.filter((item) => item !== friend.id)
                      : [...current.invitedFriendIds, friend.id],
                  }))
                }
                style={[styles.chip, selected && styles.chipActive]}
              >
                {friend.name}
              </Text>
            );
          })}
        </View>
        <Pressable onPress={() => void createCustomChallenge()} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Create custom challenge</Text>
        </Pressable>
      </SurfaceCard>

      {outgoingInvites.length > 0 ? (
        <SurfaceCard>
          <SectionTitle title="Waiting invites" subtitle="You can remove invitees until everyone has accepted" />
          {outgoingInvites.map((invite) => (
            <View key={invite.id} style={styles.inviteCard}>
              <Text style={styles.customTitle}>{invite.title}</Text>
              <Text style={styles.subtle}>
                Waiting for {invite.inviteeName} • {invite.duration}
              </Text>
              <Text style={styles.subtle}>{invite.targetLabel}</Text>
              <Pressable onPress={() => void cancelInvite(invite.id)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          ))}
        </SurfaceCard>
      ) : null}

      <SurfaceCard>
        <SectionTitle title="Play together" subtitle="Swipe through the shared challenges already in motion" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
          {jointChallenges.map((challenge) => {
            const members = friends.filter((friend) => challenge.friendIds.includes(friend.id));
            const inviteCandidates = friends.filter((friend) => !challenge.friendIds.includes(friend.id));

            return (
              <JointChallengeCard
                key={challenge.id}
                challenge={challenge}
                members={members}
                inviteDisabled={inviteCandidates.length === 0}
                onInvite={
                  inviteCandidates.length === 0
                    ? undefined
                    : () => {
                        if (inviteCandidates.length === 1) {
                          void inviteToChallenge(challenge.challengeId, inviteCandidates[0].id);
                          return;
                        }

                        Alert.alert('Invite friend', 'Choose who to invite to this challenge.', [
                          ...inviteCandidates.slice(0, 3).map((friend) => ({
                            text: friend.name,
                            onPress: () => {
                              void inviteToChallenge(challenge.challengeId, friend.id);
                            },
                          })),
                          { text: 'Cancel', style: 'cancel' as const },
                        ]);
                      }
                }
              />
            );
          })}
        </ScrollView>
      </SurfaceCard>
    </Screen>
  );
};

const styles = StyleSheet.create({
  carousel: {
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  selectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderColor: colors.softTeal,
    borderRadius: 999,
    borderWidth: 1,
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.softTeal,
    color: colors.softWhite,
  },
  subtle: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.softTeal,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  primaryButtonText: {
    color: colors.softWhite,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    borderColor: colors.softTeal,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  secondaryButtonText: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
  },
  inviteCard: {
    borderColor: 'rgba(160,167,162,0.14)',
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  customTitle: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 15,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  cancelText: {
    color: '#A45858',
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    marginTop: spacing.xs,
  },
});
