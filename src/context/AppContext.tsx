import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { challenges } from '../data/challenges';
import { createBadges, friends } from '../data/friends';
import { breakdownHistory, todayMetrics } from '../data/mockMetrics';
import {
  BadgeDefinition,
  CarbonScoreBreakdown,
  ChallengeDefinition,
  FriendScore,
  PermissionState,
} from '../engine/types';

interface AppContextValue {
  ready: boolean;
  hasCompletedOnboarding: boolean;
  permissions: PermissionState;
  breakdownHistory: { metrics: typeof todayMetrics; breakdown: CarbonScoreBreakdown }[];
  todayBreakdown: CarbonScoreBreakdown;
  todayMetrics: typeof todayMetrics;
  weeklyAverageScore: number;
  carbonPoints: number;
  streakDays: number;
  joinedChallenges: string[];
  availableChallenges: ChallengeDefinition[];
  badges: BadgeDefinition[];
  friends: FriendScore[];
  completeOnboarding: (permissions: PermissionState) => Promise<void>;
  toggleChallenge: (challengeId: string) => void;
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

  useEffect(() => {
    const loadState = async () => {
      try {
        const value = await AsyncStorage.getItem(STORAGE_KEY);
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
      } finally {
        setReady(true);
      }
    };

    void loadState();
  }, []);

  const persist = async (nextValue: {
    hasCompletedOnboarding: boolean;
    permissions: PermissionState;
    joinedChallenges: string[];
  }) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextValue));
  };

  const completeOnboarding = async (nextPermissions: PermissionState) => {
    setHasCompletedOnboarding(true);
    setPermissions(nextPermissions);

    await persist({
      hasCompletedOnboarding: true,
      permissions: nextPermissions,
      joinedChallenges,
    });
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

  const todayBreakdown = breakdownHistory[breakdownHistory.length - 1].breakdown;

  const weeklyAverageScore = useMemo(
    () =>
      Math.round(
        breakdownHistory.reduce((sum, item) => sum + item.breakdown.score, 0) /
          breakdownHistory.length,
      ),
    [],
  );

  const carbonPoints = useMemo(
    () =>
      todayBreakdown.score * 12 +
      todayBreakdown.topPositive.length * 40 +
      joinedChallenges.length * 25,
    [joinedChallenges.length, todayBreakdown.score, todayBreakdown.topPositive.length],
  );

  const streakDays = useMemo(
    () =>
      breakdownHistory.reduce(
        (count, item) => count + (item.breakdown.score >= weeklyAverageScore ? 1 : 0),
        0,
      ),
    [weeklyAverageScore],
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
      weeklyAverageScore,
      carbonPoints,
      streakDays,
      joinedChallenges,
      availableChallenges: challenges,
      badges,
      friends,
      completeOnboarding,
      toggleChallenge,
    }),
    [
      badges,
      carbonPoints,
      hasCompletedOnboarding,
      joinedChallenges,
      permissions,
      ready,
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
