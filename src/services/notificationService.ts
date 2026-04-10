import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { CarbonScoreBreakdown, NotificationItem } from '../engine/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const buildNotificationFeed = (
  breakdown: CarbonScoreBreakdown,
  existing: NotificationItem[] = [],
): NotificationItem[] => {
  const existingMap = new Map(existing.map((item) => [item.ruleId, item]));

  const nextItems = breakdown.entries.map<NotificationItem>((entry) => ({
    id: existingMap.get(entry.id)?.id ?? `notification-${entry.id}`,
    ruleId: entry.id,
    title: entry.category,
    body: entry.notification,
    recommendation: entry.recommendation,
    source: entry.source,
    createdAt: breakdown.date,
    category: entry.category,
    read: existingMap.get(entry.id)?.read ?? false,
    kind: entry.scoreImpact >= 0 ? 'positive' : 'improvement',
  }));

  return nextItems.sort((left, right) => {
    if (left.kind !== right.kind) {
      return left.kind === 'improvement' ? -1 : 1;
    }

    return left.category.localeCompare(right.category);
  });
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
    return false;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();

  const topItems = feed.slice(0, 3);
  await Promise.all(
    topItems.map((item, index) =>
      Notifications.scheduleNotificationAsync({
        content: {
          title: item.title,
          body: item.body,
          data: { ruleId: item.ruleId },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2 + index * 2,
        },
      }),
    ),
  );

  return true;
};
