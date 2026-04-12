import { CarbonScoreBreakdown, FriendScore, JointChallenge } from '../engine/types';
import { leaderboardEntries, jointChallenges as fallbackJointChallenges } from '../data/friends';
import { challenges } from '../data/challenges';
import {
  LocalSocialProfile,
  saveLocalSocialProfile,
} from './socialProfileService';
import { supabase } from './supabaseClient';

type RemoteProfileRow = {
  id: string;
  friend_code: string;
  display_name: string;
  region: string;
  created_at: string;
  updated_at: string;
};

type RemoteSnapshotRow = {
  profile_id: string;
  cohort: 'friends' | 'regional' | 'global';
  weekly_score: number;
  streak: number;
  delta: number;
  shared_badge: string;
  week_start: string;
  region: string;
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

export interface SocialSyncResult {
  profile: LocalSocialProfile;
  friends: FriendScore[];
  leaderboards: {
    friends: FriendScore[];
    regional: FriendScore[];
    global: FriendScore[];
  };
  jointChallenges: JointChallenge[];
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
  region: snapshot.region,
  weeklyScore: snapshot.weekly_score,
  streak: snapshot.streak,
  sharedBadge: snapshot.shared_badge,
  delta: snapshot.delta,
  cohort,
});

const dedupeFriendships = (
  rows: RemoteFriendshipRow[],
  selfId: string,
) => {
  const ids = new Set<string>();

  for (const row of rows) {
    if (row.status !== 'accepted') {
      continue;
    }

    ids.add(row.requester_id === selfId ? row.addressee_id : row.requester_id);
  }

  return Array.from(ids);
};

export const ensureRemoteProfile = async (
  profile: LocalSocialProfile,
): Promise<LocalSocialProfile> => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: profile.id,
        friend_code: profile.friendCode,
        display_name: profile.displayName,
        region: profile.region,
      },
      { onConflict: 'friend_code' },
    )
    .select('id, friend_code, display_name, region, created_at, updated_at')
    .single<RemoteProfileRow>();

  if (error || !data) {
    throw error ?? new Error('Profile upsert failed');
  }

  const nextProfile: LocalSocialProfile = {
    id: data.id,
    friendCode: data.friend_code,
    displayName: data.display_name,
    region: data.region,
  };
  await saveLocalSocialProfile(nextProfile);
  return nextProfile;
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
  const normalizedCode = friendCode.trim().toUpperCase();
  const { data: friend, error: friendError } = await supabase
    .from('profiles')
    .select('id, friend_code')
    .eq('friend_code', normalizedCode)
    .single<{ id: string; friend_code: string }>();

  if (friendError || !friend) {
    throw friendError ?? new Error('Friend not found');
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
};

export const fetchSocialState = async (
  profile: LocalSocialProfile,
): Promise<SocialSyncResult> => {
  if (!profile.id) {
    return {
      profile,
      friends: leaderboardEntries.filter((item) => item.cohort === 'friends'),
      leaderboards: {
        friends: leaderboardEntries.filter((item) => item.cohort === 'friends'),
        regional: leaderboardEntries.filter((item) => item.cohort === 'regional'),
        global: leaderboardEntries.filter((item) => item.cohort === 'global'),
      },
      jointChallenges: fallbackJointChallenges,
    };
  }

  const weekStart = startOfWeekIso();

  const [
    friendshipsResult,
    snapshotsResult,
    challengeResult,
    regionalResult,
    globalResult,
  ] = await Promise.all([
    supabase
      .from('friendships')
      .select('requester_id, addressee_id, status')
      .or(`requester_id.eq.${profile.id},addressee_id.eq.${profile.id}`),
    supabase
      .from('weekly_snapshots')
      .select(
        'profile_id, cohort, weekly_score, streak, delta, shared_badge, week_start, region, display_name, friend_code',
      )
      .eq('week_start', weekStart),
    supabase
      .from('challenge_memberships')
      .select('profile_id, challenge_id, progress'),
    supabase
      .from('leaderboard_weekly')
      .select('*')
      .eq('cohort', 'regional')
      .limit(10),
    supabase
      .from('leaderboard_weekly')
      .select('*')
      .eq('cohort', 'global')
      .limit(10),
  ]);

  if (friendshipsResult.error) throw friendshipsResult.error;
  if (snapshotsResult.error) throw snapshotsResult.error;
  if (challengeResult.error) throw challengeResult.error;
  if (regionalResult.error) throw regionalResult.error;
  if (globalResult.error) throw globalResult.error;

  const friendIds = dedupeFriendships(
    (friendshipsResult.data ?? []) as RemoteFriendshipRow[],
    profile.id,
  );

  const snapshotRows = (snapshotsResult.data ?? []) as RemoteSnapshotRow[];
  const friendRows = snapshotRows.filter((row) => friendIds.includes(row.profile_id));
  const friends = friendRows
    .map((row) => mapSnapshotToFriendScore(row, 'friends'))
    .sort((left, right) => right.weeklyScore - left.weeklyScore);

  const challengeRows = (challengeResult.data ?? []) as RemoteChallengeRow[];
  const remoteJointChallenges: JointChallenge[] = challengeRows
    .filter((row) => friendIds.includes(row.profile_id))
    .map((row) => ({
      id: `remote-${row.challenge_id}-${row.profile_id}`,
      challengeId: row.challenge_id,
      title:
        challenges.find((challenge) => challenge.id === row.challenge_id)?.title ??
        row.challenge_id,
      friendIds: [row.profile_id],
      progress: row.progress,
      targetLabel:
        challenges.find((challenge) => challenge.id === row.challenge_id)?.targetLabel ??
        'Shared progress',
      sharedReward: '+60 team CarbonPoints',
    }));

  return {
    profile,
    friends,
    leaderboards: {
      friends,
      regional:
        ((regionalResult.data ?? []) as RemoteSnapshotRow[]).map((row) =>
          mapSnapshotToFriendScore(row, 'regional'),
        ) || [],
      global:
        ((globalResult.data ?? []) as RemoteSnapshotRow[]).map((row) =>
          mapSnapshotToFriendScore(row, 'global'),
        ) || [],
    },
    jointChallenges: remoteJointChallenges.length > 0 ? remoteJointChallenges : fallbackJointChallenges,
  };
};
