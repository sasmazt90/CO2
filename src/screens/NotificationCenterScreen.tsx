import React from 'react';
import { StyleSheet, Text } from 'react-native';

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
    markNotificationRead,
  } = useAppContext();

  return (
    <Screen>
      <SurfaceCard>
        <SectionTitle
          title="Notification Center"
          subtitle={
            notificationsEnabled
              ? 'Device notifications are enabled where supported.'
              : 'In-app notification feed is active. Device banners may be unavailable on this platform.'
          }
        />
        <Text style={styles.body}>
          Every triggered rule creates a notification, carries a recommendation, and keeps its source attribution attached.
        </Text>
      </SurfaceCard>

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
});
