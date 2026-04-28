import {
  CarbonScoreBreakdown,
  ChallengeInvite,
  FriendScore,
  JointChallenge,
  ScoreGroup,
  SocialEvent,
} from '../engine/types';
import { leaderboardEntries, jointChallenges as fallbackJointChallenges } from '../data/friends';
import { challenges } from '../data/challenges';
import { LocalSocialProfile, saveLocalSocialProfile } from './socialProfileService';
import { supabase } from './supabaseClient';

type RemoteProfileRow = {
  id: string;
  friend_code: string;
  display_name: string;
  city: string | null;
  region: string;
  country: string | null;
  created_at: string;
  updated_at: string;
};

type RemoteSnapshotRow = {
  profile_id: string;
  cohort: 'friends' | 'city' | 'regional' | 'country' | 'global';
  weekly_score: number;
  streak: number;
  delta: number;
  shared_badge: string;
  week_start: string;
  city: string;
  region: string;
  country: string;
  display_name: string;
  friend_code: string;
};

type RemoteFriendshipRow = {
  requester_id: string;
  addressee_id: string;
  status: 'accepted' | 'pending';
};

type RemoteChallengeRow = {
  profile_id: string;
  challenge_id: string;
  progress: number;
};

type RemoteSocialEventRow = {
  id: string;
  profile_id: string;
  actor_profile_id: string | null;
  event_type: 'friend_added' | 'challenge_invited';
  event_key: string;
  payload: Record<string, unknown>;
  created_at: string;
};

type RemoteInviteRow = {
  id: string;
  challenge_key: string;
  challenge_id: string | null;
  title: string;
  target_label: string;
  group_name: string;
  duration: 'weekly' | 'monthly';
  creator_profile_id: string;
  invitee_profile_id: string;
  status: 'pending' | 'accepted' | 'cancelled';
  created_at: string;
  creator_name?: string;
  invitee_name?: string;
};

export interface SocialSyncResult {
  profile: LocalSocialProfile;
  friends: FriendScore[];
  leaderboards: {
    friends: FriendScore[];
    city: FriendScore[];
    regional: FriendScore[];
    country: FriendScore[];
    global: FriendScore[];
  };
  jointChallenges: JointChallenge[];
  socialEvents: SocialEvent[];
  challengeInvites: ChallengeInvite[];
}

const startOfWeekIso = () => {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date.toISOString().slice(0, 10);
};

const mapSnapshotToFriendScore = (
  snapshot: RemoteSnapshotRow,
  cohort: FriendScore['cohort'],
): FriendScore => ({
  id: snapshot.profile_id,
  name: snapshot.display_name,
  city: snapshot.city,
  region: snapshot.region,
  country: snapshot.country,
  weeklyScore: snapshot.weekly_score,
  streak: snapshot.streak,
  sharedBadge: snapshot.shared_badge,
  delta: snapshot.delta,
  cohort,
});

const dedupeFriendships = (rows: RemoteFriendshipRow[], selfId: string) => {
  const ids = new Set<string>();

  for (const row of rows) {
    if (row.status !== 'accepted') {
      continue;
    }

    ids.add(row.requester_id === selfId ? row.addressee_id : row.requester_id);
  }

  return Array.from(ids);
};

const profileFromRemote = (data: RemoteProfileRow): LocalSocialProfile => ({
  id: data.id,
  friendCode: data.friend_code,
  displayName: data.display_name,
  city: data.city ?? data.region ?? 'Munich',
  region: data.region ?? 'Bavaria',
  country: data.country ?? 'Germany',
});

const buildFallbackLeaderboards = (profile: LocalSocialProfile) => ({
  friends: leaderboardEntries.filter((item) => item.cohort === 'friends'),
  city: leaderboardEntries.filter((item) => item.cohort === 'city' && item.city === profile.city),
  regional: leaderboardEntries.filter((item) => item.cohort === 'regional'),
  country: leaderboardEntries.filter(
    (item) => item.cohort === 'country' && item.country === profile.country,
  ),
  global: leaderboardEntries.filter((item) => item.cohort === 'global'),
});

