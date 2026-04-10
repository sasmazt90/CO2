import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BadgeMedal } from '../components/BadgeMedal';
import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { SurfaceCard } from '../components/SurfaceCard';
import { createBadges } from '../data/friends';
import { useAppContext } from '../context/AppContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const BadgesScreen = () => {
  const { todayBreakdown } = useAppContext();
  const allBadges = createBadges();

  return (
    <Screen>
      <SurfaceCard>
        <SectionTitle title="Badge sets" subtitle="Bronze, Silver, and Gold with eco-themed iconography" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.row}>
            {allBadges.map((badge) => (
              <View key={badge.id} style={styles.badgeWrap}>
                <BadgeMedal badge={badge} />
                <Text style={styles.caption}>
                  {badge.unlocked(todayBreakdown) ? 'Unlocked today' : 'Keep going'}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SurfaceCard>
    </Screen>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  badgeWrap: {
    gap: spacing.xs,
  },
  caption: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
    textAlign: 'center',
  },
});
