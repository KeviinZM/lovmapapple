import firestore from '@react-native-firebase/firestore';
import { sendLocalNotification } from './notificationService';
import { auth } from './firebase';

let unsubscribeFunctions: (() => void)[] = [];

/**
 * Démarre la surveillance des événements pour déclencher les notifications
 */
export const startNotificationWatching = () => {
  const user = auth().currentUser;
  if (!user) {
    console.log('🔔 Aucun utilisateur connecté, impossible de démarrer la surveillance');
    return;
  }

  console.log('🔔 Démarrage de la surveillance des notifications pour:', user.uid);

  // Arrêter toute surveillance existante
  stopNotificationWatching();

  try {
    // Surveiller les nouvelles amitiés (quand quelqu'un vous ajoute)
    const unsubscribeFriendships = watchNewFriendships(user.uid);
    
    // Surveiller les nouveaux LOVs des amis existants
    const unsubscribeLoves = watchNewLoves(user.uid);
    
    // Surveiller les nouvelles réactions sur vos LOVs
    const unsubscribeReactions = watchNewReactions(user.uid);

    unsubscribeFunctions = [unsubscribeFriendships, unsubscribeLoves, unsubscribeReactions];
    console.log('🔔 Surveillance des notifications démarrée avec succès. Fonctions de désabonnement:', unsubscribeFunctions.length);
  } catch (error) {
    console.error('🔔 Erreur lors du démarrage de la surveillance:', error);
  }
};

/**
 * Arrête la surveillance des événements
 */
export const stopNotificationWatching = () => {
  console.log('🔔 Arrêt de la surveillance des notifications');
  
  unsubscribeFunctions.forEach(unsubscribe => {
    try {
      unsubscribe();
    } catch (error) {
      console.error('🔔 Erreur lors de l\'arrêt de la surveillance:', error);
    }
  });
  
  unsubscribeFunctions = [];
};

/**
 * Surveille les nouvelles amitiés ajoutées
 */
const watchNewFriendships = (userId: string) => {
  console.log('🔔 Démarrage surveillance amitiés pour:', userId);
  
  return firestore()
    .collection('friendships')
    .where('friendId', '==', userId)
    .where('status', '==', 'accepted')
    .onSnapshot(
      (snapshot) => {
        console.log('🔔 Snapshot amitiés reçu, documents:', snapshot.docs.length);
        
        snapshot.docChanges().forEach((change) => {
          console.log('🔔 Changement amitié détecté:', change.type, 'ID:', change.doc.id);
          
          if (change.type === 'added') {
            const friendshipData = change.doc.data();
            console.log('🔔 Données amitié:', friendshipData);
            
            // Vérifier que c'est bien une nouvelle amitié
            if (friendshipData.userId && friendshipData.friendId === userId) {
              const friendId = friendshipData.userId;
              console.log('🔔 Nouvelle amitié de:', friendId);
              
              // Récupérer les infos de l'ami
              firestore()
                .collection('users')
                .doc(friendId)
                .get()
                .then((friendDoc) => {
                  if (friendDoc.exists()) {
                    const friendData = friendDoc.data();
                    const pseudo = friendData?.pseudo || friendData?.displayName || 'Quelqu\'un';
                    
                    console.log('🔔 Envoi notification amitié pour:', pseudo);
                    
                    sendLocalNotification(
                      'Nouvelle amitié !',
                      `${pseudo} vous a ajouté comme ami`,
                      {
                        type: 'newFriendship',
                        userId: friendId,
                        userPseudo: pseudo,
                        friendId: friendId,
                      }
                    );
                  }
                })
                .catch((error) => {
                  console.error('🔔 Erreur récupération profil ami:', error);
                });
            }
          }
        });
      },
      (error) => {
        console.error('🔔 Erreur surveillance amitiés:', error);
      }
    );
};

/**
 * Surveille les nouveaux LOVs ajoutés par les amis
 */
