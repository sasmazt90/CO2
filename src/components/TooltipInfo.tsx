import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

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
      {open && reference ? (
        <View style={styles.tooltip}>
          <Text style={styles.summary}>{summary}</Text>
          <Pressable onPress={() => void Linking.openURL(reference.url)}>
            <Text style={styles.link}>{reference.organization}</Text>
          </Pressable>
        </View>
      ) : null}

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
  tooltip: {
    backgroundColor: 'rgba(248,250,247,0.98)',
    borderColor: 'rgba(160,167,162,0.18)',
    borderRadius: radius.md,
    borderWidth: 1,
    bottom: 24,
    maxWidth: 220,
    padding: spacing.sm,
    position: 'absolute',
    right: 0,
    shadowColor: '#87A997',
    shadowOpacity: 0.09,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    zIndex: 2,
  },
  summary: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
  },
  link: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    marginTop: spacing.xs,
    textDecorationLine: 'underline',
  },
});
