import React, { useMemo } from 'react';
import { Linking, Pressable, StyleSheet, Text } from 'react-native';

import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { buildReferenceUsage } from '../services/methodology';

export const ReferencesScreen = () => {
  const references = useMemo(() => buildReferenceUsage(), []);

  return (
    <Screen>
      <SurfaceCard>
        <SectionTitle
          title="References"
          subtitle="Scientific papers and platform documentation used in the score logic"
        />
        {references.map(({ reference, outcomeCount, categoryCount }) => (
          <Pressable
            key={reference.id}
            onPress={() => void Linking.openURL(reference.url)}
            style={styles.reference}
          >
            <Text style={styles.title}>{reference.title}</Text>
            <Text style={styles.meta}>
              {reference.organization} • {categoryCount} categories • {outcomeCount} rules
            </Text>
            <Text style={styles.body}>{reference.citation}</Text>
            <Text style={styles.note}>{reference.note}</Text>
          </Pressable>
        ))}
      </SurfaceCard>
    </Screen>
  );
};

const styles = StyleSheet.create({
  reference: {
    borderTopColor: 'rgba(160,167,162,0.12)',
    borderTopWidth: 1,
    gap: spacing.xxs,
    paddingTop: spacing.sm,
  },
  title: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 15,
  },
  meta: {
    color: colors.deepTeal,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
  },
  body: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
  },
  note: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
  },
});
