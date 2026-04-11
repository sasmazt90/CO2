import * as Sharing from 'expo-sharing';
import React, { useRef, useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { SharePreviewCard } from '../components/SharePreviewCard';
import { SurfaceCard } from '../components/SurfaceCard';
import { useAppContext } from '../context/AppContext';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const ShareCardScreen = () => {
  const { badges, streakDays, todayBreakdown, weeklyAverageScore } = useAppContext();
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef<View>(null);

  const handleShare = async () => {
    setSharing(true);
    try {
      const message = `My Digital Carbon Footprint Score is ${weeklyAverageScore} this week, with a ${streakDays}-day streak.`;
      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share your carbon score card',
        });
      } else {
        await Share.share({ message });
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <Screen>
      <SurfaceCard>
        <SectionTitle title="Share Card" subtitle="A pastel social card for weekly score and badges" />
        <Text style={styles.body}>
          Capture this card for friends, challenge groups, or your own weekly check-in.
        </Text>
      </SurfaceCard>

      <View ref={cardRef} collapsable={false}>
        <SharePreviewCard
          badge={badges[0]}
          score={todayBreakdown.score}
          streak={streakDays}
          weeklyAverage={weeklyAverageScore}
        />
      </View>

      <Pressable onPress={() => void handleShare()} style={styles.button}>
        <Text style={styles.buttonText}>{sharing ? 'Preparing...' : 'Share card'}</Text>
      </Pressable>
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
  button: {
    alignItems: 'center',
    backgroundColor: colors.softTeal,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  buttonText: {
    color: colors.softWhite,
    fontFamily: typography.bodyMedium,
    fontSize: 14,
  },
});
