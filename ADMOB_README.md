# 📱 **Guide d'intégration AdMob avec Firebase**

## 🚀 **Configuration terminée !**

Votre application LOVMAP est maintenant configurée pour utiliser AdMob via Firebase.

## 📋 **Ce qui a été configuré :**

### 1. **Dépendances installées :**
- `react-native-google-mobile-ads` : SDK AdMob pour React Native
- `play-services-ads` : Services Google Play pour Android

### 2. **Fichiers modifiés :**
- `android/app/build.gradle` : Ajout de la dépendance AdMob
- `android/app/src/main/AndroidManifest.xml` : Configuration AdMob
- `App.tsx` : Initialisation d'AdMob au démarrage
- `src/lib/adMobService.ts` : Service de gestion des publicités
- `src/components/AdBanner.tsx` : Composant bannière publicitaire

### 3. **Fonctionnalités disponibles :**
- ✅ **Bannières publicitaires** : Affichage en bas d'écran
- ✅ **Publicités interstitielles** : Plein écran entre les actions
- ✅ **Publicités récompensées** : Avec récompenses pour l'utilisateur
- ✅ **Configuration Firebase** : Centralisée et sécurisée

## 🔧 **Comment utiliser :**

### **Bannière publicitaire :**
```tsx
import { AdBanner } from '../components';

// Dans votre composant
<AdBanner size={BannerAdSize.BANNER} />
```

### **Publicité interstitielle :**
```tsx
import { showInterstitialAd } from '../lib/adMobService';

// Afficher une pub (ex: après ajout d'un LOV)
const handleAddLove = async () => {
  // Votre logique d'ajout de LOV
  await addLove();
  
  // Afficher la pub
  await showInterstitialAd();
};
```

### **Publicité récompensée :**
```tsx
import { showRewardedAd } from '../lib/adMobService';

// Afficher une pub avec récompense
const handleRewardedAd = async () => {
  const success = await showRewardedAd();
  if (success) {
    // Donner la récompense à l'utilisateur
    giveReward();
  }
};
```

## 🎯 **Prochaines étapes :**

### 1. **Dans la console Firebase :**
- Allez sur [console.firebase.google.com](https://console.firebase.google.com)
- Sélectionnez votre projet LOVMAP
- Cliquez sur **"AdMob"** dans le menu
- Suivez les instructions pour lier votre compte AdMob

### 2. **Remplacer les IDs de test :**
Dans `src/lib/adMobService.ts`, remplacez les IDs de test par vos vrais IDs :
```typescript
production: {
  banner: 'ca-app-pub-VOTRE_ID_BANNER',
  interstitial: 'ca-app-pub-VOTRE_ID_INTERSTITIEL',
  rewarded: 'ca-app-pub-VOTRE_ID_RECOMPENSE',
}
```

### 3. **Tester les publicités :**
- Les IDs de test fonctionnent en mode développement
- Les vrais IDs fonctionnent en production
- Testez sur un appareil physique (pas d'émulateur)

## 📊 **Types de publicités recommandés pour LOVMAP :**

### **Bannières :**
- En bas de l'écran principal
- Dans l'historique des notifications
- Sur les écrans de paramètres

### **Interstitielles :**
- Après ajout d'un LOV
- Après ajout d'un ami
- Entre les actions importantes

### **Récompensées :**
- Pour débloquer des fonctionnalités premium
- Pour obtenir des bonus temporaires
- Pour accélérer certaines actions

## 🔒 **Sécurité et conformité :**

- ✅ **Publicités non personnalisées** : Respect de la vie privée
- ✅ **Mots-clés appropriés** : Publicités contextuelles
- ✅ **Gestion des erreurs** : Fallback en cas de problème
- ✅ **Configuration Firebase** : Centralisée et sécurisée

## 🚨 **Important :**

1. **Testez d'abord** avec les IDs de test
2. **Remplacez les IDs** avant la production
3. **Respectez les règles** Google AdMob
4. **Surveillez les performances** dans Firebase Analytics

## 📞 **Support :**

- **Documentation AdMob** : [developers.google.com/admob](https://developers.google.com/admob)
- **Console Firebase** : [console.firebase.google.com](https://console.firebase.google.com)
- **Console AdMob** : [admob.google.com](https://admob.google.com)

---

🎉 **Félicitations ! Votre app LOVMAP est maintenant prête pour la monétisation publicitaire !**
