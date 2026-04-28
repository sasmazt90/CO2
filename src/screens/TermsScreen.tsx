import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { Screen } from '../components/Screen';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export const TermsScreen = () => (
  <Screen>
    <SurfaceCard>
      <Text style={styles.title}>Terms</Text>
      <Text style={styles.body}>
        Scores, badges, rankings, and challenge progress are informational estimates designed for habit coaching. They are not legal, environmental, or scientific certification outputs.
      </Text>
      <Text style={styles.body}>
        By using connected social and desktop features, you agree that synced profile data can be shared with invited friends inside the app experience.
      </Text>
    </SurfaceCard>
  </Screen>
);

const styles = StyleSheet.create({
  title: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 18,
  },
  body: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 21,
  },
});
