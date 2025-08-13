# 🔧 Résolution de l'erreur Google Sign-In DEVELOPER_ERROR

## 🚨 Problème identifié

L'erreur `DEVELOPER_ERROR` se produit car le certificat SHA-1 de votre keystore de production ne correspond pas à celui configuré dans Firebase Console.

## 📊 Comparaison des certificats

### SHA-1 actuel dans Firebase
```
2b464c56d96afc9d362dfb9bb1c2b763606bc546
```

### SHA-1 de votre keystore de production
```
5F:A0:E6:90:3F:38:A1:A8:E6:D7:FA:D0:48:7E:7C:5E:F9:32:C0:F8
```

## 🚀 Solution recommandée : Ajouter le nouveau certificat

### Étape 1 : Accéder à Firebase Console
1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet `fck-mobile-android`

### Étape 2 : Ajouter le nouveau certificat SHA-1
1. Cliquez sur l'icône ⚙️ (Paramètres) > **Paramètres du projet**
2. Onglet **"Général"** > Section **"Vos applications"**
3. Cliquez sur votre app Android `com.fckmap.app`
4. Cliquez sur **"Ajouter un empreinte"**
5. Ajoutez ce SHA-1 : `5F:A0:E6:90:3F:38:A1:A8:E6:D7:FA:D0:48:7E:7C:5E:F9:32:C0:F8`

### Étape 3 : Télécharger la nouvelle configuration
1. Cliquez sur **"Télécharger google-services.json"**
2. Remplacez l'ancien fichier dans `android/app/google-services.json`

### Étape 4 : Reconstruire l'APK
```bash
# Utiliser le script de build
./build-apk.bat
```

## 🔄 Solution alternative : Utiliser le certificat de debug

Si vous voulez tester rapidement sans reconfigurer Firebase :

### Étape 1 : Modifier build.gradle
```gradle
// Dans android/app/build.gradle, changer temporairement :
signingConfigs {
    debug {
        storeFile file(System.properties['user.home'] + '/.android/debug.keystore')
        storePassword 'android'
        keyAlias 'AndroidDebugKey'
        keyPassword 'android'
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.debug  // ← Utiliser debug au lieu de release
        // ... autres options
    }
}
```

### Étape 2 : Construire en mode debug
```bash
cd android
./gradlew assembleDebug
```

## 🔍 Vérification de la configuration

### Vérifier le fichier google-services.json
Assurez-vous que le fichier contient :
```json
{
  "client": [
    {
      "client_info": {
        "android_client_info": {
          "package_name": "com.fckmap.app"
        }
      },
      "oauth_client": [
        {
          "client_id": "927171505332-vc6935c057nkncef7us8iib638bjh3ae.apps.googleusercontent.com",
          "client_type": 1,
          "android_info": {
            "package_name": "com.fckmap.app",
            "certificate_hash": "5F:A0:E6:90:3F:38:A1:A8:E6:D7:FA:D0:48:7E:7C:5E:F9:32:C0:F8"
          }
        }
      ]
    }
  ]
}
```

### Vérifier la configuration Google Sign-In
Dans `src/lib/googleSignIn.ts`, vérifiez :
```typescript
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: '927171505332-n30sheipr5bc86mi6bqa4kjgm2pgids1.apps.googleusercontent.com',
    offlineAccess: false,
    forceCodeForRefreshToken: false,
  });
};
```

## 🚨 Erreurs courantes et solutions

### Erreur "DEVELOPER_ERROR"
- **Cause** : Mismatch entre certificats SHA-1
- **Solution** : Ajouter le bon certificat dans Firebase Console

### Erreur "SIGN_IN_CANCELLED"
- **Cause** : L'utilisateur a annulé la connexion
- **Solution** : Gérer gracieusement dans l'interface

### Erreur "PLAY_SERVICES_NOT_AVAILABLE"
- **Cause** : Google Play Services non disponible
- **Solution** : Vérifier que l'appareil a Google Play Services

### Erreur "NETWORK_ERROR"
- **Cause** : Problème de connexion réseau
- **Solution** : Vérifier la connectivité internet

## 📱 Test de la connexion

Après avoir appliqué les corrections :

1. **Reconstruire l'APK** avec le bon certificat
2. **Installer l'APK** sur l'appareil
3. **Tester la connexion Google** dans l'app
4. **Vérifier les logs** pour confirmer le succès

## 🔐 Sécurité

- **Ne partagez jamais** votre keystore de production
- **Conservez en sécurité** le mot de passe et l'alias
- **Utilisez des variables d'environnement** pour les clés sensibles
- **Testez d'abord en mode debug** avant de passer en production

## 📞 Support

Si le problème persiste :
1. Vérifiez que le certificat SHA-1 est bien ajouté dans Firebase
2. Vérifiez que le package name correspond exactement
3. Vérifiez que Google Sign-In est activé dans Firebase Auth
4. Consultez les logs Firebase pour plus de détails

---

**🎯 Suivez ces étapes et Google Sign-In devrait fonctionner ! 🚀**
