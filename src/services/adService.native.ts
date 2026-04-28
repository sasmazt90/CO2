import mobileAds, {
  AdsConsent,
  AdsConsentInfo,
  AdsConsentPrivacyOptionsRequirementStatus,
  AdsConsentStatus,
  MaxAdContentRating,
  RequestOptions,
} from 'react-native-google-mobile-ads';

export type AdsRuntimeState = {
  initialized: boolean;
  adsReady: boolean;
  canRequestAds: boolean;
  personalizedAdsAllowed: boolean;
  privacyOptionsRequired: boolean;
  consentStatus: AdsConsentInfo['status'] | 'UNKNOWN';
};

const defaultAdsState: AdsRuntimeState = {
  initialized: false,
  adsReady: false,
  canRequestAds: false,
  personalizedAdsAllowed: false,
  privacyOptionsRequired: false,
  consentStatus: 'UNKNOWN',
};

let adsInitialized = false;
let currentAdsState: AdsRuntimeState = defaultAdsState;
const listeners = new Set<(state: AdsRuntimeState) => void>();

const emitAdsState = (state: Partial<AdsRuntimeState>) => {
  currentAdsState = { ...currentAdsState, ...state };
  listeners.forEach((listener) => listener(currentAdsState));
};

const derivePersonalizationState = async (consentInfo: AdsConsentInfo) => {
  if (!consentInfo.canRequestAds) {
    return false;
  }

  if (consentInfo.status === AdsConsentStatus.NOT_REQUIRED) {
    return true;
  }

  try {
    const userChoices = await AdsConsent.getUserChoices();
    return (
      userChoices.selectPersonalisedAds ||
      userChoices.createAPersonalisedAdsProfile ||
      userChoices.storeAndAccessInformationOnDevice
    );
  } catch {
    return false;
  }
};

const syncConsentState = async (consentInfo: AdsConsentInfo) => {
  const personalizedAdsAllowed = await derivePersonalizationState(consentInfo);

  emitAdsState({
    initialized: true,
    adsReady: consentInfo.canRequestAds,
    canRequestAds: consentInfo.canRequestAds,
    personalizedAdsAllowed,
    privacyOptionsRequired:
      consentInfo.privacyOptionsRequirementStatus ===
      AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
    consentStatus: consentInfo.status,
  });

  return {
    ...currentAdsState,
    personalizedAdsAllowed,
  };
};

export const subscribeToAdsState = (listener: (state: AdsRuntimeState) => void) => {
  listeners.add(listener);
  listener(currentAdsState);

  return () => {
    listeners.delete(listener);
  };
};

export const getAdsState = () => currentAdsState;

export const getBannerRequestOptions = (): RequestOptions | undefined => {
  if (!currentAdsState.adsReady) {
    return undefined;
  }

  if (currentAdsState.personalizedAdsAllowed) {
    return undefined;
  }

  return {
    requestNonPersonalizedAdsOnly: true,
  };
};

export const initializeAds = async () => {
  if (adsInitialized) {
    return currentAdsState;
  }

  await mobileAds().setRequestConfiguration({
    maxAdContentRating: MaxAdContentRating.PG,
    tagForChildDirectedTreatment: false,
    tagForUnderAgeOfConsent: false,
  });

  let consentInfo: AdsConsentInfo;

  try {
    consentInfo = await AdsConsent.gatherConsent({
      tagForUnderAgeOfConsent: false,
    });
  } catch {
    consentInfo = await AdsConsent.getConsentInfo();
  }

  await syncConsentState(consentInfo);

  if (currentAdsState.canRequestAds) {
    await mobileAds().initialize();
    adsInitialized = true;
  }

  return currentAdsState;
};

export const openAdsPrivacyOptions = async () => {
  const consentInfo = await AdsConsent.showPrivacyOptionsForm();
  await syncConsentState(consentInfo);
  return currentAdsState;
};
