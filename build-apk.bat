@echo off
echo ========================================
echo    Construction de l'APK LovMap
echo ========================================
echo.

echo [1/4] Nettoyage des builds précédents...
cd android
call gradlew clean
if %errorlevel% neq 0 (
    echo ❌ Erreur lors du nettoyage
    pause
    exit /b 1
)

echo.
echo [2/4] Installation des dépendances...
call gradlew assembleRelease
if %errorlevel% neq 0 (
    echo ❌ Erreur lors de la construction
    pause
    exit /b 1
)

echo.
echo [3/4] Vérification de l'APK...
if exist "app\build\outputs\apk\release\app-release.apk" (
    echo ✅ APK créé avec succès !
    echo 📱 Fichier: app\build\outputs\apk\release\app-release.apk
) else (
    echo ❌ APK non trouvé
    pause
    exit /b 1
)

echo.
echo [4/4] Copie de l'APK dans le dossier racine...
copy "app\build\outputs\apk\release\app-release.apk" "..\LovMap-v0.22.apk"
if %errorlevel% equ 0 (
    echo ✅ APK copié: LovMap-v0.22.apk
) else (
    echo ❌ Erreur lors de la copie
)

echo.
echo ========================================
echo    Construction terminée !
echo ========================================
echo.
echo 📱 APK disponible: LovMap-v0.22.apk
echo 📁 Taille: 
for %%A in ("LovMap-v0.22.apk") do echo        %%~zA octets
echo.
pause
