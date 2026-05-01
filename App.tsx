import 'react-native-gesture-handler';

import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  useFonts,
} from '@expo-google-fonts/inter';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { IncomingPairLinkHandler } from './src/components/IncomingPairLinkHandler';
import { DataDeletionScreen } from './src/screens/DataDeletionScreen';
import { DesktopSyncWebScreen } from './src/screens/DesktopSyncWebScreen';
import { LegalNoticeScreen } from './src/screens/LegalNoticeScreen';
import { PrivacyScreen } from './src/screens/PrivacyScreen';
import { TermsScreen } from './src/screens/TermsScreen';
import { initializeAds } from './src/services/adService';
import { AppProvider } from './src/context/AppContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme/colors';

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  React.useEffect(() => {
    void initializeAds();
  }, []);

  const [webPathname, setWebPathname] = React.useState(() =>
    Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.pathname : '',
  );

  React.useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    const handlePopState = () => setWebPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.softTeal} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppProvider>
          <StatusBar style="dark" />
          {Platform.OS === 'web' ? (
            webPathname.startsWith('/sync') || webPathname.startsWith('/web') ? (
              <DesktopSyncWebScreen />
            ) : webPathname.startsWith('/privacy') ? (
              <PrivacyScreen />
            ) : webPathname.startsWith('/delete-account') ||
              webPathname.startsWith('/data-deletion') ? (
              <DataDeletionScreen />
            ) : webPathname.startsWith('/terms') ? (
              <TermsScreen />
            ) : webPathname.startsWith('/legal') ? (
              <LegalNoticeScreen />
            ) : (
              <>
                <IncomingPairLinkHandler />
                <AppNavigator />
              </>
            )
          ) : (
            <>
              <IncomingPairLinkHandler />
              <AppNavigator />
            </>
          )}
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loader: {
    alignItems: 'center',
    backgroundColor: colors.softWhite,
    flex: 1,
    justifyContent: 'center',
  },
});
