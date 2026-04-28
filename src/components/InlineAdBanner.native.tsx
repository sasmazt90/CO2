import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds, useForeground } from 'react-native-google-mobile-ads';

import { adsConfig } from '../config/ads';
import {
  getAdsState,
  getBannerRequestOptions,
  subscribeToAdsState,
} from '../services/adService';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type InlineAdBannerProps = {
  placement: keyof typeof adsConfig.placements;
};

export const InlineAdBanner = ({ placement }: InlineAdBannerProps) => {
  const [adsState, setAdsState] = React.useState(() => getAdsState());
  const [bannerLoaded, setBannerLoaded] = React.useState(false);
  const [bannerFailed, setBannerFailed] = React.useState(false);
  const [bannerSize, setBannerSize] = React.useState(BannerAdSize.LARGE_ANCHORED_ADAPTIVE_BANNER);
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => subscribeToAdsState(setAdsState), []);

  useForeground(() => {
    if (Platform.OS !== 'ios') {
      return;
    }

    setBannerLoaded(false);
    setBannerFailed(false);
    setBannerSize(BannerAdSize.LARGE_ANCHORED_ADAPTIVE_BANNER);
    setReloadKey((current) => current + 1);
  });

  const platformKey = Platform.OS === 'ios' ? 'ios' : 'android';
  const adUnitId = adsConfig.useTestAds
    ? TestIds.ADAPTIVE_BANNER
    : adsConfig.placements[placement][platformKey];
  const caption = adsConfig.useTestAds
    ? 'Test ad placement for pre-launch QA'
    : adsState.personalizedAdsAllowed
      ? 'Sponsored content personalized under your current ad choices'
      : 'Sponsored content shown under your current privacy choices';

  if (!adsConfig.useTestAds && !adsState.adsReady) {
    return null;
  }

  return (
    <View style={styles.shell}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>Sponsored</Text>
        <Text style={styles.caption}>{caption}</Text>
      </View>
      <View style={styles.bannerWrap}>
        {!bannerLoaded ? (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              {bannerFailed ? 'Sponsored content is unavailable right now.' : 'Loading sponsored content...'}
            </Text>
          </View>
        ) : null}
        <BannerAd
          key={`${placement}-${bannerSize}-${reloadKey}-${adsState.personalizedAdsAllowed ? 'personalized' : 'non-personalized'}`}
          unitId={adUnitId}
          size={bannerSize}
          requestOptions={adsConfig.useTestAds ? undefined : getBannerRequestOptions()}
          onAdFailedToLoad={() => {
            if (bannerSize !== BannerAdSize.BANNER) {
              setBannerLoaded(false);
              setBannerFailed(false);
              setBannerSize(BannerAdSize.BANNER);
              setReloadKey((current) => current + 1);
              return;
            }

            setBannerFailed(true);
            setBannerLoaded(false);
          }}
          onAdLoaded={() => {
            setBannerFailed(false);
            setBannerLoaded(true);
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderColor: 'rgba(137,210,198,0.28)',
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  headerRow: {
    gap: spacing.xxs,
  },
  label: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  caption: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
  },
  bannerWrap: {
    alignItems: 'center',
    minHeight: 60,
    overflow: 'hidden',
  },
  placeholder: {
    alignItems: 'center',
    backgroundColor: 'rgba(143,215,200,0.08)',
    borderRadius: radius.md,
    justifyContent: 'center',
    minHeight: 60,
    paddingHorizontal: spacing.sm,
    width: '100%',
  },
  placeholderText: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
    textAlign: 'center',
  },
});
