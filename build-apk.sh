#!/bin/bash

echo "========================================"
echo "    Construction de l'APK LovMap"
echo "========================================"
echo

echo "[1/4] Nettoyage des builds précédents..."
cd android
./gradlew clean
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du nettoyage"
    exit 1
fi

echo
echo "[2/4] Construction de l'APK..."
./gradlew assembleRelease
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la construction"
    exit 1
fi

echo
echo "[3/4] Vérification de l'APK..."
if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
    echo "✅ APK créé avec succès !"
    echo "📱 Fichier: app/build/outputs/apk/release/app-release.apk"
else
    echo "❌ APK non trouvé"
    exit 1
fi

echo
echo "[4/4] Copie de l'APK dans le dossier racine..."
cp "app/build/outputs/apk/release/app-release.apk" "../LovMap-v0.22.apk"
if [ $? -eq 0 ]; then
    echo "✅ APK copié: LovMap-v0.22.apk"
    echo "📁 Taille: $(du -h ../LovMap-v0.22.apk | cut -f1)"
else
    echo "❌ Erreur lors de la copie"
fi

echo
echo "========================================"
echo "    Construction terminée !"
echo "========================================"
echo
echo "📱 APK disponible: LovMap-v0.22.apk"
echo
