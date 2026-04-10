import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BadgeMedal } from '../components/BadgeMedal';
import { ChallengeCard } from '../components/ChallengeCard';
import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { SurfaceCard } from '../components/SurfaceCard';
import { useAppContext } from '../context/AppContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const ChallengesScreen = () => {
  const {
    availableChallenges,
    badges,
    joinedChallenges,
    todayMetrics,
    toggleChallenge,
  } = useAppContext();

  return (
    <Screen>
      <SurfaceCard>
        <SectionTitle title="Weekly challenges" subtitle="Join calm habit loops with clear progress" />
        {availableChallenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            joined={joinedChallenges.includes(challenge.id)}
            metrics={todayMetrics}
            onToggle={() => toggleChallenge(challenge.id)}
          />
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle title="Badge cabinet" subtitle="Soft metallic levels for your recent wins" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.badgeRow}>
            {badges.map((badge) => (
              <BadgeMedal key={badge.id} badge={badge} />
            ))}
          </View>
        </ScrollView>
        <Text style={styles.note}>
          Bronze, Silver, and Gold badges are powered by the same daily rule engine.
        </Text>
      </SurfaceCard>
    </Screen>
  );
};

const styles = StyleSheet.create({
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  note: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
  },
});
