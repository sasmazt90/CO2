import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { NotificationCard } from '../components/NotificationCard';
import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { SurfaceCard } from '../components/SurfaceCard';
import { useAppContext } from '../context/AppContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export const NotificationCenterScreen = () => {
  const {
    notificationFeed,
    notificationsEnabled,
    notificationPreferenceEnabled,
    markAllNotificationsRead,
    markNotificationRead,
  } = useAppContext();

  return (
    <Screen>
      <SurfaceCard>
        <SectionTitle
          title="Notification Center"
          subtitle={
            notificationsEnabled
              ? 'Device notifications are enabled and grouped into a single summary when multiple updates arrive together.'
              : notificationPreferenceEnabled
                ? 'The in-app feed is active, but device banners are currently unavailable on this platform.'
                : 'Device notification banners are turned off. The in-app feed stays available here.'
          }
          action={
            notificationFeed.some((item) => !item.read) ? (
              <Pressable onPress={markAllNotificationsRead}>
                <Text style={styles.link}>Mark all read</Text>
              </Pressable>
            ) : undefined
          }
        />
        <Text style={styles.body}>
          Notifications only appear for daily summaries, badges, social events, challenge milestones, and top-list entries.
        </Text>
      </SurfaceCard>

      {notificationFeed.length === 0 ? (
        <SurfaceCard>
          <Text style={styles.body}>No notifications yet.</Text>
        </SurfaceCard>
      ) : null}

      {notificationFeed.map((item) => (
        <NotificationCard
          key={item.id}
          item={item}
          onRead={() => markNotificationRead(item.id)}
        />
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  body: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
  },
  link: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
  },
});
