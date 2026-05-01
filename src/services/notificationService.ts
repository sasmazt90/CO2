import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  BadgeDefinition,
  CarbonScoreBreakdown,
  ChallengeDefinition,
  FriendScore,
  NotificationItem,
  SocialEvent,
} from '../engine/types';
import { toFootprintScore } from '../utils/formatters';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const buildNotificationFeed = (
  {
    availableChallenges,
    breakdown,
    existing = [],
    joinedChallenges,
    leaderboards,
    socialEvents,
    unlockedBadges,
    weeklyAverageScore,
  }: {
    availableChallenges: ChallengeDefinition[];
    breakdown: CarbonScoreBreakdown;
    existing?: NotificationItem[];
    joinedChallenges: string[];
    leaderboards: {
      regional: FriendScore[];
      global: FriendScore[];
    };
    socialEvents: SocialEvent[];
    unlockedBadges: BadgeDefinition[];
    weeklyAverageScore: number;
  },
): NotificationItem[] => {
  const existingMap = new Map(existing.map((item) => [item.ruleId, item]));
  const preserved = [...existing];
  const today = new Date(`${breakdown.date}T12:00:00`);
  const isChallengeFinalDay = today.getDay() === 0;

  const ensureItem = (item: NotificationItem) => {
    const existingItem = existingMap.get(item.ruleId);
    if (existingItem) {
      return existingItem;
    }
    preserved.push(item);
    return item;
  };

  ensureItem({
    id: existingMap.get(`daily-score-${breakdown.date}`)?.id ?? `notification-daily-score-${breakdown.date}`,
    ruleId: `daily-score-${breakdown.date}`,
    title: 'Today\'s footprint score',
    body: `Your current footprint score is ${toFootprintScore(breakdown.score)}/100.`,
    recommendation: breakdown.primaryInsight,
    source: 'Daily score summary',
    createdAt: `${breakdown.date}T08:00:00.000Z`,
    category: 'Daily summary',
    read: existingMap.get(`daily-score-${breakdown.date}`)?.read ?? false,
    delivered: existingMap.get(`daily-score-${breakdown.date}`)?.delivered ?? false,
    kind: 'summary',
  });

  unlockedBadges.forEach((badge) => {
    ensureItem({
      id: existingMap.get(`badge-${badge.id}`)?.id ?? `notification-badge-${badge.id}`,
      ruleId: `badge-${badge.id}`,
      title: `Badge earned: ${badge.title}`,
      body: `You unlocked the ${badge.subtitle} ${badge.title} badge.`,
      recommendation: badge.howToEarn,
      source: 'Badge cabinet',
      createdAt: new Date().toISOString(),
      category: 'Badge',
      read: existingMap.get(`badge-${badge.id}`)?.read ?? false,
      delivered: existingMap.get(`badge-${badge.id}`)?.delivered ?? false,
      kind: 'badge',
    });
  });

  if (isChallengeFinalDay) {
    joinedChallenges.forEach((challengeId) => {
      const challenge = availableChallenges.find((item) => item.id === challengeId);
      if (!challenge) {
        return;
      }
      ensureItem({
        id:
          existingMap.get(`challenge-last-day-${challenge.id}-${breakdown.date}`)?.id ??
          `notification-challenge-last-day-${challenge.id}-${breakdown.date}`,
        ruleId: `challenge-last-day-${challenge.id}-${breakdown.date}`,
        title: `Final day: ${challenge.title}`,
        body: `Today is the last day to finish "${challenge.title}".`,
        recommendation: challenge.targetLabel,
        source: 'Weekly challenge',
        createdAt: new Date().toISOString(),
        category: 'Challenge',
        read: existingMap.get(`challenge-last-day-${challenge.id}-${breakdown.date}`)?.read ?? false,
        delivered:
          existingMap.get(`challenge-last-day-${challenge.id}-${breakdown.date}`)?.delivered ?? false,
        kind: 'challenge',
      });
    });
  }

  socialEvents.forEach((event) => {
    const isFriendAdded = event.eventType === 'friend_added';
    const title = isFriendAdded ? 'New friend added' : 'Challenge invitation';
    const body = isFriendAdded
      ? `${String(event.payload.displayName ?? 'A new friend')} is now in your circle.`
      : `${String(event.payload.challengeTitle ?? 'A shared challenge')} is waiting for you.`;
    const recommendation = isFriendAdded
      ? 'Open your circle to compare progress and join shared challenges.'
      : String(event.payload.targetLabel ?? 'Open challenges to respond to the invitation.');

    ensureItem({
      id: existingMap.get(event.eventKey)?.id ?? `notification-${event.eventKey}`,
      ruleId: event.eventKey,
      title,
      body,
      recommendation,
      source: 'Social',
      createdAt: event.createdAt,
      category: 'Social',
      read: existingMap.get(event.eventKey)?.read ?? false,
      delivered: existingMap.get(event.eventKey)?.delivered ?? false,
      kind: 'social',
    });
  });

  const footprintAverage = toFootprintScore(weeklyAverageScore);
  const leaderboardEvents: Array<{ key: 'regional' | 'global'; label: string; values: FriendScore[] }> = [
    { key: 'regional', label: 'Regional', values: leaderboards.regional },
    { key: 'global', label: 'Global', values: leaderboards.global },
  ];

  leaderboardEvents.forEach(({ key, label, values }) => {
    const betterCount = values.filter(
      (entry) => toFootprintScore(entry.weeklyScore) < footprintAverage,
    ).length;
    const rank = betterCount + 1;
    if (rank > 5) {
      return;
    }

    ensureItem({
      id: existingMap.get(`leaderboard-${key}-${breakdown.date}`)?.id ?? `notification-leaderboard-${key}-${breakdown.date}`,
      ruleId: `leaderboard-${key}-${breakdown.date}`,
      title: `${label} top 5`,
      body: `You are currently in the ${label.toLowerCase()} top 5 with a weekly footprint score of ${footprintAverage}.`,
      recommendation: 'Keep your footprint low to stay in the top rankings.',
      source: 'Leaderboard',
      createdAt: new Date().toISOString(),
      category: 'Leaderboard',
      read: existingMap.get(`leaderboard-${key}-${breakdown.date}`)?.read ?? false,
      delivered: existingMap.get(`leaderboard-${key}-${breakdown.date}`)?.delivered ?? false,
      kind: 'leaderboard',
    });
  });

  return preserved
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 12);
};

