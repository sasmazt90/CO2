import DigitalCarbonUsageBridge, {
  type DigitalCarbonUsageBridgeStatus,
  type DigitalCarbonUsageSnapshot,
} from '../../modules/digital-carbon-usage-bridge';
import { AppUsageSource, DailyMetrics, LiveSignalState } from '../engine/types';
import { buildScreenTimeJournalSummary } from './screenTimeJournalService';

type NativeMetricField =
  | 'screenTimeMinutes'
  | 'socialMediaMinutes'
  | 'videoStreamingMinutes'
  | 'heavyAppOpens'
  | 'unusedAppsCount'
  | 'mobileDataUsageMb'
  | 'notificationsPerDay'
  | 'observedAppsCount';

export interface NativeAppUsageBridgeStatus extends DigitalCarbonUsageBridgeStatus {}

export interface AppUsageSignalResult {
  source: AppUsageSource;
  metricPatch: Partial<DailyMetrics>;
  statePatch: Partial<LiveSignalState>;
  notes: string[];
}

const numericFields: NativeMetricField[] = [
  'screenTimeMinutes',
  'socialMediaMinutes',
  'videoStreamingMinutes',
  'heavyAppOpens',
  'unusedAppsCount',
  'mobileDataUsageMb',
  'notificationsPerDay',
  'observedAppsCount',
];

const nativeMetricMap: Partial<Record<NativeMetricField, keyof DailyMetrics>> = {
  screenTimeMinutes: 'screenTime',
  socialMediaMinutes: 'socialMediaTime',
  videoStreamingMinutes: 'videoStreamingTime',
  heavyAppOpens: 'heavyAppOpens',
  unusedAppsCount: 'unusedAppsCount',
  mobileDataUsageMb: 'mobileDataUsage',
  notificationsPerDay: 'notificationsPerDay',
};

const asFinitePositiveNumber = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : undefined;

const buildNativeMetricPatch = (
  snapshot: DigitalCarbonUsageSnapshot,
): Partial<DailyMetrics> => {
  const patch: Partial<DailyMetrics> = {};

  for (const field of numericFields) {
    const dailyMetricKey = nativeMetricMap[field];

    if (!dailyMetricKey) {
      continue;
    }

    const value = asFinitePositiveNumber(snapshot[field]);

    if (value !== undefined) {
      patch[dailyMetricKey] = Math.round(value) as never;
    }
  }

  return patch;
};

export const getNativeAppUsageBridgeStatus = (): NativeAppUsageBridgeStatus => {
  try {
    return DigitalCarbonUsageBridge.getBridgeStatus();
  } catch {
    return {
      moduleName: 'DigitalCarbonUsageBridge',
      platform: 'unknown',
      installed: false,
      supportsDeviceWideUsage: false,
      accessGranted: false,
      requiresManualAccess: false,
      canOpenSettings: false,
      note: 'Native app usage bridge is unavailable in this build.',
      supportedMetrics: [],
    };
  }
};

export const getNativeAppUsageSnapshotAsync = async () => {
  const bridgeStatus = getNativeAppUsageBridgeStatus();

  if (
    !bridgeStatus.installed ||
    !bridgeStatus.supportsDeviceWideUsage ||
    !bridgeStatus.accessGranted
  ) {
    return null;
  }

  try {
    return await DigitalCarbonUsageBridge.getTodayUsageSnapshot();
  } catch {
    return null;
  }
};

export const openNativeAppUsageSettingsAsync = async () => {
  try {
    return await DigitalCarbonUsageBridge.openUsageAccessSettings();
  } catch {
    return false;
  }
};

const collectNativeAppUsageSignals = async (): Promise<AppUsageSignalResult | null> => {
  const bridgeStatus = getNativeAppUsageBridgeStatus();

  if (
    !bridgeStatus.installed ||
    !bridgeStatus.supportsDeviceWideUsage ||
    !bridgeStatus.accessGranted
  ) {
    return null;
  }

  try {
    const snapshot = await getNativeAppUsageSnapshotAsync();

    if (!snapshot) {
      return null;
    }

    const metricPatch = buildNativeMetricPatch(snapshot);

    if (Object.keys(metricPatch).length === 0) {
      return null;
    }

    const observedAppsCount = asFinitePositiveNumber(snapshot.observedAppsCount);
    const appLabel = observedAppsCount
      ? ` across ${Math.round(observedAppsCount)} observed apps`
      : '';

    return {
      source: 'native-module',
      metricPatch,
      statePatch: {
        appUsageSource: 'native-module',
        appUsageObservedAppsCount: observedAppsCount
          ? Math.round(observedAppsCount)
          : undefined,
        appUsageProvidedMetrics: snapshot.providedMetrics ?? bridgeStatus.supportedMetrics,
        appUsageLastSyncAt: snapshot.collectedAt ?? new Date().toISOString(),
        appUsageSupportsCategories:
          Boolean(snapshot.supportsCategoryBreakdown) ||
          metricPatch.socialMediaTime !== undefined ||
          metricPatch.videoStreamingTime !== undefined,
      },
      notes: [
        `Native app usage bridge supplied today's device-wide usage summary${appLabel}.`,
      ],
    };
  } catch {
    return null;
  }
};

const collectJournalAppUsageSignals = async (): Promise<AppUsageSignalResult | null> => {
  const summary = await buildScreenTimeJournalSummary();

  if (summary.sessionCount === 0) {
    return null;
  }

  return {
    source: 'app-session-journal',
    metricPatch: summary.metricPatch,
    statePatch: {
      appUsageSource: 'app-session-journal',
      appUsageLastSyncAt: summary.lastEventAt,
      appUsageSupportsCategories: false,
      appUsageProvidedMetrics: ['screenTimeMinutes'],
      appSessionMinutes: summary.observedMinutes,
      appSessionCount: summary.sessionCount,
      appSessionDerived: summary.derivedFromJournal,
      appSessionLastEventAt: summary.lastEventAt,
    },
    notes: summary.note ? [summary.note] : [],
  };
};

export const collectAppUsageSignals = async (): Promise<AppUsageSignalResult> => {
  const bridgeStatus = getNativeAppUsageBridgeStatus();
  const nativeSignals = await collectNativeAppUsageSignals();

  if (nativeSignals) {
    return nativeSignals;
  }

  const journalSignals = await collectJournalAppUsageSignals();

  if (journalSignals) {
    return journalSignals;
  }

  return {
    source: 'estimated',
    metricPatch: {},
    statePatch: {
      appUsageSource: 'estimated',
      appUsageProvidedMetrics: undefined,
      appUsageObservedAppsCount: undefined,
      appUsageLastSyncAt: undefined,
      appUsageSupportsCategories: false,
      appSessionMinutes: undefined,
      appSessionCount: undefined,
      appSessionDerived: false,
      appSessionLastEventAt: undefined,
    },
    notes: [
      bridgeStatus.installed && bridgeStatus.supportsDeviceWideUsage && !bridgeStatus.accessGranted
        ? bridgeStatus.note
        : 'App usage is still on calm seeded estimates until the journal or a native bridge has enough data.',
    ],
  };
};
