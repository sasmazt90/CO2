import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const menuItems = [
  { label: 'Data Sources', route: 'DataSources' },
  { label: 'Bridge Status', route: 'BridgeStatus' },
  { label: 'Usage Access', route: 'UsageAccess' },
  { label: 'Usage Classifier', route: 'AppClassifier' },
  { label: 'Share Card', route: 'ShareCard' },
  { label: 'Notification Center', route: 'NotificationCenter' },
  { label: 'Signal Lab', route: 'SignalLab' },
  { label: 'Our Scientific Method', route: 'Method' },
  { label: 'Badges', route: 'Badges' },
  { label: 'Settings', route: 'Settings' },
] as const;

export const HeaderMenuButton = () => {
  const navigation = useNavigation<any>();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={styles.trigger}>
        <Ionicons name="menu-outline" size={24} color={colors.forestInk} />
      </Pressable>
      <Modal animationType="fade" transparent visible={open}>
        <Pressable onPress={() => setOpen(false)} style={styles.overlay}>
          <View style={styles.sheet}>
            {menuItems.map((item) => (
              <Pressable
                key={item.route}
                onPress={() => {
                  setOpen(false);
                  navigation.navigate(item.route);
                }}
                style={styles.item}
              >
                <Text style={styles.itemText}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    padding: 4,
  },
  overlay: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(78,97,86,0.08)',
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: 72,
  },
  sheet: {
    backgroundColor: colors.softWhite,
    borderColor: 'rgba(160,167,162,0.15)',
    borderRadius: radius.md,
    borderWidth: 1,
    minWidth: 220,
    overflow: 'hidden',
  },
  item: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  itemText: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 14,
  },
});
