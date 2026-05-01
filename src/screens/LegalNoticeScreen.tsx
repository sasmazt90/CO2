import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { Screen } from '../components/Screen';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export const LegalNoticeScreen = () => (
  <Screen>
    <SurfaceCard>
      <Text style={styles.title}>Legal notice</Text>
      <Text style={styles.body}>İbrahim Tolgar Şaşmaz</Text>
      <Text style={styles.body}>SASMAZ DIGITAL SOLUTIONS</Text>
      <Text style={styles.body}>81543 Munich, Germany</Text>
      <Text style={styles.body}>tolgar@sasmaz.digital</Text>
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
