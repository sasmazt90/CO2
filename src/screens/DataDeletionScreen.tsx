import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { Screen } from '../components/Screen';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export const DataDeletionScreen = () => (
  <Screen>
    <SurfaceCard>
      <Text style={styles.title}>Account and data deletion</Text>
      <Text style={styles.body}>
        Digital Carbon Footprint Score lets you request deletion of your app account profile
        and associated cloud-synced data at any time.
      </Text>
      <Text style={styles.body}>
        To request deletion, email tolgar@sasmaz.digital from the address you use for support
        and include your friend code if you created a social profile. We will delete your
        cloud profile, friend connections, challenge invites, leaderboard snapshots, desktop
        sync data, app preferences, and metric history associated with that profile.
      </Text>
      <Text style={styles.body}>
        Local-only data stored on your device can be removed by deleting the app from your
        device. We may retain limited records only when required for security, fraud
        prevention, legal compliance, or transaction records.
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
