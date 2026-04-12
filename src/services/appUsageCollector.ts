import { NativeModules, Platform } from 'react-native';

import {
  AppUsageSource,
  DailyMetrics,
  LiveSignalState,
} from '../engine/types';
import { buildScreenTimeJournalSummary } from './screenTimeJournalService';

const NATIVE_USAGE_BRIDGE_MODULE = 'DigitalCarbonUsageBridge';

type NativeMetricField =
  | 'screenTimeMinutes'
  | 'socialMediaMinutes'
  | 'videoStreamingMinutes'
  | 'heavyAppOpens'
  | 'unusedAppsCount'
  | 'mobileDataUsageMb'
  | 'notificationsPerDay'
  | 'observedAppsCount';

interface NativeAppUsageSnapshot {
  collectedAt?: string;
  screenTimeMinutes?: number;
  socialMediaMinutes?: number;
  videoStreamingMinutes?: number;
  heavyAppOpens?: number;
  unusedAppsCount?: number;
  mobileDataUsageMb?: number;
  notificationsPerDay?: number;
  observedAppsCount?: number;
  supportsCategoryBreakdown?: boolean;
}

interface NativeAppUsageBridgeModule {
  getTodayUsageSnapshot?: () => Promise<NativeAppUsageSnapshot>;
}

export interface NativeAppUsageBridgeStatus {
  installed: boolean;
  moduleName: string;
  platform: string;
}

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

const getNativeAppUsageBridge = () =>
  NativeModules[NATIVE_USAGE_BRIDGE_MODULE] as NativeAppUsageBridgeModule | undefined;

const buildNativeMetricPatch = (
  snapshot: NativeAppUsageSnapshot,
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
  const bridge = getNativeAppUsageBridge();

  return {
    installed: typeof bridge?.getTodayUsageSnapshot === 'function',
    moduleName: NATIVE_USAGE_BRIDGE_MODULE,
    platform: Platform.OS,
  };
};

const collectNativeAppUsageSignals = async (): Promise<AppUsageSignalResult | null> => {
  const bridge = getNativeAppUsageBridge();

  if (typeof bridge?.getTodayUsageSnapshot !== 'function') {
    return null;
  }

  try {
    const snapshot = await bridge.getTodayUsageSnapshot();
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
      appSessionMinutes: summary.observedMinutes,
      appSessionCount: summary.sessionCount,
      appSessionDerived: summary.derivedFromJournal,
      appSessionLastEventAt: summary.lastEventAt,
    },
    notes: summary.note ? [summary.note] : [],
  };
};

export const collectAppUsageSignals = async (): Promise<AppUsageSignalResult> => {
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
      appUsageObservedAppsCount: undefined,
      appUsageLastSyncAt: undefined,
      appUsageSupportsCategories: false,
      appSessionMinutes: undefined,
      appSessionCount: undefined,
      appSessionDerived: false,
      appSessionLastEventAt: undefined,
    },
    notes: [
      'App usage is still on calm seeded estimates until the journal or a native bridge has enough data.',
    ],
  };
};
