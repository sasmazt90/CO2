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
import { useAppContext } from '../context/AppContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { BadgesScreen } from '../screens/BadgesScreen';
import { AppClassifierScreen } from '../screens/AppClassifierScreen';
import { ChallengesScreen } from '../screens/ChallengesScreen';
import { BridgeStatusScreen } from '../screens/BridgeStatusScreen';
import { DataSourcesScreen } from '../screens/DataSourcesScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { InsightsScreen } from '../screens/InsightsScreen';
import { MethodScreen } from '../screens/MethodScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { NotificationCenterScreen } from '../screens/NotificationCenterScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ShareCardScreen } from '../screens/ShareCardScreen';
import { SignalLabScreen } from '../screens/SignalLabScreen';
import { UsageAccessScreen } from '../screens/UsageAccessScreen';
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
  History: 'stats-chart-outline',
  Challenges: 'trophy-outline',
  Friends: 'people-outline',
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
      headerTitle: () => <BrandLogo size={34} />,
      headerTitleAlign: 'left',
      headerRight: () => <HeaderMenuButton />,
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: colors.softWhite,
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Insights" component={InsightsScreen} />
    <Tab.Screen name="History" component={HistoryScreen} />
    <Tab.Screen name="Challenges" component={ChallengesScreen} />
    <Tab.Screen name="Friends" component={FriendsScreen} />
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
          <Stack.Screen name="DataSources" component={DataSourcesScreen} options={{ title: 'Data Sources' }} />
          <Stack.Screen name="BridgeStatus" component={BridgeStatusScreen} options={{ title: 'Bridge Status' }} />
          <Stack.Screen name="UsageAccess" component={UsageAccessScreen} options={{ title: 'Usage Access' }} />
          <Stack.Screen name="AppClassifier" component={AppClassifierScreen} options={{ title: 'Usage Classifier' }} />
          <Stack.Screen name="Method" component={MethodScreen} options={{ title: 'Our Scientific Method' }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
          <Stack.Screen name="Badges" component={BadgesScreen} options={{ title: 'Badges' }} />
          <Stack.Screen name="SignalLab" component={SignalLabScreen} options={{ title: 'Signal Lab' }} />
          <Stack.Screen
            name="NotificationCenter"
            component={NotificationCenterScreen}
            options={{ title: 'Notification Center' }}
          />
          <Stack.Screen name="ShareCard" component={ShareCardScreen} options={{ title: 'Share Card' }} />
        </Stack.Navigator>
      ) : (
        <OnboardingScreen />
      )}
    </NavigationContainer>
  );
};
