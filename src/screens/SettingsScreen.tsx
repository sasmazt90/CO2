import React from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { DesktopQrScannerModal } from '../components/DesktopQrScannerModal';
import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { SurfaceCard } from '../components/SurfaceCard';
import { useAppContext } from '../context/AppContext';
import {
  getAdsState,
  openAdsPrivacyOptions,
  subscribeToAdsState,
} from '../services/adService';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const SettingsScreen = () => {
  const {
    addFriend,
    desktopSyncStatus,
    notificationPreferenceEnabled,
    notificationsEnabled,
    pairDesktopByCode,
    resetLocalData,
    setNotificationPreferenceEnabled,
    socialProfile,
    socialSyncStatus,
    syncDesktopState,
    syncSocialGraph,
    updateSocialProfile,
  } = useAppContext();
  const [displayName, setDisplayName] = React.useState(socialProfile.displayName);
  const [friendCode, setFriendCode] = React.useState('');
  const [desktopCode, setDesktopCode] = React.useState('');
  const [scannerVisible, setScannerVisible] = React.useState(false);
  const [adsState, setAdsState] = React.useState(() => getAdsState());

  React.useEffect(() => {
    setDisplayName(socialProfile.displayName);
  }, [socialProfile.displayName]);

  React.useEffect(() => subscribeToAdsState(setAdsState), []);

  return (
    <Screen>
      <DesktopQrScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScanned={async (code) => {
          try {
            await pairDesktopByCode(code);
            setDesktopCode('');
            Alert.alert('Desktop paired', 'The QR code was scanned and this phone is now paired.');
          } catch {
            Alert.alert('Pairing failed', 'The QR code was valid, but the desktop profile could not be paired.');
          }
        }}
      />

      <SurfaceCard>
        <SectionTitle title="Invite code" subtitle="Share this code with friends so they can add you" />
        <Text style={styles.body}>{socialProfile.friendCode}</Text>
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle
          title="Notifications"
          subtitle="Choose whether this app may show device-level notification banners"
        />
        <View style={styles.toggleRow}>
          <View style={styles.toggleCopy}>
            <Text style={styles.toggleTitle}>Allow notification banners</Text>
            <Text style={styles.meta}>
              {notificationsEnabled && notificationPreferenceEnabled
                ? 'Enabled. We send one combined alert when multiple updates arrive together.'
                : 'Disabled. You can still read updates inside the in-app notification center.'}
            </Text>
          </View>
          <Switch
            onValueChange={setNotificationPreferenceEnabled}
            thumbColor={notificationPreferenceEnabled ? colors.softWhite : '#F5F5F5'}
            trackColor={{ false: 'rgba(160,167,162,0.28)', true: colors.softTeal }}
            value={notificationPreferenceEnabled}
          />
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle
          title="Ad privacy choices"
          subtitle="Users should be able to review ad consent after onboarding"
        />
        <Text style={styles.body}>
          {adsState.personalizedAdsAllowed
            ? 'Personalized ads are currently allowed on this device.'
            : 'Personalized ads are currently unavailable on this device or for this region.'}
        </Text>
        <Text style={styles.meta}>
          Consent status: {adsState.consentStatus}. Privacy options{' '}
          {adsState.privacyOptionsRequired ? 'are available here.' : 'are not required right now.'}
        </Text>
        <Pressable
          onPress={() =>
            void openAdsPrivacyOptions()
              .then(() => {
                Alert.alert(
                  'Ad privacy updated',
                  'Your ad privacy choices were refreshed for this device.',
                );
              })
              .catch(() => {
                Alert.alert(
                  'Privacy options unavailable',
                  'No additional ad privacy form is available right now.',
                );
              })
          }
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Review ad privacy choices</Text>
        </Pressable>
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle title="Username" subtitle="This is the name shown in rankings and invites" />
        <TextInput
          onChangeText={setDisplayName}
          placeholder="Your name"
          placeholderTextColor={colors.warmGray}
          style={styles.input}
          value={displayName}
        />
        <Pressable onPress={() => void updateSocialProfile({ displayName })} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Save username</Text>
        </Pressable>
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle title="Your circle" subtitle="Manage friends and your social profile" />
        <Text style={styles.meta}>Social sync: {socialSyncStatus}</Text>
        <View style={styles.readOnlyField}>
          <Text style={styles.readOnlyLabel}>City</Text>
          <Text style={styles.readOnlyValue}>{socialProfile.city}</Text>
        </View>
        <TextInput
          autoCapitalize="characters"
          onChangeText={setFriendCode}
          placeholder="Enter friend code"
          placeholderTextColor={colors.warmGray}
          style={styles.input}
          value={friendCode}
        />
        <View style={styles.actionRow}>
          <Pressable
            onPress={() => {
              void addFriend(friendCode);
              setFriendCode('');
            }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Add friend</Text>
          </Pressable>
          <Pressable onPress={() => void syncSocialGraph()} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Refresh cloud</Text>
          </Pressable>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle title="Desktop sync" subtitle="Enter the desktop code to pair this phone with your desktop app" />
        <Text style={styles.meta}>Current status: {desktopSyncStatus}</Text>
        <Text style={styles.body}>
          Open `co2-score.online/web` on your desktop, then either type the code below or scan the QR.
        </Text>
        <TextInput
          autoCapitalize="characters"
          onChangeText={setDesktopCode}
          placeholder="Desktop pairing code"
          placeholderTextColor={colors.warmGray}
          style={styles.input}
          value={desktopCode}
        />
        <View style={styles.actionRow}>
          <Pressable
            onPress={() => {
              void pairDesktopByCode(desktopCode);
              setDesktopCode('');
            }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Pair desktop</Text>
          </Pressable>
          <Pressable onPress={() => setScannerVisible(true)} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Scan QR</Text>
          </Pressable>
          <Pressable onPress={() => void syncDesktopState()} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Sync now</Text>
          </Pressable>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle title="Delete my data" subtitle="Clear local app history and restart onboarding" />
        <Text style={styles.body}>
          This removes locally stored score history, onboarding state, and profile data from this device.
        </Text>
        <Pressable
          onPress={() =>
            Alert.alert('Delete local data?', 'This will reset the app on this device.', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                  void resetLocalData();
                },
              },
            ])
          }
          style={styles.dangerButton}
        >
          <Text style={styles.dangerButtonText}>Delete my data</Text>
        </Pressable>
      </SurfaceCard>
    </Screen>
  );
};

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  body: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
  },
  input: {
    borderColor: 'rgba(160,167,162,0.18)',
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  meta: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
  },
  readOnlyField: {
    borderColor: 'rgba(160,167,162,0.18)',
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  readOnlyLabel: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 11,
  },
  readOnlyValue: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    marginTop: spacing.xxs,
  },
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  toggleCopy: {
    flex: 1,
    gap: spacing.xxs,
  },
  toggleTitle: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 14,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.softTeal,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  primaryButtonText: {
    color: colors.softWhite,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    borderColor: colors.softTeal,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  secondaryButtonText: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
  },
  dangerButton: {
    alignSelf: 'flex-start',
    borderColor: '#D28181',
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dangerButtonText: {
    color: '#A45858',
    fontFamily: typography.bodyMedium,
    fontSize: 13,
  },
});
