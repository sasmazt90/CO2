import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { gradients } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

export const SurfaceCard = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) => (
  <LinearGradient colors={gradients.gentleCard} style={[styles.card, style]}>
    {children}
  </LinearGradient>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(160,167,162,0.12)',
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: '#8AAE9A',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
});
