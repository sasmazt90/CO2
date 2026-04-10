export type ScoreGroup =
  | 'Device Energy'
  | 'Network & Cloud'
  | 'Audio'
  | 'Behavioral'
  | 'Charging'
  | 'Processing & Sensors';

export interface DailyMetrics {
  date: string;
  avgBrightness: number;
  screenTime: number;
  idleScreenOn: number;
  avgTemp: number;
  btOnTime: number;
  btActiveDevices: number;
  locationRequests: number;
  locationAlwaysOnApps: number;
  hotspotDuration: number;
  sleepEnergy: number;
  sleepBaseline: number;
  backgroundActiveApps: number;
  widgetCount: number;
  liveWallpaperEnabled: boolean;
  mobileDataUsage: number;
  videoStreamingTime: number;
  largeMobileTransfers: number;
  cloudSyncSessions: number;
  autoplayVideosCount: number;
  mobileUpdatesData: number;
  vpnUsageTime: number;
  lowSignalTime: number;
  multiDeviceSyncEvents: number;
  backupRunsPerDay: number;
  speakerCallTime: number;
  avgMusicVolume: number;
  musicListeningTime: number;
  singleCallDuration: number;
  callCount: number;
  btAudioTime: number;
  socialMediaTime: number;
  notificationsPerDay: number;
  shortVehicleTrips: number;
  steps: number;
  unusedAppsCount: number;
  duplicateMedia: number;
  compressionTasks: number;
  heavyAppOpens: number;
  timeAt100WhilePlugged: number;
  chargingBetween00_06: number;
  chargeSessions: number;
  fastChargeSessions: number;
  timeBelow20: number;
  timeAbove80: number;
  cpuHighUsage: number;
  backgroundComputeTime: number;
  backgroundComputeBaseline: number;
  navigationTime: number;
  cameraUsage: number;
  recorded4KVideo: boolean;
  gyroActiveApps: number;
  arAppUsage: number;
  proximityActiveTime: number;
  proximityBaseline: number;
  faceIDUnlocks: number;
  faceIDBaseline: number;
  radioHighPowerTime: number;
}

export interface ScientificReference {
  id: string;
  title: string;
  organization: string;
  url: string;
  citation: string;
  note: string;
}

export interface CarbonRule {
  id: string;
  category: string;
  group: ScoreGroup;
  trigger: (metrics: DailyMetrics) => boolean;
  notification: string;
  recommendation: string;
  source: string;
  scoreImpact: number;
  summary: string;
  referenceId: string;
}

export interface TriggeredRule {
  id: string;
  category: string;
  group: ScoreGroup;
  notification: string;
  recommendation: string;
  source: string;
  scoreImpact: number;
  summary: string;
  referenceId: string;
}

export interface GroupBreakdownItem {
  group: ScoreGroup;
  impact: number;
  share: number;
  estimatedKgCo2: number;
}

export interface CarbonScoreBreakdown {
  date: string;
  score: number;
  totalImpact: number;
  estimatedKgCo2: number;
  entries: TriggeredRule[];
  groupBreakdown: GroupBreakdownItem[];
  topPositive: TriggeredRule[];
  topImprovementAreas: TriggeredRule[];
  quickTips: string[];
  primaryInsight: string;
}

export interface PermissionState {
  screenTime: boolean;
  motion: boolean;
  location: boolean;
  notifications: boolean;
}

export interface LiveSignalState {
  syncedAt: string | null;
  status: 'idle' | 'syncing' | 'ready' | 'error';
  notes: string[];
  deviceName?: string;
  batteryLevel?: number;
  batteryState?: string;
  currentBrightness?: number;
  stepsToday?: number;
  locationEnabled?: boolean;
}

export interface ChallengeDefinition {
  id: string;
  title: string;
  description: string;
  group: ScoreGroup | 'Habits';
  targetLabel: string;
  points: number;
  progress: (metrics: DailyMetrics) => number;
}

export interface BadgeDefinition {
  id: string;
  title: string;
  subtitle: string;
  level: 'Bronze' | 'Silver' | 'Gold';
  icon: 'leaf' | 'sun' | 'bolt' | 'phone' | 'footsteps';
  unlocked: (breakdown: CarbonScoreBreakdown) => boolean;
}

export interface FriendScore {
  id: string;
  name: string;
  region: string;
  weeklyScore: number;
  streak: number;
  sharedBadge: string;
}
