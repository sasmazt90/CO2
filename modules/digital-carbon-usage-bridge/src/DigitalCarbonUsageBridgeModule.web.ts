import type {
  DigitalCarbonUsageBridgeModuleType,
  DigitalCarbonUsageBridgeStatus,
  DigitalCarbonUsageSnapshot,
} from './DigitalCarbonUsageBridge.types';

const status: DigitalCarbonUsageBridgeStatus = {
  moduleName: 'DigitalCarbonUsageBridge',
  platform: 'web',
  installed: false,
  supportsDeviceWideUsage: false,
  accessGranted: false,
  requiresManualAccess: false,
  canOpenSettings: false,
  note:
    'Web builds do not expose device-wide app usage, so the score stays on journal and seeded fallbacks here.',
  supportedMetrics: [],
};

const DigitalCarbonUsageBridgeModule: DigitalCarbonUsageBridgeModuleType = {
  getBridgeStatus() {
    return status;
  },
  async getTodayUsageSnapshot(): Promise<DigitalCarbonUsageSnapshot | null> {
    return null;
  },
  async openUsageAccessSettings() {
    return false;
  },
};

export default DigitalCarbonUsageBridgeModule;
