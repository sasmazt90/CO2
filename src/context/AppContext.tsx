import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { challenges } from '../data/challenges';
import {
  createBadges,
  getLeaderboardByCohort,
  jointChallenges,
} from '../data/friends';
import { evaluateCarbonScore } from '../engine/evaluateCarbonScore';
import {
  BadgeDefinition,
  CarbonScoreBreakdown,
  ChallengeDefinition,
  CollectorCapability,
  DailyMetrics,
  FriendScore,
  HistorySnapshot,
  JointChallenge,
  LiveSignalState,
  NotificationItem,
  PermissionDiagnostic,
  PermissionState,
} from '../engine/types';
import {
  buildBatteryJournalSummary,
  startBatteryJournalListeners,
} from '../services/batteryJournalService';
import { collectAppUsageSignals } from '../services/appUsageCollector';
import { collectDeviceSignalPatch } from '../services/deviceSignalCollector';
import { buildCollectorCapabilities } from '../services/collectorCapabilities';
import { deriveCompositeMetricsFromUsage } from '../services/derivedMetrics';
import {
  buildHistoryBreakdowns,
  createSeedHistory,
  createTodayMetricSeed,
  loadHistorySnapshots,
  saveHistorySnapshots,
  upsertTodaySnapshot,
} from '../services/historyService';
import { deriveMetricBaselines } from '../services/metricBaselines';
import { buildNotificationFeed, syncLocalNotifications } from '../services/notificationService';
import { loadPermissionDiagnostics } from '../services/permissionDiagnostics';
import { startScreenTimeJournalListeners } from '../services/screenTimeJournalService';

interface AppContextValue {
  ready: boolean;
  hasCompletedOnboarding: boolean;
  permissions: PermissionState;
  breakdownHistory: { metrics: DailyMetrics; breakdown: CarbonScoreBreakdown }[];
  todayBreakdown: CarbonScoreBreakdown;
  todayMetrics: DailyMetrics;
  liveSignalState: LiveSignalState;
  permissionDiagnostics: PermissionDiagnostic[];
  collectorCapabilities: CollectorCapability[];
  notificationFeed: NotificationItem[];
  notificationsEnabled: boolean;
  weeklyAverageScore: number;
  carbonPoints: number;
  streakDays: number;
  joinedChallenges: string[];
  availableChallenges: ChallengeDefinition[];
  badges: BadgeDefinition[];
  friends: FriendScore[];
  leaderboards: {
    friends: FriendScore[];
    regional: FriendScore[];
    global: FriendScore[];
  };
  jointChallenges: JointChallenge[];
  completeOnboarding: (permissions: PermissionState) => Promise<void>;
  toggleChallenge: (challengeId: string) => void;
  syncLiveSignals: () => Promise<void>;
  refreshPermissionDiagnostics: (requestIfNeeded?: boolean) => Promise<void>;
  updateTodayMetricPatch: (patch: Partial<DailyMetrics>) => void;
  markNotificationRead: (notificationId: string) => void;
}

const STORAGE_KEY = 'digital-carbon-footprint-score/app-state';
const APP_USAGE_NOTE_PREFIXES = [
  'Native app usage bridge',
  'App session journal',
  'App usage is still on calm seeded estimates',
];

const defaultPermissions: PermissionState = {
  screenTime: true,
  motion: true,
  location: true,
  notifications: true,
};

const AppContext = createContext<AppContextValue | null>(null);

