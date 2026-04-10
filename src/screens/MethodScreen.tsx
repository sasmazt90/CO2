import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { SurfaceCard } from '../components/SurfaceCard';
import { scientificReferences } from '../data/scientificReferences';
import { carbonRules, thresholds } from '../engine/rules';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const groupDescriptions = [
  {
    title: 'How the score is calculated',
    body: 'Start from a calm baseline score of 78, then add or subtract the impact of each triggered rule. The result is clamped between 0 and 100 and converted into an estimated daily CO2e figure.',
  },
  {
    title: 'Why digital behavior affects CO2',
    body: 'Display power, radios, cloud traffic, charging patterns, and transport choices all shape the total energy used around a mobile device and its supporting infrastructure.',
  },
  {
    title: 'Data privacy',
    body: 'The current experience keeps analysis on-device and explains every rule in plain language. Only user-approved signals should be read by platform integrations.',
  },
];

export const MethodScreen = () => (
  <Screen>
    <SurfaceCard>
      <SectionTitle title="Our Scientific Method" subtitle="Full breakdown of formulas, rule groups, and sources" />
      {groupDescriptions.map((item) => (
        <View key={item.title} style={styles.block}>
          <Text style={styles.blockTitle}>{item.title}</Text>
          <Text style={styles.body}>{item.body}</Text>
        </View>
      ))}
    </SurfaceCard>

    <SurfaceCard>
      <SectionTitle title="Threshold notes" subtitle="Default constants for open-ended conditions" />
      <Text style={styles.body}>Location requests threshold: {thresholds.locationRequests}</Text>
      <Text style={styles.body}>Auto-play threshold: {thresholds.autoplayVideosCount} videos</Text>
      <Text style={styles.body}>Duplicate media threshold: {thresholds.duplicateMedia} files</Text>
      <Text style={styles.body}>Battery extremes threshold: {thresholds.batteryExtremeMinutes} minutes</Text>
      <Text style={styles.body}>Radio high-power threshold: {thresholds.radioHighPowerTime} minutes</Text>
    </SurfaceCard>

    <SurfaceCard>
      <SectionTitle title="Rule groups" subtitle={`All ${carbonRules.length} outcome rules are active`} />
      {['Device Energy', 'Network & Cloud', 'Audio', 'Behavioral', 'Charging', 'Processing & Sensors'].map(
        (group) => (
          <View key={group} style={styles.block}>
            <Text style={styles.blockTitle}>{group}</Text>
            <Text style={styles.body}>
              {carbonRules.filter((rule) => rule.group === group).length} outcome rules contribute to this section.
            </Text>
          </View>
        ),
      )}
    </SurfaceCard>

    <SurfaceCard>
      <SectionTitle title="References" subtitle="Tap any source to open the full paper or documentation" />
      {scientificReferences.map((reference) => (
        <Pressable
          key={reference.id}
          onPress={() => void Linking.openURL(reference.url)}
          style={styles.reference}
        >
          <Text style={styles.blockTitle}>{reference.title}</Text>
          <Text style={styles.referenceMeta}>{reference.organization}</Text>
          <Text style={styles.body}>{reference.citation}</Text>
        </Pressable>
      ))}
    </SurfaceCard>
  </Screen>
);

const styles = StyleSheet.create({
  block: {
    gap: spacing.xs,
  },
  blockTitle: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 15,
  },
  body: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
  },
  reference: {
    borderTopColor: 'rgba(160,167,162,0.12)',
    borderTopWidth: 1,
    gap: spacing.xxs,
    paddingTop: spacing.sm,
  },
  referenceMeta: {
    color: colors.deepTeal,
    fontFamily: typography.body,
    fontSize: 12,
  },
});
