import { 
  BannerAd, 
  BannerAdSize, 
  TestIds,
  InterstitialAd,
  AdEventType,
  RewardedAd,
  RewardedAdEventType
} from 'react-native-google-mobile-ads';

// Configuration AdMob
const ADMOB_CONFIG = {
  // IDs de test pour le développement
  test: {
    banner: TestIds.BANNER,
    interstitial: TestIds.INTERSTITIAL,
    rewarded: TestIds.REWARDED,
  },
  // IDs de production (vos vrais IDs AdMob)
  production: {
    banner: 'ca-app-pub-9648462208898928/9628934155', // Votre ID de bloc d'annonces
    interstitial: 'ca-app-pub-9648462208898928/9628934155', // Même ID pour l'instant
    rewarded: 'ca-app-pub-9648462208898928/9628934155', // Même ID pour l'instant
  }
};

// Utiliser les IDs de test en développement, production en production
const isProduction = __DEV__ ? false : true;
const AD_IDS = isProduction ? ADMOB_CONFIG.production : ADMOB_CONFIG.test;

// Service pour les bannières publicitaires
export const getBannerAdProps = () => {
  return {
    unitId: AD_IDS.banner,
    size: BannerAdSize.BANNER,
    requestOptions: {
      requestNonPersonalizedAdsOnly: true,
    }
  };
};

// Service pour les publicités interstitielles
export const showInterstitialAd = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const interstitial = InterstitialAd.createForAdRequest(AD_IDS.interstitial, {
      requestNonPersonalizedAdsOnly: true,
      keywords: ['location', 'social', 'friends'],
    });

    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      interstitial.show();
    });

    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      resolve(true);
    });

    const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('Erreur publicité interstitielle:', error);
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
      resolve(false);
    });

    interstitial.load();
  });
};

// Service pour les publicités récompensées
export const showRewardedAd = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const rewarded = RewardedAd.createForAdRequest(AD_IDS.rewarded, {
      requestNonPersonalizedAdsOnly: true,
      keywords: ['location', 'social', 'friends'],
    });

    const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      rewarded.show();
    });

    const unsubscribeEarned = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
      console.log('Récompense gagnée:', reward);
    });

    const unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
      resolve(true);
    });

    const unsubscribeError = rewarded.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('Erreur publicité récompensée:', error);
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
      unsubscribeError();
      resolve(false);
    });

    rewarded.load();
  });
};

// Initialisation d'AdMob
export const initializeAdMob = () => {
  // Cette fonction sera appelée au démarrage de l'app
  console.log('AdMob initialisé avec Firebase');
};

export default {
  getBannerAdProps,
  showInterstitialAd,
  showRewardedAd,
  initializeAdMob,
};
