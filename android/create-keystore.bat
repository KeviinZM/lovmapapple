@echo off
echo Creation du keystore pour LovMap...
echo.

REM Recherche de Java
set JAVA_HOME=
for /f "tokens=*" %%i in ('where java 2^>nul') do (
    set JAVA_PATH=%%i
    goto :found_java
)

:found_java
if "%JAVA_PATH%"=="" (
    echo ERREUR: Java n'est pas trouve dans le PATH
    echo Veuillez installer Java ou l'ajouter au PATH
    pause
    exit /b 1
)

echo Java trouve: %JAVA_PATH%
echo.

REM Extraction du chemin vers keytool
set KEYTOOL_PATH=%JAVA_PATH:java.exe=keytool.exe%
echo Utilisation de keytool: %KEYTOOL_PATH%
echo.

REM Creation du keystore
echo Creation du keystore avec les parametres suivants:
echo - Store Password: lovmap2024
echo - Key Alias: lovmap-key
echo - Key Password: lovmap2024
echo - Algorithme: RSA 2048 bits
echo - Validite: 10000 jours
echo.

"%KEYTOOL_PATH%" -genkey -v -keystore app/release-key.keystore -alias lovmap-key -keyalg RSA -keysize 2048 -validity 10000 -storepass lovmap2024 -keypass lovmap2024 -dname "CN=LovMap, OU=Development, O=LovMap, L=City, S=State, C=FR"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCES: Keystore cree avec succes!
    echo Fichier: app/release-key.keystore
    echo.
    echo Vous pouvez maintenant construire l'AAB avec:
    echo ./gradlew bundleRelease
) else (
    echo.
    echo ERREUR: Echec de la creation du keystore
    echo Code d'erreur: %ERRORLEVEL%
)

pause
