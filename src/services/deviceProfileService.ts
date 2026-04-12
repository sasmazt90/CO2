import AsyncStorage from '@react-native-async-storage/async-storage';

import { DailyMetrics } from '../engine/types';

const DEVICE_PROFILE_STORAGE_KEY =
  'digital-carbon-footprint-score/device-profile';

export interface DeviceProfile {
  patch: Partial<DailyMetrics>;
  customizedKeys: Array<keyof DailyMetrics>;
}

export const defaultDeviceProfile: DeviceProfile = {
  patch: {},
  customizedKeys: [],
};

export const loadDeviceProfile = async (): Promise<DeviceProfile> => {
  const value = await AsyncStorage.getItem(DEVICE_PROFILE_STORAGE_KEY);

  if (!value) {
    return defaultDeviceProfile;
  }

  try {
    const parsed = JSON.parse(value) as DeviceProfile;

    return {
      patch: parsed.patch ?? {},
      customizedKeys: Array.isArray(parsed.customizedKeys)
        ? parsed.customizedKeys
        : [],
    };
  } catch {
    return defaultDeviceProfile;
  }
};

export const saveDeviceProfile = async (profile: DeviceProfile) => {
  await AsyncStorage.setItem(DEVICE_PROFILE_STORAGE_KEY, JSON.stringify(profile));
};
