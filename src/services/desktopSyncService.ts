import { DeviceProfile } from './deviceProfileService';
import { HistorySnapshot, PermissionState } from '../engine/types';
import { LocalSocialProfile } from './socialProfileService';
import { supabase } from './supabaseClient';

type RemoteDeviceProfileRow = {
  profile_id: string;
  patch: Record<string, unknown>;
  customized_keys: string[];
  synced_at: string;
};

type RemoteAppPreferenceRow = {
  profile_id: string;
  has_completed_onboarding: boolean;
  permissions: PermissionState;
  joined_challenges: string[];
  synced_at: string;
};

type RemoteHistoryRow = {
  profile_id: string;
  snapshot_date: string;
  metrics: HistorySnapshot['metrics'];
  saved_at: string;
};

export interface DesktopSyncPayload {
  profile: LocalSocialProfile;
  deviceProfile: DeviceProfile;
  historySnapshots: HistorySnapshot[];
  hasCompletedOnboarding: boolean;
  permissions: PermissionState;
  joinedChallenges: string[];
}

export interface DesktopSyncPullResult {
  deviceProfile?: DeviceProfile;
  historySnapshots?: HistorySnapshot[];
  hasCompletedOnboarding?: boolean;
  permissions?: PermissionState;
  joinedChallenges?: string[];
}

const sanitizeJsonPatch = (patch: DeviceProfile['patch']) =>
  Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined),
  );

export const pushDesktopSyncState = async ({
  profile,
  deviceProfile,
  historySnapshots,
  hasCompletedOnboarding,
  permissions,
  joinedChallenges,
}: DesktopSyncPayload) => {
  if (!profile.id) {
    throw new Error('Profile id missing');
  }

  const sanitizedHistory = historySnapshots.slice(-30).map((snapshot) => ({
    profile_id: profile.id!,
    snapshot_date: snapshot.metrics.date,
    metrics: snapshot.metrics,
    saved_at: snapshot.savedAt,
  }));

  const [{ error: profileError }, { error: prefsError }, { error: historyError }] =
    await Promise.all([
      supabase.from('device_profiles').upsert(
        {
          profile_id: profile.id,
          patch: sanitizeJsonPatch(deviceProfile.patch),
          customized_keys: deviceProfile.customizedKeys,
        },
        { onConflict: 'profile_id' },
      ),
      supabase.from('app_preferences').upsert(
        {
          profile_id: profile.id,
          has_completed_onboarding: hasCompletedOnboarding,
          permissions,
          joined_challenges: joinedChallenges,
        },
        { onConflict: 'profile_id' },
      ),
      sanitizedHistory.length > 0
        ? supabase.from('metric_history').upsert(sanitizedHistory, {
            onConflict: 'profile_id,snapshot_date',
          })
        : Promise.resolve({ error: null }),
    ]);

  if (profileError) {
    throw profileError;
  }

  if (prefsError) {
    throw prefsError;
  }

  if (historyError) {
    throw historyError;
  }
};

export const pullDesktopSyncState = async (
  profile: LocalSocialProfile,
): Promise<DesktopSyncPullResult> => {
  if (!profile.id) {
    return {};
  }

  const [deviceProfileResult, preferencesResult, historyResult] = await Promise.all([
    supabase
      .from('device_profiles')
      .select('profile_id, patch, customized_keys, synced_at')
      .eq('profile_id', profile.id)
      .maybeSingle<RemoteDeviceProfileRow>(),
    supabase
      .from('app_preferences')
      .select(
        'profile_id, has_completed_onboarding, permissions, joined_challenges, synced_at',
      )
      .eq('profile_id', profile.id)
      .maybeSingle<RemoteAppPreferenceRow>(),
    supabase
      .from('metric_history')
      .select('profile_id, snapshot_date, metrics, saved_at')
      .eq('profile_id', profile.id)
      .order('snapshot_date', { ascending: true })
      .limit(30),
  ]);

  if (deviceProfileResult.error) {
    throw deviceProfileResult.error;
  }

  if (preferencesResult.error) {
    throw preferencesResult.error;
  }

  if (historyResult.error) {
    throw historyResult.error;
  }

  return {
    deviceProfile: deviceProfileResult.data
      ? {
          patch: (deviceProfileResult.data.patch ?? {}) as DeviceProfile['patch'],
          customizedKeys: (deviceProfileResult.data.customized_keys ??
            []) as Array<keyof DeviceProfile['patch']>,
        }
      : undefined,
    hasCompletedOnboarding:
      preferencesResult.data?.has_completed_onboarding ?? undefined,
    permissions: preferencesResult.data?.permissions ?? undefined,
    joinedChallenges: preferencesResult.data?.joined_challenges ?? undefined,
    historySnapshots: ((historyResult.data ?? []) as RemoteHistoryRow[]).map((row) => ({
      metrics: row.metrics,
      savedAt: row.saved_at,
    })),
  };
};
