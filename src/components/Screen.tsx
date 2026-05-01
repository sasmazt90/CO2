import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { gradients } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  includeTopInset?: boolean;
}

export const Screen = ({
  children,
  scrollable = true,
  contentContainerStyle,
  includeTopInset = false,
}: ScreenProps) => {
  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.scrollContent, contentContainerStyle]}>{children}</View>
  );

  return (
    <LinearGradient colors={gradients.appBackground} style={styles.gradient}>
      <SafeAreaView edges={includeTopInset ? ['top'] : []} style={styles.safeArea}>
        {content}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.xs,
    gap: spacing.md,
  },
});
