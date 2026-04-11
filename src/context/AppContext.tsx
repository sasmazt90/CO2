import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { challenges } from '../data/challenges';
import {
  createBadges,
  getLeaderboardByCohort,
  jointChallenges,
  leaderboardEntries,
} from '../data/friends';
import { evaluateCarbonScore } from '../engine/evaluateCarbonScore';
import {
  BadgeDefinition,
  CarbonScoreBreakdown,
  ChallengeDefinition,
  DailyMetrics,
  FriendScore,
  HistorySnapshot,
  JointChallenge,
  LiveSignalState,
  NotificationItem,
  PermissionState,
} from '../engine/types';
import { collectDeviceSignalPatch } from '../services/deviceSignalCollector';
import {
  buildHistoryBreakdowns,
  createSeedHistory,
  createTodayMetricSeed,
  loadHistorySnapshots,
  saveHistorySnapshots,
  upsertTodaySnapshot,
} from '../services/historyService';
import { buildNotificationFeed, syncLocalNotifications } from '../services/notificationService';

interface AppContextValue {
  ready: boolean;
  hasCompletedOnboarding: boolean;
  permissions: PermissionState;
  breakdownHistory: { metrics: DailyMetrics; breakdown: CarbonScoreBreakdown }[];
  todayBreakdown: CarbonScoreBreakdown;
  todayMetrics: DailyMetrics;
  liveSignalState: LiveSignalState;
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
  updateTodayMetricPatch: (patch: Partial<DailyMetrics>) => void;
  markNotificationRead: (notificationId: string) => void;
}

const STORAGE_KEY = 'digital-carbon-footprint-score/app-state';

const defaultPermissions: PermissionState = {
  screenTime: true,
  motion: true,
  location: true,
  notifications: true,
};

const AppContext = createContext<AppContextValue | null>(null);

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
  const [notificationFeed, setNotificationFeed] = useState<NotificationItem[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

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

  const completeOnboarding = async (nextPermissions: PermissionState) => {
    setHasCompletedOnboarding(true);
    setPermissions(nextPermissions);

    await persist({
      hasCompletedOnboarding: true,
      permissions: nextPermissions,
      joinedChallenges,
    });

    const { metricPatch, signalState } = await collectDeviceSignalPatch(nextPermissions);
    applyTodayMetrics((current) => ({ ...current, ...metricPatch }));
    setLiveSignalState(signalState);
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
    setLiveSignalState((current) => ({ ...current, status: 'syncing', notes: ['Syncing device signals...'] }));
    try {
      const { metricPatch, signalState } = await collectDeviceSignalPatch(permissions);
      applyTodayMetrics((current) => ({ ...current, ...metricPatch }));
      setLiveSignalState(signalState);
    } catch {
      setLiveSignalState({
        syncedAt: new Date().toISOString(),
        status: 'error',
        notes: ['Live signal sync failed on this device.'],
      });
    }
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

  const todayBreakdown = useMemo(
    () => evaluateCarbonScore(currentTodayMetrics),
    [currentTodayMetrics],
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
      todayMetrics: currentTodayMetrics,
      liveSignalState,
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
      updateTodayMetricPatch,
      markNotificationRead,
    }),
    [
      badges,
      carbonPoints,
      currentTodayMetrics,
      hasCompletedOnboarding,
      joinedChallenges,
      liveSignalState,
      notificationFeed,
      notificationsEnabled,
      permissions,
      ready,
      leaderboardEntries,
      streakDays,
      todayBreakdown,
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
