import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCIAL_PROFILE_STORAGE_KEY =
  'digital-carbon-footprint-score/social-profile';

export interface LocalSocialProfile {
  id?: string;
  friendCode: string;
  displayName: string;
  city: string;
  region: string;
  country: string;
}

const randomChunk = () =>
  Math.random().toString(36).replace(/[^a-z0-9]/g, '').slice(2, 6).toUpperCase();

export const createLocalSocialProfileSeed = (): LocalSocialProfile => ({
  friendCode: `CO2-${randomChunk()}${randomChunk()}`,
  displayName: 'Tolgar',
  city: 'Munich',
  region: 'Bavaria',
  country: 'Germany',
});

export const loadLocalSocialProfile = async (): Promise<LocalSocialProfile> => {
  const value = await AsyncStorage.getItem(SOCIAL_PROFILE_STORAGE_KEY);

  if (!value) {
    return createLocalSocialProfileSeed();
  }

  try {
    const parsed = JSON.parse(value) as LocalSocialProfile;
    return {
      ...createLocalSocialProfileSeed(),
      ...parsed,
      city: parsed.city ?? parsed.region ?? 'Munich',
      country: parsed.country ?? 'Germany',
    };
  } catch {
    return createLocalSocialProfileSeed();
  }
};

export const saveLocalSocialProfile = async (profile: LocalSocialProfile) => {
  await AsyncStorage.setItem(SOCIAL_PROFILE_STORAGE_KEY, JSON.stringify(profile));
};