const hydrateInviteNames = (
  invites: RemoteInviteRow[],
  snapshots: RemoteSnapshotRow[],
  fallbackFriends: FriendScore[],
  selfProfile: LocalSocialProfile,
) => {
  const nameById = new Map<string, string>();

  snapshots.forEach((row) => {
    nameById.set(row.profile_id, row.display_name);
  });
  fallbackFriends.forEach((friend) => {
    nameById.set(friend.id, friend.name);
  });
  if (selfProfile.id) {
    nameById.set(selfProfile.id, selfProfile.displayName);
  }

  return invites.map((invite) => ({
    id: invite.id,
    challengeKey: invite.challenge_key,
    challengeId: invite.challenge_id,
    title: invite.title,
    targetLabel: invite.target_label,
    group: invite.group_name as ScoreGroup | 'Habits',
    duration: invite.duration,
    creatorProfileId: invite.creator_profile_id,
    creatorName: nameById.get(invite.creator_profile_id) ?? 'Friend',
    inviteeProfileId: invite.invitee_profile_id,
    inviteeName: nameById.get(invite.invitee_profile_id) ?? 'Friend',
    status: invite.status,
    createdAt: invite.created_at,
  })) as ChallengeInvite[];
};

export const ensureRemoteProfile = async (profile: LocalSocialProfile): Promise<LocalSocialProfile> => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: profile.id,
        friend_code: profile.friendCode,
        display_name: profile.displayName,
        city: profile.city,
        region: profile.region,
        country: profile.country,
      },
      { onConflict: 'friend_code' },
    )
    .select('id, friend_code, display_name, city, region, country, created_at, updated_at')
    .single<RemoteProfileRow>();

  if (error || !data) {
    throw error ?? new Error('Profile upsert failed');
  }

  const nextProfile = profileFromRemote(data);
  await saveLocalSocialProfile(nextProfile);
  return nextProfile;
};

export const lookupProfileByCode = async (friendCode: string): Promise<LocalSocialProfile | null> => {
  const normalizedCode = friendCode.trim().toUpperCase();

  if (!normalizedCode) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, friend_code, display_name, city, region, country, created_at, updated_at')
    .eq('friend_code', normalizedCode)
    .maybeSingle<RemoteProfileRow>();

  if (error) {
    throw error;
  }

  return data ? profileFromRemote(data) : null;
};

export const syncWeeklySnapshot = async ({
  profile,
  breakdown,
  weeklyAverageScore,
  streakDays,
  sharedBadge,
}: {
  profile: LocalSocialProfile;
  breakdown: CarbonScoreBreakdown;
  weeklyAverageScore: number;
  streakDays: number;
  sharedBadge: string;
}) => {
  if (!profile.id) {
    throw new Error('Profile id missing');
  }

  const weekStart = startOfWeekIso();

  const { error } = await supabase.from('weekly_snapshots').upsert(
    {
      profile_id: profile.id,
      week_start: weekStart,
      weekly_score: weeklyAverageScore,
      streak: streakDays,
      delta: breakdown.score - weeklyAverageScore,
      shared_badge: sharedBadge,
      cohort: 'friends',
    },
    { onConflict: 'profile_id,week_start' },
  );

  if (error) {
    throw error;
  }
};

export const syncJoinedChallenges = async ({
  profileId,
  joinedChallengeIds,
  todayMetrics,
}: {
  profileId: string;
  joinedChallengeIds: string[];
  todayMetrics: Parameters<(typeof challenges)[number]['progress']>[0];
}) => {
  const rows = joinedChallengeIds.map((challengeId) => {
    const challenge = challenges.find((item) => item.id === challengeId);

    return {
      profile_id: profileId,
      challenge_id: challengeId,
      progress: challenge ? challenge.progress(todayMetrics) : 0,
    };
  });

  const { error: deleteError } = await supabase
    .from('challenge_memberships')
    .delete()
    .eq('profile_id', profileId);

  if (deleteError) {
    throw deleteError;
  }

  if (rows.length === 0) {
    return;
  }

  const { error } = await supabase.from('challenge_memberships').insert(rows);

  if (error) {
    throw error;
  }
};

