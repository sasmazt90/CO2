import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { NotificationItem } from '../engine/types';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { SurfaceCard } from './SurfaceCard';

export const NotificationCard = ({
  item,
  onRead,
}: {
  item: NotificationItem;
  onRead: () => void;
}) => (
  <SurfaceCard style={[styles.card, item.read && styles.cardRead]}>
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.body}>{item.body}</Text>
        <Text style={styles.recommendation}>{item.recommendation}</Text>
        <Text style={styles.source}>{item.source}</Text>
      </View>
      <View style={styles.meta}>
        <View
          style={[
            styles.dot,
            item.kind === 'badge' || item.kind === 'leaderboard'
              ? styles.dotPositive
              : styles.dotImprovement,
          ]}
        />
        {!item.read ? (
          <Pressable onPress={onRead} style={styles.button}>
            <Text style={styles.buttonText}>Mark read</Text>
          </Pressable>
        ) : (
          <Text style={styles.readLabel}>Read</Text>
        )}
      </View>
    </View>
  </SurfaceCard>
);

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
  },
  cardRead: {
    opacity: 0.72,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 15,
  },
  body: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
  },
  recommendation: {
    color: colors.deepTeal,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
  },
  source: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 11,
  },
  meta: {
    alignItems: 'flex-end',
    gap: spacing.sm,
    minWidth: 84,
  },
  dot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  dotPositive: {
    backgroundColor: colors.pastelGreen,
  },
  dotImprovement: {
    backgroundColor: colors.softTeal,
  },
  button: {
    borderColor: 'rgba(137,210,198,0.45)',
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  buttonText: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 11,
  },
  readLabel: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 11,
  },
});
