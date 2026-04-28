export type AdsRuntimeState = {
  initialized: boolean;
  adsReady: boolean;
  canRequestAds: boolean;
  personalizedAdsAllowed: boolean;
  privacyOptionsRequired: boolean;
  consentStatus: 'UNKNOWN';
};

const defaultAdsState: AdsRuntimeState = {
  initialized: false,
  adsReady: false,
  canRequestAds: false,
  personalizedAdsAllowed: false,
  privacyOptionsRequired: false,
  consentStatus: 'UNKNOWN',
};

export const initializeAds = async () => defaultAdsState;

export const subscribeToAdsState = (listener: (state: AdsRuntimeState) => void) => {
  listener(defaultAdsState);
  return () => undefined;
};

export const getAdsState = () => defaultAdsState;

export const getBannerRequestOptions = () => undefined;

export const openAdsPrivacyOptions = async () => defaultAdsState;