export const addFriendByCode = async ({
  profileId,
  friendCode,
}: {
  profileId: string;
  friendCode: string;
}) => {
  const friend = await lookupProfileByCode(friendCode);

  if (!friend?.id) {
    throw new Error('Friend not found');
  }

  if (friend.id === profileId) {
    throw new Error('You cannot add yourself');
  }

  const requesterId = profileId < friend.id ? profileId : friend.id;
  const addresseeId = profileId < friend.id ? friend.id : profileId;

  const { error } = await supabase.from('friendships').upsert(
    {
      requester_id: requesterId,
      addressee_id: addresseeId,
      status: 'accepted',
    },
    { onConflict: 'requester_id,addressee_id' },
  );

  if (error) {
    throw error;
  }

  const eventRows = [
    {
      profile_id: profileId,
      actor_profile_id: friend.id,
      event_type: 'friend_added',
      event_key: `friend-added:${profileId}:${friend.id}`,
      payload: {
        friendId: friend.id,
        friendCode: friend.friendCode,
        displayName: friend.displayName,
      },
    },
    {
      profile_id: friend.id,
      actor_profile_id: profileId,
      event_type: 'friend_added',
      event_key: `friend-added:${friend.id}:${profileId}`,
      payload: {
        friendId: profileId,
      },
    },
  ];

  const { error: eventError } = await supabase
    .from('social_events')
    .upsert(eventRows, { onConflict: 'event_key' });

  if (eventError) {
    throw eventError;
  }
};

export const inviteFriendToChallenge = async ({
  actorProfileId,
  challengeId,
  friendId,
  customTitle,
  customTargetLabel,
  customGroup,
  duration = 'weekly',
  challengeKey,
}: {
  actorProfileId: string;
  challengeId?: string;
  friendId: string;
  customTitle?: string;
  customTargetLabel?: string;
  customGroup?: ScoreGroup | 'Habits';
  duration?: 'weekly' | 'monthly';
  challengeKey?: string;
}) => {
  const challenge = challengeId ? challenges.find((item) => item.id === challengeId) : undefined;

  if (!challenge && !customTitle) {
    throw new Error('Challenge not found');
  }

  const resolvedKey = challengeKey ?? `${challengeId ?? 'custom'}:${actorProfileId}:${Date.now()}`;
  const resolvedTitle = challenge?.title ?? customTitle ?? 'Custom challenge';
  const resolvedTarget = challenge?.targetLabel ?? customTargetLabel ?? 'Shared progress';
  const resolvedGroup = challenge?.group ?? customGroup ?? 'Behavioral';

  const { error: inviteError } = await supabase.from('challenge_invites').upsert(
    {
      challenge_key: resolvedKey,
      challenge_id: challenge?.id ?? null,
      title: resolvedTitle,
      target_label: resolvedTarget,
      group_name: resolvedGroup,
      duration,
      creator_profile_id: actorProfileId,
      invitee_profile_id: friendId,
      status: 'pending',
    },
    { onConflict: 'challenge_key,invitee_profile_id' },
  );

  if (inviteError) {
    throw inviteError;
  }

  const { error } = await supabase.from('social_events').upsert(
    {
      profile_id: friendId,
      actor_profile_id: actorProfileId,
      event_type: 'challenge_invited',
      event_key: `challenge-invite:${friendId}:${actorProfileId}:${resolvedKey}`,
      payload: {
        challengeId: challenge?.id ?? null,
        challengeTitle: resolvedTitle,
        targetLabel: resolvedTarget,
        challengeKey: resolvedKey,
      },
    },
    { onConflict: 'event_key' },
  );

  if (error) {
    throw error;
  }

  return resolvedKey;
};

