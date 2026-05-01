import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { Screen } from '../components/Screen';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export const PrivacyScreen = () => (
  <Screen>
    <SurfaceCard>
      <Text style={styles.title}>Privacy</Text>
      <Text style={styles.body}>
        Digital Carbon Footprint Score stores local activity estimates on-device by default and only syncs to cloud services when you explicitly connect social or desktop features.
      </Text>
      <Text style={styles.body}>
        We do not sell personal data. Account and data deletion requests are available at https://www.co2-score.online/delete-account.
      </Text>
      <Text style={styles.body}>
        You can also contact tolgar@sasmaz.digital for data access, privacy, or deletion support.
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
