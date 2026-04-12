import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';

import type {
  DigitalCarbonUsageBridgeModuleType,
  DigitalCarbonUsageBridgeStatus,
  DigitalCarbonUsageSnapshot,
} from './DigitalCarbonUsageBridge.types';

const fallbackStatus: DigitalCarbonUsageBridgeStatus = {
  moduleName: 'DigitalCarbonUsageBridge',
  platform: Platform.OS,
  installed: false,
  supportsDeviceWideUsage: false,
  accessGranted: false,
  requiresManualAccess: Platform.OS === 'android',
  canOpenSettings: false,
  note:
    Platform.OS === 'android'
      ? 'Native app usage bridge is not built into this binary yet.'
      : 'This platform is still using local fallbacks for app usage.',
  supportedMetrics: [],
};

const fallbackModule: DigitalCarbonUsageBridgeModuleType = {
  getBridgeStatus() {
    return fallbackStatus;
  },
  async getTodayUsageSnapshot(): Promise<DigitalCarbonUsageSnapshot | null> {
    return null;
  },
  async openUsageAccessSettings() {
    return false;
  },
};

export default (
  requireOptionalNativeModule<DigitalCarbonUsageBridgeModuleType>(
    'DigitalCarbonUsageBridge',
  ) ?? fallbackModule
);