const activateChallengeIfReady = async (challengeKey: string) => {
  const { data, error } = await supabase
    .from('challenge_invites')
    .select(
      'id, challenge_key, challenge_id, title, target_label, group_name, duration, creator_profile_id, invitee_profile_id, status, created_at',
    )
    .eq('challenge_key', challengeKey);

  if (error) {
    throw error;
  }

  const invites = (data ?? []) as RemoteInviteRow[];

  if (invites.length === 0 || invites.some((invite) => invite.status !== 'accepted')) {
    return;
  }

  const memberIds = Array.from(
    new Set([
      invites[0].creator_profile_id,
      ...invites.map((invite) => invite.invitee_profile_id),
    ]),
  );

  const membershipRows = memberIds.map((profileId) => ({
    profile_id: profileId,
    challenge_id: invites[0].challenge_id ?? invites[0].challenge_key,
    progress: 0,
  }));

  const { error: membershipError } = await supabase
    .from('challenge_memberships')
    .upsert(membershipRows, { onConflict: 'profile_id,challenge_id' });

  if (membershipError) {
    throw membershipError;
  }
};

export const acceptChallengeInvite = async (inviteId: string) => {
  const { data, error } = await supabase
    .from('challenge_invites')
    .update({ status: 'accepted' })
    .eq('id', inviteId)
    .select(
      'id, challenge_key, challenge_id, title, target_label, group_name, duration, creator_profile_id, invitee_profile_id, status, created_at',
    )
    .single<RemoteInviteRow>();

  if (error || !data) {
    throw error ?? new Error('Invite update failed');
  }

  await activateChallengeIfReady(data.challenge_key);
};

export const cancelChallengeInvite = async (inviteId: string) => {
  const { error } = await supabase
    .from('challenge_invites')
    .update({ status: 'cancelled' })
    .eq('id', inviteId);

  if (error) {
    throw error;
  }
};