export const ensureNotificationPermission = async () => {
  if (Platform.OS === 'web') {
    return { granted: false, canSchedule: false };
  }

  const permissions = await Notifications.getPermissionsAsync();
  if (permissions.granted || permissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return { granted: true, canSchedule: true };
  }

  const requested = await Notifications.requestPermissionsAsync();
  return {
    granted:
      requested.granted ||
      requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL,
    canSchedule:
      requested.granted ||
      requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL,
  };
};

export const syncLocalNotifications = async (feed: NotificationItem[]) => {
  const permission = await ensureNotificationPermission();
  if (!permission.canSchedule) {
    return { enabled: false, feed };
  }

  const undelivered = feed.filter((item) => !item.delivered && !item.read);
  if (undelivered.length === 0) {
    return { enabled: true, feed };
  }

  const categoryLabels = Array.from(
    new Set(undelivered.map((item) => item.category)),
  ).slice(0, 3);
  const summaryBody =
    undelivered.length === 1
      ? undelivered[0].body
      : `${undelivered.length} updates are ready: ${categoryLabels.join(', ')}. Open the app to review them together.`;

  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: undelivered.length === 1 ? undelivered[0].title : 'New footprint updates',
      body: summaryBody,
      data: {
        ruleIds: undelivered.map((item) => item.ruleId),
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });

  return {
    enabled: true,
    feed: feed.map((item) =>
      undelivered.some((candidate) => candidate.id === item.id)
        ? { ...item, delivered: true }
        : item,
    ),
  };
};