const mergeNotes = (preferred: string[], existing: string[]) => {
  const next: string[] = [];
  const seen = new Set<string>();

  for (const note of [...preferred, ...existing]) {
    if (!note || seen.has(note)) {
      continue;
    }

    seen.add(note);
    next.push(note);
  }

  return next;
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [permissions, setPermissions] = useState<PermissionState>(defaultPermissions);
  const [joinedChallenges, setJoinedChallenges] = useState<string[]>([
    'brightness-hero-week',
    'eco-charger',
  ]);
  const [liveSignalState, setLiveSignalState] = useState<LiveSignalState>({
    syncedAt: null,
    status: 'idle',
    notes: ['Live signals have not been synced yet.'],
  });
  const [historySnapshots, setHistorySnapshots] = useState<HistorySnapshot[]>([]);
  const [currentTodayMetrics, setCurrentTodayMetrics] = useState<DailyMetrics>(createTodayMetricSeed());
  const [permissionDiagnostics, setPermissionDiagnostics] = useState<PermissionDiagnostic[]>([]);
  const [notificationFeed, setNotificationFeed] = useState<NotificationItem[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const mergeLiveSignalState = (
    patch: Partial<LiveSignalState> & {
      notes?: string[];
    },
  ) => {
    setLiveSignalState((current) => ({
      ...current,
      ...patch,
      notes: patch.notes ? mergeNotes(patch.notes, current.notes) : current.notes,
    }));
  };

  useEffect(() => {
    const loadState = async () => {
      try {
        const [value, loadedHistorySnapshots] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          loadHistorySnapshots(),
        ]);
        if (value) {
          const parsed = JSON.parse(value) as {
            hasCompletedOnboarding: boolean;
            permissions: PermissionState;
            joinedChallenges: string[];
          };
          setHasCompletedOnboarding(parsed.hasCompletedOnboarding);
          setPermissions(parsed.permissions);
          setJoinedChallenges(parsed.joinedChallenges);
        }

        const todaySeed = createTodayMetricSeed();
        const existingTodaySnapshot = loadedHistorySnapshots.find(
          (item) => item.metrics.date === todaySeed.date,
        );
        const nextTodayMetrics = existingTodaySnapshot?.metrics ?? todaySeed;
        const nextHistorySnapshots = upsertTodaySnapshot(
          loadedHistorySnapshots.length > 0 ? loadedHistorySnapshots : createSeedHistory(),
          nextTodayMetrics,
        );

        setCurrentTodayMetrics(nextTodayMetrics);
        setHistorySnapshots(nextHistorySnapshots);
        await saveHistorySnapshots(nextHistorySnapshots);
        const diagnostics = await loadPermissionDiagnostics(
          value
            ? (JSON.parse(value) as { permissions: PermissionState }).permissions
            : defaultPermissions,
        );
        setPermissionDiagnostics(diagnostics);
      } finally {
        setReady(true);
      }
    };

    void loadState();
  }, []);

  useEffect(() => {
    if (ready && hasCompletedOnboarding && liveSignalState.status === 'idle') {
      void syncLiveSignals();
    }
  }, [hasCompletedOnboarding, liveSignalState.status, ready]);

  useEffect(() => {
    if (ready) {
      void refreshPermissionDiagnostics();
    }
  }, [permissions, ready]);

  useEffect(() => {
    if (!ready || !hasCompletedOnboarding) {
      return;
    }

    let active = true;

    const applyBatteryJournalSummary = async () => {
      const summary = await buildBatteryJournalSummary();

      if (!active || summary.sampleCount === 0) {
        return;
      }

      if (summary.derivedFromJournal && Object.keys(summary.metricPatch).length > 0) {
        applyTodayMetrics((current) => ({ ...current, ...summary.metricPatch }));
      }

      setLiveSignalState((current) => {
        const nextNotes = summary.note
          ? [
              summary.note,
              ...current.notes.filter((note) => !note.startsWith('Battery journal')),
            ]
          : current.notes;

        return {
          ...current,
          batteryJournalSamples: summary.sampleCount,
          batteryJournalDerived: summary.derivedFromJournal,
          batteryJournalLastSampleAt:
            summary.lastSampleAt ?? current.batteryJournalLastSampleAt,
          notes: nextNotes,
        };
      });
    };

    void applyBatteryJournalSummary();
    const stopBatteryJournal = startBatteryJournalListeners(() => {
      void applyBatteryJournalSummary();
    });

    return () => {
      active = false;
      stopBatteryJournal();
    };
  }, [hasCompletedOnboarding, ready]);

  useEffect(() => {
    if (!ready || !hasCompletedOnboarding) {
      return;
    }

    let active = true;

    const applyAppUsageSignals = async () => {
      if (!active) {
        return;
      }

      await syncAppUsageSignals();
    };

    void applyAppUsageSignals();
    const stopScreenTimeJournal = startScreenTimeJournalListeners(() => {
      if (active) {
        void applyAppUsageSignals();
      }
    });

    return () => {
      active = false;
      stopScreenTimeJournal();
    };
  }, [hasCompletedOnboarding, ready]);

  const persist = async (nextValue: {
    hasCompletedOnboarding: boolean;
    permissions: PermissionState;
    joinedChallenges: string[];
  }) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextValue));
  };

  const applyTodayMetrics = (updater: DailyMetrics | ((current: DailyMetrics) => DailyMetrics)) => {
    setCurrentTodayMetrics((current) => {
      const nextMetrics = typeof updater === 'function' ? updater(current) : updater;

      setHistorySnapshots((currentSnapshots) => {
        const baseSnapshots =
          currentSnapshots.length > 0 ? currentSnapshots : createSeedHistory();
        const nextSnapshots = upsertTodaySnapshot(baseSnapshots, nextMetrics);
        void saveHistorySnapshots(nextSnapshots);
        return nextSnapshots;
      });

      return nextMetrics;
    });
  };

  const mergeAppUsageMetrics = (
    current: DailyMetrics,
    metricPatch: Partial<DailyMetrics>,
    source: LiveSignalState['appUsageSource'],
  ) => {
    const next = { ...current };

    if (metricPatch.screenTime !== undefined) {
      next.screenTime =
        source === 'app-session-journal'
          ? Math.max(current.screenTime, metricPatch.screenTime)
          : metricPatch.screenTime;
    }

    const directKeys: Array<
      | 'socialMediaTime'
      | 'videoStreamingTime'
      | 'musicListeningTime'
      | 'navigationTime'
      | 'cameraUsage'
      | 'arAppUsage'
      | 'heavyAppOpens'
      | 'unusedAppsCount'
      | 'mobileDataUsage'
      | 'notificationsPerDay'
    > = [
      'socialMediaTime',
      'videoStreamingTime',
      'musicListeningTime',
      'navigationTime',
      'cameraUsage',
      'arAppUsage',
      'heavyAppOpens',
      'unusedAppsCount',
      'mobileDataUsage',
      'notificationsPerDay',
    ];

    for (const key of directKeys) {
      const value = metricPatch[key];

      if (value !== undefined) {
        next[key] = value;
      }
    }

    return next;
  };

  const syncAppUsageSignals = async () => {
    const usageSignals = await collectAppUsageSignals();

    if (Object.keys(usageSignals.metricPatch).length > 0) {
      applyTodayMetrics((current) => {
        const mergedMetrics = mergeAppUsageMetrics(
          current,
          usageSignals.metricPatch,
          usageSignals.source,
        );
        const derivedPatch = deriveCompositeMetricsFromUsage({
          currentMetrics: mergedMetrics,
          incomingPatch: usageSignals.metricPatch,
          liveSignalState: {
            ...liveSignalState,
            ...usageSignals.statePatch,
          },
        });

        return {
          ...mergedMetrics,
          ...derivedPatch,
        };
      });
    }

    setLiveSignalState((current) => {
      const retainedNotes = current.notes.filter(
        (note) =>
          !APP_USAGE_NOTE_PREFIXES.some((prefix) => note.startsWith(prefix)),
      );

      return {
        ...current,
        ...usageSignals.statePatch,
        notes: mergeNotes(usageSignals.notes, retainedNotes),
      };
    });
  };

  const completeOnboarding = async (nextPermissions: PermissionState) => {
    setHasCompletedOnboarding(true);
    setPermissions(nextPermissions);

    await persist({
      hasCompletedOnboarding: true,
      permissions: nextPermissions,
      joinedChallenges,
    });

    await refreshPermissionDiagnostics(true, nextPermissions);
    const { metricPatch, signalState } = await collectDeviceSignalPatch(nextPermissions);
    applyTodayMetrics((current) => ({ ...current, ...metricPatch }));
    mergeLiveSignalState(signalState);
    await syncAppUsageSignals();
    if (nextPermissions.notifications) {
      setNotificationsEnabled(true);
    }
  };

  const toggleChallenge = (challengeId: string) => {
    const nextJoinedChallenges = joinedChallenges.includes(challengeId)
      ? joinedChallenges.filter((id) => id !== challengeId)
      : [...joinedChallenges, challengeId];

    setJoinedChallenges(nextJoinedChallenges);

    void persist({
      hasCompletedOnboarding,
      permissions,
      joinedChallenges: nextJoinedChallenges,
    });
  };

  async function syncLiveSignals() {
    mergeLiveSignalState({
      status: 'syncing',
      notes: ['Syncing device signals...'],
    });
    try {
      const { metricPatch, signalState } = await collectDeviceSignalPatch(permissions);
      applyTodayMetrics((current) => ({ ...current, ...metricPatch }));
      mergeLiveSignalState(signalState);
      await syncAppUsageSignals();
    } catch {
      mergeLiveSignalState({
        syncedAt: new Date().toISOString(),
        status: 'error',
        notes: ['Live signal sync failed on this device.'],
      });
    }
  }

  async function refreshPermissionDiagnostics(
    requestIfNeeded = false,
    overridePermissions?: PermissionState,
  ) {
    const diagnostics = await loadPermissionDiagnostics(
      overridePermissions ?? permissions,
      requestIfNeeded,
    );
    setPermissionDiagnostics(diagnostics);
  }

  const updateTodayMetricPatch = (patch: Partial<DailyMetrics>) => {
    applyTodayMetrics((current) => ({ ...current, ...patch }));
  };

  const markNotificationRead = (notificationId: string) => {
    setNotificationFeed((current) =>
      current.map((item) =>
        item.id === notificationId ? { ...item, read: true } : item,
      ),
    );
  };

  const todayMetrics = useMemo(
    () => ({
      ...currentTodayMetrics,
      ...deriveMetricBaselines({
        currentMetrics: currentTodayMetrics,
        historySnapshots,
      }),
    }),
    [currentTodayMetrics, historySnapshots],
  );

  const todayBreakdown = useMemo(
    () => evaluateCarbonScore(todayMetrics),
    [todayMetrics],
  );

  const collectorCapabilities = useMemo(
    () =>
      buildCollectorCapabilities({
        diagnostics: permissionDiagnostics,
        liveSignalState,
      }),
    [liveSignalState, permissionDiagnostics],
  );

  const breakdownHistory = useMemo(
    () => buildHistoryBreakdowns(historySnapshots),
    [historySnapshots],
  );

  useEffect(() => {
    const nextFeed = buildNotificationFeed(todayBreakdown, notificationFeed);
    setNotificationFeed((current) => buildNotificationFeed(todayBreakdown, current));

    if (permissions.notifications) {
      void syncLocalNotifications(nextFeed).then((enabled) => {
        setNotificationsEnabled(enabled);
      });
    } else {
      setNotificationsEnabled(false);
    }
  }, [permissions.notifications, todayBreakdown]);

  const weeklyAverageScore = useMemo(
    () => {
      const lastSeven = breakdownHistory.slice(-7);
      if (lastSeven.length === 0) {
        return todayBreakdown.score;
      }

      return Math.round(
        lastSeven.reduce((sum, item) => sum + item.breakdown.score, 0) /
          lastSeven.length,
      );
    },
    [breakdownHistory, todayBreakdown.score],
  );

  const carbonPoints = useMemo(
    () =>
      todayBreakdown.score * 12 +
      todayBreakdown.topPositive.length * 40 +
      joinedChallenges.length * 25,
    [joinedChallenges.length, todayBreakdown.score, todayBreakdown.topPositive.length],
  );

  const streakDays = useMemo(
    () => {
      let streak = 0;
      const reversed = [...breakdownHistory].reverse();

      for (const item of reversed) {
        if (item.breakdown.score >= weeklyAverageScore) {
          streak += 1;
        } else {
          break;
        }
      }

      return streak;
    },
    [breakdownHistory, weeklyAverageScore],
  );

  const badges = useMemo(
    () => createBadges().filter((badge) => badge.unlocked(todayBreakdown)),
    [todayBreakdown],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      hasCompletedOnboarding,
      permissions,
      breakdownHistory,
      todayBreakdown,
      todayMetrics,
      liveSignalState,
      permissionDiagnostics,
      collectorCapabilities,
      notificationFeed,
      notificationsEnabled,
      weeklyAverageScore,
      carbonPoints,
      streakDays,
      joinedChallenges,
      availableChallenges: challenges,
      badges,
      friends: getLeaderboardByCohort('friends'),
      leaderboards: {
        friends: getLeaderboardByCohort('friends'),
        regional: getLeaderboardByCohort('regional'),
        global: getLeaderboardByCohort('global'),
      },
      jointChallenges,
      completeOnboarding,
      toggleChallenge,
      syncLiveSignals,
      refreshPermissionDiagnostics,
      updateTodayMetricPatch,
      markNotificationRead,
    }),
    [
      badges,
      carbonPoints,
      hasCompletedOnboarding,
      joinedChallenges,
      liveSignalState,
      permissionDiagnostics,
      collectorCapabilities,
      notificationFeed,
      notificationsEnabled,
      permissions,
      ready,
      streakDays,
      todayBreakdown,
      todayMetrics,
      weeklyAverageScore,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider');
  }

  return context;
};
