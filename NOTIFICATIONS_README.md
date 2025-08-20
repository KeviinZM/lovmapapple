# 🔔 Système de Notifications LOVMAP

## Vue d'ensemble

Le système de notifications de LOVMAP permet aux utilisateurs de recevoir des alertes en temps réel pour les événements importants de l'application. Actuellement, il s'agit de **notifications locales** qui fonctionnent quand l'application est ouverte.

## 🚀 Fonctionnalités

### Types de notifications supportés

1. **Nouveaux LOVs des amis** ❤️
   - Déclenché quand un ami ajoute un nouveau LOV
   - Message : "[Nom] a ajouté un nouveau LOV"

2. **Nouvelles amitiés** 👥
   - Déclenché quand quelqu'un vous ajoute comme ami
   - Message : "[Nom] vous a ajouté comme ami"

3. **Nouvelles réactions** 😊
   - Déclenché quand quelqu'un réagit à vos LOVs
   - Message : "[Nom] a réagi à votre LOV"

### Paramètres configurables

- ✅ Activer/désactiver chaque type de notification
- 🔊 Son (on/off)
- 📳 Vibration (on/off)
- 📱 Badge sur l'icône de l'app

## 🏗️ Architecture technique

### Composants principaux

- **`NotificationService`** : Gestion des notifications locales et des préférences
- **`NotificationWatcher`** : Surveillance en temps réel des événements Firestore
- **`NotificationSettingsScreen`** : Interface de configuration des préférences
- **`NotificationsHistoryScreen`** : Historique et gestion des notifications

### Flux de données

```
Firestore Events → NotificationWatcher → NotificationService → PushNotification
                                      ↓
                              AsyncStorage (historique)
```

### Surveillance en temps réel

Le système utilise les `onSnapshot` de Firestore pour détecter :
- Nouveaux documents dans la collection `fcks`
- Nouveaux documents dans la collection `friendships`
- Nouveaux documents dans la collection `reactions`

## 📱 Utilisation

### Accès aux paramètres

1. Cliquer sur votre nom d'utilisateur (en haut à droite)
2. Cliquer sur "Mon compte"
3. Dans la section "Paramètres", cliquer sur "Paramètres des notifications"

### Accès à l'historique

1. Cliquer sur votre nom d'utilisateur (en haut à droite)
2. Cliquer sur "Notifications" dans le menu

### Gestion des notifications

- **Marquer comme lu** : Cliquer sur une notification
- **Marquer toutes comme lues** : Bouton "Tout marquer comme lu"
- **Supprimer** : Bouton × sur chaque notification
- **Tout supprimer** : Bouton "Tout supprimer"

## 🔧 Configuration

### Permissions Android

Le système demande automatiquement les permissions nécessaires :
- Notifications
- Badge sur l'icône
- Son
- Vibration

### Canal de notification

Un canal Android est créé automatiquement :
- ID : `lovmap-notifications`
- Nom : "LOVMAP Notifications"
- Importance : Haute
- Son et vibration activés

## 💾 Stockage

### Préférences utilisateur

- **AsyncStorage** : Stockage local des préférences
- **Firestore** : Synchronisation entre appareils (collection `users/{uid}/settings/notifications`)

### Historique des notifications

- **AsyncStorage** : 100 dernières notifications
- **Structure** : ID, type, titre, message, utilisateur, timestamp, statut lu

## 🚧 Limitations actuelles

### Notifications locales

- ❌ Ne fonctionnent que quand l'app est ouverte
- ❌ Pas de notifications en arrière-plan
- ❌ Pas de notifications push

### Détection des événements

- ⚠️ Délai de 5 secondes pour éviter les doublons
- ⚠️ Surveillance limitée aux 100 derniers événements

## 🔮 Évolutions futures

### Notifications PUSH

1. **Serveur backend** requis
2. **Firebase Cloud Functions** pour l'envoi
3. **FCM** (Firebase Cloud Messaging) pour la distribution
4. **Notifications en arrière-plan** même app fermée

### Améliorations

- [ ] Notifications groupées
- [ ] Actions directes (répondre, voir le LOV)
- [ ] Programmation de notifications
- [ ] Géolocalisation des notifications
- [ ] Personnalisation avancée

## 🧪 Tests

### Test des notifications

1. **Nouveau LOV** : Demander à un ami d'ajouter un LOV
2. **Nouvelle amitié** : Demander à quelqu'un de vous ajouter
3. **Nouvelle réaction** : Demander à quelqu'un de réagir à votre LOV

### Vérification

- ✅ Notification apparaît immédiatement
- ✅ Son et vibration fonctionnent
- ✅ Badge se met à jour
- ✅ Historique enregistré

## 🐛 Dépannage

### Problèmes courants

1. **Pas de notifications**
   - Vérifier les permissions Android
   - Vérifier les préférences utilisateur
   - Vérifier la connexion Firestore

2. **Notifications en double**
   - Redémarrer l'application
   - Vérifier la surveillance en temps réel

3. **Badge incorrect**
   - Aller dans les paramètres des notifications
   - Cliquer sur "Marquer toutes comme lues"

### Logs de débogage

Le système génère des logs détaillés :
```
🔔 Démarrage de la surveillance des notifications...
✅ Surveillance des notifications démarrée avec succès
🔔 Nouveau LOV détecté de [Nom]
🔔 Nouvelle amitié détectée de [Nom]
🔔 Nouvelle réaction détectée de [Nom]
```

## 📚 Ressources

- [React Native Push Notification](https://github.com/zo0r/react-native-push-notification)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [Android Notification Channels](https://developer.android.com/guide/topics/ui/notifiers/notifications#ManageChannels)

## 🤝 Contribution

Pour contribuer au système de notifications :

1. Respecter l'architecture existante
2. Ajouter des tests pour les nouvelles fonctionnalités
3. Mettre à jour la documentation
4. Suivre les conventions de nommage
5. Tester sur Android et iOS

---

**Note** : Ce système est conçu pour évoluer vers les notifications PUSH dans le futur. L'architecture actuelle facilite cette transition.
