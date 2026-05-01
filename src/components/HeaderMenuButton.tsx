import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const menuItems = [
  { label: 'How We Calculate', route: 'Method' },
  { label: 'References', route: 'References' },
  { label: 'Tracked Metrics', route: 'MetricTracking' },
  { label: 'Settings', route: 'Settings' },
  { label: 'Privacy', route: 'Privacy' },
  { label: 'Terms', route: 'Terms' },
  { label: 'Legal Notice', route: 'LegalNotice' },
] as const;

export const HeaderMenuButton = () => {
  const navigation = useNavigation<any>();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={styles.trigger}>
        <Ionicons name="menu-outline" size={28} color={colors.forestInk} />
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
    marginLeft: spacing.xs,
    minHeight: 44,
    minWidth: 44,
    padding: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(78,97,86,0.08)',
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: 64,
  },
  sheet: {
    backgroundColor: colors.softWhite,
    borderColor: 'rgba(160,167,162,0.15)',
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 200,
    overflow: 'hidden',
    shadowColor: '#7EA395',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  item: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  itemText: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 14,
  },
});
