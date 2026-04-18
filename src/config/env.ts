const FALLBACK_SUPABASE_URL = 'https://jbgzyvgiespdwllohgfl.supabase.co';
const FALLBACK_SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_kjxLU6g5QYhhDvCV2Ah5Ig_NsW7fEuG';

const isDevRuntime = typeof __DEV__ !== 'undefined' ? __DEV__ : false;

const configuredSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const configuredSupabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabaseUrl =
  configuredSupabaseUrl ?? (isDevRuntime ? FALLBACK_SUPABASE_URL : undefined);
const supabasePublishableKey =
  configuredSupabasePublishableKey ??
  (isDevRuntime ? FALLBACK_SUPABASE_PUBLISHABLE_KEY : undefined);

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Production builds require explicit environment configuration.',
  );
}

export const env = {
  supabaseUrl,
  supabasePublishableKey,
  usesFallbackSupabaseConfig:
    !configuredSupabaseUrl || !configuredSupabasePublishableKey,
  releaseChannel:
    process.env.EAS_BUILD_PROFILE ??
    process.env.EXPO_PUBLIC_RELEASE_CHANNEL ??
    'development',
};

