import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { SurfaceCard } from '../components/SurfaceCard';
import {
  summarizeAppUsageCategoryRegistry,
} from '../data/appUsageCategories';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const AppClassifierScreen = () => {
  const categories = summarizeAppUsageCategoryRegistry();

  return (
    <Screen>
      <SurfaceCard>
        <SectionTitle
          title="Usage Classifier"
          subtitle="Which package families feed social and streaming metrics"
        />
        <Text style={styles.body}>
          This registry keeps the native app-usage bridge transparent. Exact package
          names are used where we know them, and softer pattern matching catches close
          variants on Android.
        </Text>
      </SurfaceCard>

      {categories.map((category) => (
        <SurfaceCard key={category.id}>
          <SectionTitle
            title={category.title}
            subtitle={`${category.metric} | ${category.totalMatchers} matchers`}
          />
          <Text style={styles.body}>{category.description}</Text>
          <Text style={styles.subheading}>Exact packages</Text>
          <View style={styles.chips}>
            {category.exactPackages.map((item) => (
              <View key={item} style={styles.chip}>
                <Text style={styles.chipText}>{item}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.subheading}>Fallback patterns</Text>
          <View style={styles.chips}>
            {category.packagePatterns.map((item) => (
              <View key={item} style={styles.chip}>
                <Text style={styles.chipText}>{item}</Text>
              </View>
            ))}
          </View>
        </SurfaceCard>
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
  subheading: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 12,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: 'rgba(221,235,221,0.62)',
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chipText: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 11,
  },
});
