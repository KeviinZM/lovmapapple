# 🚀 Guide de construction de l'APK LovMap

## 📱 Informations de l'application

- **Nom** : LovMap
- **Version** : 0.22
- **Version Code** : 4
- **Package** : com.fckmap.app
- **Min SDK** : Android 7.0 (API 24)
- **Target SDK** : Android 14 (API 35)

## 🔑 Keystore de production

Un keystore de production a été créé avec les informations suivantes :
- **Fichier** : `android/app/release-key.keystore`
- **Alias** : lovmap-key
- **Mot de passe** : lovmap2024
- **Validité** : 10 000 jours

⚠️ **IMPORTANT** : Conservez ce keystore en sécurité ! Il est nécessaire pour toutes les futures mises à jour.

## 🛠️ Construction de l'APK

### Option 1 : Script automatique (Recommandé)

#### Windows
```bash
# Double-cliquez sur le fichier
build-apk.bat
```

#### Linux/Mac
```bash
# Rendez le script exécutable
chmod +x build-apk.sh

# Exécutez le script
./build-apk.sh
```

### Option 2 : Commande manuelle

```bash
# Aller dans le dossier android
cd android

# Nettoyer les builds précédents
./gradlew clean

# Construire l'APK de production
./gradlew assembleRelease
```

## 📁 Fichiers générés

Après la construction, vous trouverez :
- **APK principal** : `android/app/build/outputs/apk/release/app-release.apk`
- **APK copié** : `LovMap-v0.22.apk` (dans le dossier racine)

## 🔍 Vérification de l'APK

### Vérifier la signature
```bash
# Windows
"C:\Program Files\Java\jdk-17\bin\jarsigner.exe" -verify -verbose -certs LovMap-v0.22.apk

# Linux/Mac
jarsigner -verify -verbose -certs LovMap-v0.22.apk
```

### Vérifier le contenu
```bash
# Windows
"C:\Program Files\Java\jdk-17\bin\jar.exe" -tf LovMap-v0.22.apk

# Linux/Mac
jar -tf LovMap-v0.22.apk
```

## 📱 Installation de l'APK

### Sur un appareil Android
1. **Activer l'installation d'applications inconnues** dans les paramètres
2. **Transférer l'APK** sur l'appareil
3. **Ouvrir l'APK** et suivre les instructions d'installation

### Via ADB (pour les développeurs)
```bash
adb install LovMap-v0.22.apk
```

## 🚨 Résolution des problèmes

### Erreur "Permission denied"
```bash
# Rendre le script exécutable (Linux/Mac)
chmod +x build-apk.sh
```

### Erreur "Gradle not found"
```bash
# Vérifier que Gradle est installé
./gradlew --version
```

### Erreur "Keystore not found"
```bash
# Vérifier que le keystore existe
ls -la android/app/release-key.keystore
```

### Erreur "Memory insufficient"
```bash
# Augmenter la mémoire Java dans android/gradle.properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
```

## 🔄 Mise à jour des versions

Pour créer une nouvelle version :

1. **Modifier** `android/app/build.gradle` :
   ```gradle
   versionCode 5        // Incrémenter
   versionName "0.23"   // Nouvelle version
   ```

2. **Reconstruire** l'APK avec le script

## 📋 Checklist de production

- [ ] Tests de l'application terminés
- [ ] Version mise à jour dans build.gradle
- [ ] Keystore de production présent
- [ ] APK construit avec succès
- [ ] APK testé sur appareil cible
- [ ] APK signé et vérifié

## 🆘 Support

En cas de problème :
1. Vérifiez les logs de construction
2. Consultez ce guide
3. Vérifiez que tous les prérequis sont installés
4. Contactez l'équipe de développement

---

**Bon développement ! 🚀📱**
