import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAppContext } from '../context/AppContext';
import { colors } from '../theme/colors';

export const HeaderNotificationButton = () => {
  const navigation = useNavigation<any>();
  const { notificationFeed } = useAppContext();
  const unreadCount = notificationFeed.filter((item) => !item.read).length;

  return (
    <Pressable onPress={() => navigation.navigate('NotificationCenter')} style={styles.trigger}>
      <Ionicons
        color={unreadCount > 0 ? colors.deepTeal : colors.warmGray}
        name={unreadCount > 0 ? 'notifications' : 'notifications-outline'}
        size={22}
      />
      <View style={[styles.indicator, unreadCount > 0 ? styles.indicatorActive : styles.indicatorIdle]} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  trigger: {
    padding: 4,
  },
  indicator: {
    borderRadius: 999,
    height: 8,
    position: 'absolute',
    right: 2,
    top: 2,
    width: 8,
  },
  indicatorActive: {
    backgroundColor: '#E67C73',
  },
  indicatorIdle: {
    backgroundColor: 'rgba(160,167,162,0.24)',
  },
});
