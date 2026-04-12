export interface DigitalCarbonUsageSnapshot {
  collectedAt?: string;
  screenTimeMinutes?: number;
  socialMediaMinutes?: number;
  videoStreamingMinutes?: number;
  musicListeningMinutes?: number;
  navigationMinutes?: number;
  cameraMinutes?: number;
  arUsageMinutes?: number;
  heavyAppOpens?: number;
  unusedAppsCount?: number;
  mobileDataUsageMb?: number;
  notificationsPerDay?: number;
  observedAppsCount?: number;
  supportsCategoryBreakdown?: boolean;
  providedMetrics?: string[];
}

export interface DigitalCarbonUsageBridgeStatus {
  moduleName: string;
  platform: string;
  installed: boolean;
  supportsDeviceWideUsage: boolean;
  accessGranted: boolean;
  requiresManualAccess: boolean;
  canOpenSettings: boolean;
  note: string;
  supportedMetrics: string[];
}

export interface DigitalCarbonUsageBridgeModuleType {
  getBridgeStatus(): DigitalCarbonUsageBridgeStatus;
  getTodayUsageSnapshot(): Promise<DigitalCarbonUsageSnapshot | null>;
  openUsageAccessSettings(): Promise<boolean>;
}