const watchNewLoves = (userId: string) => {
  console.log('🔔 Démarrage surveillance LOVs pour:', userId);
  
  // D'abord récupérer la liste des amis
  return firestore()
    .collection('friendships')
    .where('status', '==', 'accepted')
    .onSnapshot(
      (friendshipsSnapshot) => {
        const friendIds = new Set<string>();
        
        friendshipsSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (data.userId === userId) {
            friendIds.add(data.friendId);
          } else if (data.friendId === userId) {
            friendIds.add(data.userId);
          }
        });
        
        console.log('🔔 Amis trouvés:', friendIds.size);
        
        if (friendIds.size === 0) return;
        
        // Surveiller les LOVs de tous les amis
        const friendIdsArray = Array.from(friendIds);
        
        friendIdsArray.forEach((friendId) => {
          firestore()
            .collection('fcks')
            .where('userId', '==', friendId)
            .orderBy('createdAt', 'desc')
            .limit(1)
            .onSnapshot(
              (lovesSnapshot) => {
                if (!lovesSnapshot.empty) {
                  const latestLove = lovesSnapshot.docs[0];
                  const loveData = latestLove.data();
                  
                  // Vérifier si c'est un nouveau LOV (créé dans les 10 dernières secondes)
                  if (loveData.createdAt) {
                    const loveTime = loveData.createdAt.toDate();
                    const timeDiff = Date.now() - loveTime.getTime();
                    
                    if (timeDiff < 10000) { // 10 secondes
                      console.log('🔔 Nouveau LOV détecté de:', friendId);
                      
                      // Récupérer le profil de l'ami
                      firestore()
                        .collection('users')
                        .doc(friendId)
                        .get()
                        .then((friendDoc) => {
                          if (friendDoc.exists()) {
                            const friendData = friendDoc.data();
                            const pseudo = friendData?.pseudo || friendData?.displayName || 'Un ami';
                            
                            console.log('🔔 Envoi notification LOV pour:', pseudo);
                            
                            sendLocalNotification(
                              'Nouveau LOV ajouté !',
                              `${pseudo} a ajouté un nouveau LOV`,
                              {
                                type: 'newLove',
                                userId: friendId,
                                userPseudo: pseudo,
                                loveId: latestLove.id,
                              }
                            );
                          }
                        });
                    }
                  }
                }
              },
              (error) => {
                console.error('🔔 Erreur surveillance LOVs ami:', friendId, error);
              }
            );
        });
      },
      (error) => {
        console.error('🔔 Erreur surveillance amitiés pour LOVs:', error);
      }
    );
};

/**
 * Surveille les nouvelles réactions sur les LOVs de l'utilisateur
 */
const watchNewReactions = (userId: string) => {
  console.log('🔔 Démarrage surveillance réactions pour:', userId);
  
  return firestore()
    .collection('fcks')
    .where('userId', '==', userId)
    .onSnapshot(
      (lovesSnapshot) => {
        console.log('🔔 LOVs de l\'utilisateur trouvés:', lovesSnapshot.docs.length);
        
        lovesSnapshot.docs.forEach((loveDoc) => {
          const loveId = loveDoc.id;
          
          // Surveiller les réactions sur ce LOV
          firestore()
            .collection('fcks')
            .doc(loveId)
            .collection('reactions')
            .onSnapshot(
              (reactionsSnapshot) => {
                reactionsSnapshot.docChanges().forEach((change) => {
                  if (change.type === 'added') {
                    const reactionData = change.doc.data();
                    const reactorId = reactionData.userId;
                    
                    // Ignorer vos propres réactions
                    if (reactorId === userId) return;
                    
                    console.log('🔔 Nouvelle réaction détectée de:', reactorId);
                    
                    // Vérifier si c'est une nouvelle réaction (dans les 10 dernières secondes)
                    if (reactionData.createdAt) {
                      const reactionTime = reactionData.createdAt.toDate();
                      const timeDiff = Date.now() - reactionTime.getTime();
                      
                      if (timeDiff < 10000) { // 10 secondes
                        // Récupérer le profil de l'utilisateur qui a réagi
                        firestore()
                          .collection('users')
                          .doc(reactorId)
                          .get()
                          .then((reactorDoc) => {
                            if (reactorDoc.exists()) {
                              const reactorData = reactorDoc.data();
                              const pseudo = reactorData?.pseudo || reactorData?.displayName || 'Quelqu\'un';
                              
                              console.log('🔔 Envoi notification réaction pour:', pseudo);
                              
                              sendLocalNotification(
                                'Nouvelle réaction !',
                                `${pseudo} a réagi à votre LOV`,
                                {
                                  type: 'newReaction',
                                  userId: reactorId,
                                  userPseudo: pseudo,
                                  loveId: loveId,
                                  reactionId: change.doc.id,
                                }
                              );
                            }
                          });
                      }
                    }
                  }
                });
              },
              (error) => {
                console.error('🔔 Erreur surveillance réactions LOV:', loveId, error);
              }
            );
        });
      },
      (error) => {
        console.error('🔔 Erreur surveillance LOVs utilisateur:', error);
      }
    );
};
