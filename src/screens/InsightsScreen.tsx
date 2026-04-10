import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { BreakdownRow } from '../components/BreakdownRow';
import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { SurfaceCard } from '../components/SurfaceCard';
import { useAppContext } from '../context/AppContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export const InsightsScreen = () => {
  const { todayBreakdown } = useAppContext();

  return (
    <Screen>
      <SurfaceCard>
        <SectionTitle title="Daily coach" subtitle="Deterministic insights from the active rule set" />
        <Text style={styles.body}>{todayBreakdown.primaryInsight}</Text>
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle title="What helped" subtitle="Positive outcomes still include a recommendation and source" />
        {todayBreakdown.topPositive.map((entry) => (
          <BreakdownRow key={entry.id} entry={entry} />
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle title="What changed your score" subtitle="Each rule writes a notification, recommendation, and source line" />
        {todayBreakdown.entries.map((entry) => (
          <BreakdownRow key={entry.id} entry={entry} />
        ))}
      </SurfaceCard>
    </Screen>
  );
};

const styles = StyleSheet.create({
  body: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
});
