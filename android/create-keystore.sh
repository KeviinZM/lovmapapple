#!/bin/bash

echo "Creation du keystore pour LovMap..."
echo

# Recherche de Java
JAVA_PATH=$(where java 2>/dev/null | head -n1)

if [ -z "$JAVA_PATH" ]; then
    echo "ERREUR: Java n'est pas trouve dans le PATH"
    echo "Veuillez installer Java ou l'ajouter au PATH"
    exit 1
fi

echo "Java trouve: $JAVA_PATH"
echo

# Extraction du chemin vers keytool
KEYTOOL_PATH="${JAVA_PATH/java.exe/keytool.exe}"
echo "Utilisation de keytool: $KEYTOOL_PATH"
echo

# Creation du keystore
echo "Creation du keystore avec les parametres suivants:"
echo "- Store Password: lovmap2024"
echo "- Key Alias: lovmap-key"
echo "- Key Password: lovmap2024"
echo "- Algorithme: RSA 2048 bits"
echo "- Validite: 10000 jours"
echo

"$KEYTOOL_PATH" -genkey -v -keystore app/release-key.keystore -alias lovmap-key -keyalg RSA -keysize 2048 -validity 10000 -storepass lovmap2024 -keypass lovmap2024 -dname "CN=LovMap, OU=Development, O=LovMap, L=City, S=State, C=FR"

if [ $? -eq 0 ]; then
    echo
    echo "SUCCES: Keystore cree avec succes!"
    echo "Fichier: app/release-key.keystore"
    echo
    echo "Vous pouvez maintenant construire l'AAB avec:"
    echo "./gradlew bundleRelease"
else
    echo
    echo "ERREUR: Echec de la creation du keystore"
    echo "Code d'erreur: $?"
fi

echo
read -p "Appuyez sur Entree pour continuer..."
