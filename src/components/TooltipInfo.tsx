import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { referenceById } from '../data/scientificReferences';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const TooltipInfo = ({
  summary,
  referenceId,
}: {
  summary: string;
  referenceId: string;
}) => {
  const [open, setOpen] = useState(false);
  const reference = referenceById[referenceId];

  return (
    <View style={styles.wrapper}>
      <Modal animationType="fade" transparent visible={open}>
        <Pressable onPress={() => setOpen(false)} style={styles.overlay}>
          {reference ? (
            <Pressable onPress={() => undefined} style={styles.tooltip}>
              <View style={styles.header}>
                <View style={styles.headerActions}>
                  <Pressable
                    onPress={() => void Linking.openURL(reference.url)}
                    style={styles.iconButton}
                  >
                    <Ionicons name="open-outline" size={18} color={colors.deepTeal} />
                  </Pressable>
                  <Pressable onPress={() => setOpen(false)} style={styles.iconButton}>
                    <Ionicons name="close-outline" size={20} color={colors.forestInk} />
                  </Pressable>
                </View>
              </View>
              <Text style={styles.summary}>{summary}</Text>
              <Text style={styles.referenceTitle}>{reference.title}</Text>
              <Pressable onPress={() => void Linking.openURL(reference.url)} style={styles.linkRow}>
                <Text style={styles.link}>{reference.organization}</Text>
                <Ionicons name="open-outline" size={14} color={colors.deepTeal} />
              </Pressable>
            </Pressable>
          ) : null}
        </Pressable>
      </Modal>

      <Pressable onPress={() => setOpen((current) => !current)} style={styles.trigger}>
        <Ionicons name="information-circle-outline" size={18} color={colors.deepTeal} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'flex-end',
    minWidth: 28,
  },
  trigger: {
    padding: 2,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(78,97,86,0.12)',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  tooltip: {
    backgroundColor: 'rgba(248,250,247,0.98)',
    borderColor: 'rgba(160,167,162,0.18)',
    borderRadius: radius.md,
    borderWidth: 1,
    maxWidth: 320,
    minWidth: 260,
    padding: spacing.md,
    shadowColor: '#87A997',
    shadowOpacity: 0.09,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    zIndex: 2,
  },
  header: {
    alignItems: 'flex-end',
    marginBottom: spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  iconButton: {
    alignItems: 'center',
    borderColor: 'rgba(160,167,162,0.18)',
    borderRadius: 999,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  summary: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
  },
  referenceTitle: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
    marginTop: spacing.sm,
  },
  link: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 12,
  },
  linkRow: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});