export const fetchSocialState = async (profile: LocalSocialProfile): Promise<SocialSyncResult> => {
  if (!profile.id) {
    const leaderboards = buildFallbackLeaderboards(profile);
    return {
      profile,
      friends: leaderboards.friends,
      leaderboards,
      jointChallenges: fallbackJointChallenges,
      socialEvents: [],
      challengeInvites: [],
    };
  }

  const weekStart = startOfWeekIso();

  const [
    friendshipsResult,
    snapshotsResult,
    challengeResult,
    socialEventsResult,
    inviteResult,
  ] = await Promise.all([
    supabase
      .from('friendships')
      .select('requester_id, addressee_id, status')
      .or(`requester_id.eq.${profile.id},addressee_id.eq.${profile.id}`),
    supabase
      .from('leaderboard_weekly')
      .select(
        'profile_id, cohort, weekly_score, streak, delta, shared_badge, week_start, city, region, country, display_name, friend_code',
      )
      .eq('week_start', weekStart),
    supabase.from('challenge_memberships').select('profile_id, challenge_id, progress'),
    supabase
      .from('social_events')
      .select('id, profile_id, actor_profile_id, event_type, event_key, payload, created_at')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('challenge_invites')
      .select(
        'id, challenge_key, challenge_id, title, target_label, group_name, duration, creator_profile_id, invitee_profile_id, status, created_at',
      )
      .or(`creator_profile_id.eq.${profile.id},invitee_profile_id.eq.${profile.id}`)
      .order('created_at', { ascending: false }),
  ]);

  if (friendshipsResult.error) throw friendshipsResult.error;
  if (snapshotsResult.error) throw snapshotsResult.error;
  if (challengeResult.error) throw challengeResult.error;
  if (socialEventsResult.error) throw socialEventsResult.error;
  if (inviteResult.error) throw inviteResult.error;

  const snapshotRows = (snapshotsResult.data ?? []) as RemoteSnapshotRow[];
  const friendIds = dedupeFriendships(
    (friendshipsResult.data ?? []) as RemoteFriendshipRow[],
    profile.id,
  );

  const friendRows = snapshotRows.filter((row) => friendIds.includes(row.profile_id));
  const friends = friendRows
    .map((row) => mapSnapshotToFriendScore(row, 'friends'))
    .sort((left, right) => right.weeklyScore - left.weeklyScore);

  const leaderboards = {
    friends,
    city: snapshotRows
      .filter((row) => row.city === profile.city)
      .map((row) => mapSnapshotToFriendScore(row, 'city'))
      .sort((left, right) => right.weeklyScore - left.weeklyScore),
    regional: snapshotRows
      .filter((row) => row.region === profile.region)
      .map((row) => mapSnapshotToFriendScore(row, 'regional'))
      .sort((left, right) => right.weeklyScore - left.weeklyScore),
    country: snapshotRows
      .filter((row) => row.country === profile.country)
      .map((row) => mapSnapshotToFriendScore(row, 'country'))
      .sort((left, right) => right.weeklyScore - left.weeklyScore),
    global: snapshotRows
      .map((row) => mapSnapshotToFriendScore(row, 'global'))
      .sort((left, right) => right.weeklyScore - left.weeklyScore),
  };

  const inviteRows = (inviteResult.data ?? []) as RemoteInviteRow[];
  const inviteMetaByKey = new Map(
    inviteRows.map((invite) => [
      invite.challenge_id ?? invite.challenge_key,
      invite,
    ]),
  );
  const challengeRows = (challengeResult.data ?? []) as RemoteChallengeRow[];
  const remoteJointChallenges: JointChallenge[] = challengeRows
    .filter((row) => friendIds.includes(row.profile_id))
    .map((row) => ({
      id: `remote-${row.challenge_id}-${row.profile_id}`,
      challengeId: row.challenge_id,
      title:
        challenges.find((challenge) => challenge.id === row.challenge_id)?.title ??
        inviteMetaByKey.get(row.challenge_id)?.title ??
        row.challenge_id,
      friendIds: [row.profile_id],
      progress: row.progress,
      targetLabel:
        challenges.find((challenge) => challenge.id === row.challenge_id)?.targetLabel ??
        inviteMetaByKey.get(row.challenge_id)?.target_label ??
        'Shared progress',
      sharedReward: '+60 reward points',
    }));

  const fallbackLeaderboards = buildFallbackLeaderboards(profile);
  const challengeInvites = hydrateInviteNames(
    inviteRows,
    snapshotRows,
    fallbackLeaderboards.friends,
    profile,
  );

  return {
    profile,
    friends,
    leaderboards: {
      friends: leaderboards.friends.length > 0 ? leaderboards.friends : fallbackLeaderboards.friends,
      city: leaderboards.city.length > 0 ? leaderboards.city : fallbackLeaderboards.city,
      regional:
        leaderboards.regional.length > 0 ? leaderboards.regional : fallbackLeaderboards.regional,
      country: leaderboards.country.length > 0 ? leaderboards.country : fallbackLeaderboards.country,
      global: leaderboards.global.length > 0 ? leaderboards.global : fallbackLeaderboards.global,
    },
    jointChallenges:
      remoteJointChallenges.length > 0 ? remoteJointChallenges : fallbackJointChallenges,
    socialEvents: ((socialEventsResult.data ?? []) as RemoteSocialEventRow[]).map((event) => ({
      id: event.id,
      profileId: event.profile_id,
      actorProfileId: event.actor_profile_id,
      eventType: event.event_type,
      eventKey: event.event_key,
      payload: event.payload ?? {},
      createdAt: event.created_at,
    })),
    challengeInvites,
  };
};
