import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import QRCode from 'qrcode';

import { BrandLogo } from '../components/BrandLogo';
import { SurfaceCard } from '../components/SurfaceCard';
import { useAppContext } from '../context/AppContext';
import { colors, gradients } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import {
  buildPairingDeepLink,
  buildPairingWebUrl,
  getCurrentWebOrigin,
} from '../utils/pairing';

const getSearchCode = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  return params.get('code');
};

export const DesktopSyncWebScreen = () => {
  const { desktopSyncStatus, socialProfile, syncDesktopState, syncSocialGraph } = useAppContext();
  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null);
  const codeFromUrl = getSearchCode();
  const pairingCode = codeFromUrl ?? socialProfile.friendCode;
  const pairingLink = buildPairingWebUrl(pairingCode, getCurrentWebOrigin());
  const appLink = buildPairingDeepLink(pairingCode);

  React.useEffect(() => {
    if (codeFromUrl) {
      return;
    }

    void syncSocialGraph();
    void syncDesktopState();
  }, [codeFromUrl, syncDesktopState, syncSocialGraph]);

  React.useEffect(() => {
    let active = true;

    void QRCode.toDataURL(pairingLink, {
      margin: 1,
      width: 420,
      color: {
        dark: '#4E6156',
        light: '#F8FAF7',
      },
    }).then((url: string) => {
      if (active) {
        setQrDataUrl(url);
      }
    });

    return () => {
      active = false;
    };
  }, [pairingLink]);

  const copyValue = async (value: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(value);
  };

  return (
    <LinearGradient colors={gradients.appBackground} style={styles.page}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <BrandLogo showWordmark size={36} />
          <Text style={styles.title}>Desktop Sync</Text>
          <Text style={styles.subtitle}>
            Pair your phone with this browser session using a manual code or a QR scan.
          </Text>
        </View>

        <SurfaceCard>
          <Text style={styles.sectionTitle}>
            {codeFromUrl ? 'Open this code in the mobile app' : 'Your pairing code'}
          </Text>
          <Text style={styles.code}>{pairingCode}</Text>
          <Text style={styles.note}>
            {codeFromUrl
              ? 'If the app is already installed, tap the button below. If not, open the app and scan this QR or enter the code manually.'
              : `Desktop sync status: ${desktopSyncStatus}. This code stays unique to this browser profile.`}
          </Text>
          <View style={styles.actionRow}>
            <Pressable onPress={() => void copyValue(pairingCode)} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Copy code</Text>
            </Pressable>
            <Pressable onPress={() => void copyValue(pairingLink)} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Copy link</Text>
            </Pressable>
            {codeFromUrl ? (
              <Pressable onPress={() => void Linking.openURL(appLink)} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Open app</Text>
              </Pressable>
            ) : null}
          </View>
        </SurfaceCard>

        <SurfaceCard>
          <Text style={styles.sectionTitle}>Scan with the mobile app</Text>
          {qrDataUrl ? <Image source={{ uri: qrDataUrl }} style={styles.qr} /> : null}
          <Text style={styles.note}>In the app, go to Settings -&gt; Desktop sync -&gt; Scan QR.</Text>
        </SurfaceCard>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  container: {
    alignSelf: 'center',
    flex: 1,
    gap: spacing.md,
    maxWidth: 680,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    width: '100%',
  },
  hero: {
    gap: spacing.xs,
  },
  title: {
    color: colors.forestInk,
    fontFamily: typography.title,
    fontSize: 34,
  },
  subtitle: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 540,
  },
  sectionTitle: {
    color: colors.forestInk,
    fontFamily: typography.title,
    fontSize: 22,
  },
  code: {
    color: colors.deepTeal,
    fontFamily: typography.title,
    fontSize: 34,
    letterSpacing: 1.2,
  },
  note: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 21,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.softTeal,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  primaryButtonText: {
    color: colors.softWhite,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
  },
  secondaryButton: {
    borderColor: colors.softTeal,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  secondaryButtonText: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
  },
  qr: {
    alignSelf: 'center',
    borderRadius: 24,
    height: 260,
    width: 260,
  },
});
