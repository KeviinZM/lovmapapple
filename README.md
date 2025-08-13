# LovMap

Application React Native construite avec Gradle (migration depuis Expo).

## 🚀 Technologies utilisées

- **React Native** 0.80.2
- **React** 19.1.0
- **TypeScript** 5.0.4
- **Firebase** (Auth, Firestore)
- **Google Sign-In**

## 📱 Plateformes supportées

- Android (API 24+)
- iOS (version minimale supportée)

## 🎯 Fonctionnalités principales

- **🗺️ Cartographie interactive** avec Mapbox
- **😊 Système de réactions émojis** (remplace les commentaires)
- **👥 Gestion des amis** avec codes uniques
- **🔐 Authentification** Firebase + Google Sign-In
- **🌍 Internationalisation** français/anglais
- **📊 Statistiques** personnelles et partagées

## 🛠️ Prérequis

- Node.js >= 18
- npm ou yarn
- Android Studio (pour Android)
- Xcode (pour iOS, macOS uniquement)
- JDK (pour Android)

## 📦 Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd LovMap
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration Android**
```bash
# Pour Android, assurez-vous d'avoir configuré ANDROID_HOME
# et d'avoir un émulateur ou un appareil connecté
```

4. **Configuration iOS** (macOS uniquement)
```bash
cd ios
pod install
cd ..
```

## 🏃‍♂️ Lancement

### Android
```bash
npm run android
# ou
npx react-native run-android
```

### iOS
```bash
npm run ios
# ou
npx react-native run-ios
```

### Metro Bundler
```bash
npm start
# ou
npx react-native start
```

## 🧪 Tests

```bash
npm test
```

## 📁 Structure du projet

```
LovMap/
├── android/                 # Configuration Android
├── ios/                    # Configuration iOS
├── src/                    # Code source
│   ├── components/         # Composants réutilisables
│   ├── screens/           # Écrans de l'application
│   ├── lib/               # Utilitaires et services
│   └── types/             # Types TypeScript
├── __tests__/             # Tests
├── App.tsx                # Composant principal
├── index.js               # Point d'entrée
└── package.json           # Dépendances
```

## 🔧 Configuration Firebase

Pour utiliser Firebase, vous devez :

1. Créer un projet Firebase
2. Ajouter `google-services.json` dans `android/app/`
3. Ajouter `GoogleService-Info.plist` dans `ios/FckmapNative/`

## 🔒 Sécurité et confidentialité

### Système de couleurs uniques pour les amis
- Chaque ami a une couleur unique parmi 15 couleurs prédéfinies
- L'orange `#FF6A2B` est réservé à l'utilisateur principal
- Les couleurs sont assignées automatiquement lors de l'ajout d'un ami

### Confidentialité des points sur la carte
- **Utilisateur sans amis** : Voit seulement ses propres points
- **Utilisateur avec amis** : Voit ses points + ceux de ses amis
- **Aucun utilisateur** : Ne voit jamais les points des inconnus
- Double protection : Règles Firestore + filtrage côté client

### Règles Firestore
Les règles de sécurité garantissent que :
- Chaque utilisateur ne peut voir que ses propres données
- Les points ne sont visibles que par le créateur et ses amis
- Les amitiés sont gérées de manière sécurisée

**⚠️ Important** : Après modification du code, déployez les nouvelles règles Firestore depuis le fichier `firestore.rules`.

## 🚨 Problèmes connus

- Assurez-vous que `ANDROID_HOME` est configuré pour le développement Android
- Pour iOS, Xcode est requis sur macOS

## ✅ Problèmes résolus

### Erreur de permission Firebase sur la page de connexion
**Problème** : L'application tentait de charger les points sur la carte avant l'authentification, causant une erreur `[firestore/permission-denied]`.

**Solution** : Modification du `useEffect` dans `HomeScreen.tsx` pour ne charger les points qu'après authentification de l'utilisateur.

**Résultat** : Plus d'erreur sur la page de connexion, chargement sécurisé des points selon les règles de confidentialité.

## 📝 Scripts disponibles

- `npm start` - Lance Metro Bundler
- `npm run android` - Lance l'app sur Android
- `npm run ios` - Lance l'app sur iOS
- `npm test` - Lance les tests
- `npm run lint` - Vérifie le code avec ESLint

## 🔄 Migration depuis Expo

Ce projet a été migré depuis Expo vers React Native CLI avec Gradle. Les principales modifications :

- Configuration Gradle pour Android
- Configuration CocoaPods pour iOS
- Suppression des dépendances Expo
- Ajout des configurations natives

## 📄 Licence

Ce projet est privé.