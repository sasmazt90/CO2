import { Ionicons } from '@expo/vector-icons';
import {
  NavigationContainer,
  DefaultTheme,
  Theme as NavigationTheme,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { BrandLogo } from '../components/BrandLogo';
import { HeaderMenuButton } from '../components/HeaderMenuButton';
import { HeaderNotificationButton } from '../components/HeaderNotificationButton';
import { useAppContext } from '../context/AppContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { ChallengesScreen } from '../screens/ChallengesScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { InsightsScreen } from '../screens/InsightsScreen';
import { LegalNoticeScreen } from '../screens/LegalNoticeScreen';
import { MethodScreen } from '../screens/MethodScreen';
import { MetricTrackingScreen } from '../screens/MetricTrackingScreen';
import { NotificationCenterScreen } from '../screens/NotificationCenterScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { PrivacyScreen } from '../screens/PrivacyScreen';
import { ReferencesScreen } from '../screens/ReferencesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TermsScreen } from '../screens/TermsScreen';
import { MainTabParamList, RootStackParamList } from './types';

const navigationTheme: NavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.softWhite,
    card: colors.softWhite,
    text: colors.forestInk,
    border: 'rgba(160,167,162,0.08)',
    primary: colors.softTeal,
    notification: colors.pastelGreen,
  },
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const tabIconByRoute: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'leaf-outline',
  Insights: 'sparkles-outline',
  Challenges: 'people-outline',
  Leaderboard: 'trophy-outline',
};

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarActiveTintColor: colors.forestInk,
      tabBarInactiveTintColor: colors.warmGray,
      tabBarLabelStyle: {
        fontFamily: typography.body,
        fontSize: 11,
      },
      tabBarStyle: {
        backgroundColor: 'rgba(248,250,247,0.98)',
        borderTopWidth: 0,
        elevation: 0,
        height: 74,
        paddingBottom: 12,
        paddingTop: 10,
      },
      tabBarIcon: ({ color, size }) => (
        <Ionicons name={tabIconByRoute[route.name as keyof MainTabParamList]} size={size} color={color} />
      ),
      headerTitle: () => <BrandLogo size={28} showWordmark />,
      headerTitleAlign: 'left',
      headerRight: () => (
        <>
          <HeaderNotificationButton />
          <HeaderMenuButton />
        </>
      ),
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: colors.softWhite,
      },
      headerTitleContainerStyle: {
        left: 16,
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Insights" component={InsightsScreen} />
    <Tab.Screen name="Challenges" component={ChallengesScreen} />
    <Tab.Screen name="Leaderboard" component={FriendsScreen} />
  </Tab.Navigator>
);

export const AppNavigator = () => {
  const { hasCompletedOnboarding } = useAppContext();

  return (
    <NavigationContainer theme={navigationTheme}>
      {hasCompletedOnboarding ? (
        <Stack.Navigator
          screenOptions={{
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.softWhite },
            headerTintColor: colors.forestInk,
            headerTitleStyle: {
              fontFamily: typography.bodyMedium,
            },
          }}
        >
          <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="Method" component={MethodScreen} options={{ title: 'How We Calculate' }} />
          <Stack.Screen name="References" component={ReferencesScreen} options={{ title: 'References' }} />
          <Stack.Screen name="NotificationCenter" component={NotificationCenterScreen} options={{ title: 'Notifications' }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
          <Stack.Screen name="MetricTracking" component={MetricTrackingScreen} options={{ title: 'Tracked metrics' }} />
          <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ title: 'Privacy' }} />
          <Stack.Screen name="Terms" component={TermsScreen} options={{ title: 'Terms' }} />
          <Stack.Screen name="LegalNotice" component={LegalNoticeScreen} options={{ title: 'Legal notice' }} />
        </Stack.Navigator>
      ) : (
        <OnboardingScreen />
      )}
    </NavigationContainer>
  );
};
