import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Pressable, Modal, TextInput, ScrollView, PermissionsAndroid, Platform, Image } from 'react-native';
import { auth } from '../lib/firebase';
import { addFck, getUserFcks, subscribeToFcks, subscribeToUserFcks, deleteFck, updateFck, ensureUserProfile, getMyCode, deleteUserAccount } from '../lib/mapService';
import { subscribeToFriendships, addFriendByCode, removeFriend } from '../lib/friendshipService';
import { toggleReaction, subscribeToReactions, AVAILABLE_EMOJIS } from '../lib/reactionService';
import { Friend, ReactionCount, Fck } from '../types';
import { startNotificationWatching, stopNotificationWatching } from '../lib/notificationWatcher';
import { WebView } from 'react-native-webview';
import { firestore } from '../lib/firebase';
import LanguageButton from '../components/LanguageButton';
import { useLanguage } from '../i18n/LanguageContext';
import LegalNavigator from '../navigation/LegalNavigator';
import NotificationSettingsScreen from './NotificationSettingsScreen';
import NotificationsHistoryScreen from './NotificationsHistoryScreen';
import AdBanner from '../components/AdBanner';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoia2V2aWluem0iLCJhIjoiY21kcDFjMTZnMDg5MjJqczhndXhsYTZvZiJ9.gZWhKGtIcOd61OHQ0pJKfg';

const ReactionsInline: React.FC<{ lovId: string; size?: 'small' | 'large' }> = ({ lovId, size = 'large' }) => {
  const [reactions, setReactions] = useState<ReactionCount[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!lovId) return;

    const unsubscribe = subscribeToReactions(lovId, (newReactions) => {
      setReactions(newReactions);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [lovId]);

  const handleReactionPress = async (emoji: string) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await toggleReaction(lovId, emoji);
    } catch (error) {
      console.error('Erreur lors de la gestion de la réaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isSmall = size === 'small';
  const containerStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'flex-start' as const,
    paddingHorizontal: 0,
    width: '100%' as const,
    gap: isSmall ? 0 : 4,
  };

  const emojiStyle = {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    width: isSmall ? 32 : 36,
    height: isSmall ? 38 : 44,
    marginTop: 0,
    paddingVertical: 0,
  };

  const emojiTextStyle = {
    fontSize: isSmall ? 18 : 22,
    lineHeight: isSmall ? 18 : 22,
    textAlign: 'center' as const,
    includeFontPadding: false,
  };

  const countStyle = {
    fontSize: isSmall ? 7 : 9,
    fontWeight: '600' as const,
    marginTop: isSmall ? 2 : 3,
    textAlign: 'center' as const,
    backgroundColor: '#E0E0E0',
    color: '#666',
    paddingHorizontal: isSmall ? 2 : 3,
    paddingVertical: 1,
    borderRadius: isSmall ? 4 : 6,
    minWidth: isSmall ? 10 : 14,
    overflow: 'hidden' as const,
  };

  return (
    <View style={containerStyle}>
      {AVAILABLE_EMOJIS.map((emojiData) => {
        const reaction = reactions.find(r => r.emoji === emojiData.emoji);
        const count = reaction?.count || 0;
        const hasReacted = reaction?.hasReacted || false;
        
        return (
          <TouchableOpacity
            key={emojiData.emoji}
            style={emojiStyle}
            onPress={() => handleReactionPress(emojiData.emoji)}
            disabled={isLoading}
            activeOpacity={1}
          >
            <Text style={emojiTextStyle}>
              {emojiData.emoji}
            </Text>
            {count > 0 && (
              <Text style={[
                countStyle,
                hasReacted && { backgroundColor: '#FF6A2B', color: '#FFFFFF' }
              ]}>
                {count}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

interface HomeScreenProps {
  onNavigateToLogin: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToLogin }) => {
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fcks, setFcks] = useState<Fck[]>([]);
  const webViewRef = useRef<any>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [savingFck, setSavingFck] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [userFcks, setUserFcks] = useState<any[]>([]);
  const [selectedFck, setSelectedFck] = useState<Fck | null>(null);
  const [fckPopupOpen, setFckPopupOpen] = useState(false);
  const [pendingGroup, setPendingGroup] = useState<any[] | null>(null);
  const [editFckOpen, setEditFckOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [notificationSettingsOpen, setNotificationSettingsOpen] = useState(false);
  const [notificationsHistoryOpen, setNotificationsHistoryOpen] = useState(false);
  const [editPartnerName, setEditPartnerName] = useState('');
  const [editEmoji, setEditEmoji] = useState<'aubergine' | 'peche' | null>(null);
  const [editRating, setEditRating] = useState<number>(0);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [userLocation, setUserLocation] = useState<{ longitude: number; latitude: number } | null>(null);
  const [myCode, setMyCode] = useState<string>('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [addCode, setAddCode] = useState('');
  const [adding, setAdding] = useState(false);

  // État du panneau "Marquez un LOV"
  const [newFckOpen, setNewFckOpen] = useState(false);
  const [locationType, setLocationType] = useState<'address' | 'city'>('address');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ id: string; label: string; longitude: number; latitude: number }>>([]);
  const [skipSearch, setSkipSearch] = useState(false); // évite un 2e affichage après sélection
  const [selectedCoords, setSelectedCoords] = useState<{ longitude: number; latitude: number } | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<'aubergine' | 'peche' | null>(null);
  const [partnerName, setPartnerName] = useState('');
  const [rating, setRating] = useState<number>(0);

  // Token Mapbox pour la recherche

  const refreshUserFcks = async () => {
    if (!user) return;
    try {
      const list = await getUserFcks(user.uid);
      setUserFcks(list);
    } catch (error) {
      console.error('Erreur lors de la récupération des LOVs:', error);
    }
  };

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUserFcks(user.uid, (list) => setUserFcks(list));
    return () => unsub && unsub();
  }, [user?.uid]);
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToFriendships(user.uid, (friendsList) => {
      setFriends(friendsList);
    });
    return unsub;
  }, [user?.uid]);
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      try {
        const profile = await ensureUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
      }
    };
    loadUserProfile();
  }, [user?.uid]);

  // Démarrer la surveillance des notifications quand l'utilisateur se connecte
  useEffect(() => {
    if (user) {
      // Démarrer la surveillance des notifications
      startNotificationWatching();
      
      // Nettoyer à la déconnexion
      return () => {
        stopNotificationWatching();
      };
    }
  }, [user?.uid]);

  const getUserColor = (_uid?: string) => '#FF6A2B';
  const getColorForUserId = (uid: string | undefined): string => {
    if (!uid) return '#FF6A2B';
    if (uid === user?.uid) return '#FF6A2B';
    const fr = friends.find(f => f.uid === uid);
    if (fr?.color) return fr.color;
    const palette = ['#2D7FF9','#FFC107','#4CAF50','#673AB7','#E91E63','#00BCD4','#9C27B0','#3F51B5','#009688'];
    let hash = 0;
    for (let i = 0; i < uid.length; i++) hash = (hash * 31 + uid.charCodeAt(i)) >>> 0;
    return palette[hash % palette.length];
  };
  const cleanupCity = (raw: string): string => {
    if (!raw) return '';
    const noDigits = raw.replace(/[0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    return noDigits || raw.trim();
  };
  const extractCityFromLabel = (label: string, type: 'address' | 'city'): string => {
    if (!label) return '';
    const parts = label.split(',').map(s => s.trim());
    if (type === 'city') {
      return cleanupCity(parts[0] || '');
    }
    if (parts.length >= 2) {
      return cleanupCity(parts[1]);
    }
    return cleanupCity(parts[0] || '');
  };

  const deriveCityFromFck = (f: any): string => {
    if (f?.city) return String(f.city);
    return extractCityFromLabel(String(f?.addressLabel || ''), f?.locationType === 'city' ? 'city' : 'address');
  };

  const resetNewFckForm = () => {
    setLocationType('address');
    setSearchQuery('');
    setSearching(false);
    setSkipSearch(false);
    setSuggestions([]);
    setSelectedCoords(null);
    setSelectedEmoji(null);
    setPartnerName('');
    setRating(0);
  };

  const postClearPreviewToMap = () => {
    if (!webViewRef.current) return;
    try { webViewRef.current.postMessage(JSON.stringify({ type: 'clearPreview' })); } catch {}
  };



  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Init profil + abonnement amis
  useEffect(() => {
    if (!user?.uid) {
      setMyCode('');
      setFriends([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const code = await getMyCode();
        if (!cancelled) setMyCode(code);
      } catch {}
    })();
    // Abonnement au profil pour réagir si le champ code est écrit plus tard
    const unsubProfile = firestore()
      .collection('users')
      .doc(user.uid)
      .onSnapshot((d) => {
        if (d && d.exists()) {
          const data = d.data();
          if (data && data.code) {
            setMyCode(String(data.code));
          }
        }
      }, (error) => {
        console.error('Erreur lors de la récupération du profil:', error);
      });

    return () => {
      cancelled = true;
      try { unsubProfile && unsubProfile(); } catch {}
    };
  }, [user?.uid]);

  // Demande de permission localisation et récupération de la position initiale
  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Autoriser la localisation',
              message: "Pour centrer la carte sur votre position",
              buttonPositive: 'Autoriser',
              buttonNegative: 'Refuser',
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            // Récupérer la position de l'utilisateur
            (global as any).navigator?.geolocation?.getCurrentPosition?.((pos: any) => {
              const lng = pos?.coords?.longitude; const lat = pos?.coords?.latitude;
              if (isFinite(lng) && isFinite(lat)) {
                setUserLocation({ longitude: lng, latitude: lat });
              }
            }, () => {}, { enableHighAccuracy: true, timeout: 10000 });
          }
        } else if (Platform.OS === 'ios') {
          // Pour iOS, essayer de récupérer la position directement
          (global as any).navigator?.geolocation?.getCurrentPosition?.((pos: any) => {
            const lng = pos?.coords?.longitude; const lat = pos?.coords?.latitude;
            if (isFinite(lng) && isFinite(lat)) {
              setUserLocation({ longitude: lng, latitude: lat });
            }
          }, () => {}, { enableHighAccuracy: true, timeout: 10000 });
        }
      } catch {}
    })();
    }, []);
  
  // Centrer la carte sur la position de l'utilisateur dès qu'elle est disponible
  useEffect(() => {
    if (userLocation && webViewRef.current) {
      try {
        webViewRef.current.postMessage(JSON.stringify({ 
          type: 'centerTo', 
          longitude: userLocation.longitude, 
          latitude: userLocation.latitude 
        }));
      } catch {}
    }
  }, [userLocation]);
  
  useEffect(() => {
    // Ne charger les points que si l'utilisateur est connecté
    if (!user?.uid) {
      setFcks([]);
      return;
    }
    
    const unsub = subscribeToFcks(list => setFcks(list));
    return () => unsub && unsub();
  }, [user?.uid]); // Dépendance sur user?.uid

      // Sync des LOV vers la WebView à chaque changement
  useEffect(() => {
    if (!webViewRef.current) return;
    try {
      const colored = fcks.map(item => ({
        ...item,
        // couleur du disque = orange pour moi, sinon couleur ami (ou fallback déterministe)
        userColor: getColorForUserId(item.userId),
      }));
      const payload = JSON.stringify({ type: 'syncFcks', fcks: colored, currentUserId: user?.uid || null, friends });
      webViewRef.current.postMessage(payload);
    } catch (_e) {}
  }, [fcks, friends, user?.uid]);

  // Déclencher la recherche (debounce léger)
  useEffect(() => {
    if (!newFckOpen) return;
    const q = searchQuery.trim();
    if (skipSearch) {
      setSearching(false);
      setSuggestions([]);
      return;
    }
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    const handle = setTimeout(async () => {
      try {
        setSearching(true);
        const types = locationType === 'address' ? 'address' : 'place,locality';
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=5&language=fr&types=${types}`;
        const res = await fetch(url);
        const json = await res.json();
        const feats = Array.isArray(json?.features) ? json.features : [];
        const list = feats.map((f: any) => ({
          id: String(f.id || `${f.center?.[0]}-${f.center?.[1]}`),
          label: String(f.place_name || f.text || q),
          longitude: Number(f.center?.[0]),
          latitude: Number(f.center?.[1]),
        }));
        if (!cancelled && !skipSearch) setSuggestions(list);
      } catch (_e) {
        setSuggestions([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(handle); };
  }, [searchQuery, locationType, newFckOpen, skipSearch]);

  // Met à jour l'aperçu du pin sur la carte
  const postPreviewToMap = (coords: { longitude: number; latitude: number } | null, emoji: 'aubergine' | 'peche' | null) => {
    if (!webViewRef.current || !coords) return;
    try {
      const emojiChar = emoji === 'aubergine' ? '🍆' : emoji === 'peche' ? '🍑' : null;
      const color = getUserColor(user?.uid);
      const payload = JSON.stringify({ type: 'preview', longitude: coords.longitude, latitude: coords.latitude, emojiChar, color });
      webViewRef.current.postMessage(payload);
    } catch {}
  };

  const onSelectSuggestion = (s: { id: string; label: string; longitude: number; latitude: number }) => {
    setSearchQuery(s.label);
    const coords = { longitude: s.longitude, latitude: s.latitude };
    setSelectedCoords(coords);
    // Aperçu immédiat sur la carte
    postPreviewToMap(coords, selectedEmoji);
    // Fermer la liste des suggestions
    setSkipSearch(true);
    setSearching(false);
    setSuggestions([]);
  };

  // Réactiver la recherche si l'utilisateur modifie la saisie
  useEffect(() => {
    if (!newFckOpen) return;
    if (skipSearch && searchQuery.trim().length === 0) {
      setSkipSearch(false);
    }
  }, [searchQuery, skipSearch, newFckOpen]);

  // Mettre à jour l'aperçu quand l'emoji change
  useEffect(() => {
    if (selectedCoords) {
      postPreviewToMap(selectedCoords, selectedEmoji);
    }
  }, [selectedEmoji]);



  const handleLogout = async () => {
    try {
      await auth().signOut();
      Alert.alert('Succès', 'Déconnexion réussie !');
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur lors de la déconnexion');
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      '⚠️ Suppression définitive',
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et supprimera définitivement :\n\n• Tous vos lieux marqués\n• Toutes vos réactions\n• Toutes vos relations d\'amitié\n• Votre profil utilisateur\n\nCette action ne peut pas être annulée.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer définitivement', 
          style: 'destructive',
          onPress: () => {
            // Ouvrir le modal de mot de passe
            setShowPasswordModal(true);
          }
        }
      ]
    );
  };

  // Fonction pour confirmer la suppression avec le mot de passe
  const confirmDeleteWithPassword = async () => {
    if (!passwordInput || passwordInput.trim().length === 0) {
      Alert.alert('Erreur', 'Le mot de passe est requis');
      return;
    }
    
    try {
      setLoading(true);
      await deleteUserAccount(passwordInput.trim());
      Alert.alert('Compte supprimé', 'Votre compte a été supprimé avec succès.');
      onNavigateToLogin();
    } catch (error: any) {
      if (error.message.includes('Réauthentification requise')) {
        Alert.alert('Erreur', 'Mot de passe incorrect. Veuillez réessayer.');
      } else {
        Alert.alert('Erreur', error.message || 'Impossible de supprimer le compte');
      }
    } finally {
      setLoading(false);
      setShowPasswordModal(false);
      setPasswordInput('');
    }
  };



  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!user) {
    onNavigateToLogin();
    return null;
  }

  // Affichage: pseudo issu du profil Firestore
  const pseudo: string = userProfile?.pseudo || (user?.email?.split('@')[0] as string) || 'Profil';
  const createdAtStr: string = (user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : '—');


  const mapHtml = `
    <!doctype html>
    <html>
      <head>
        <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
        <style>html,body,#map{height:100%;margin:0;padding:0}</style>
        <link href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" rel="stylesheet" />
        <script src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"></script>
      </head>
      <body>
        <div id="map"></div>
        <script>
          mapboxgl.accessToken = '${MAPBOX_TOKEN}';
                     const map = new mapboxgl.Map({
             container: 'map',
             style: 'mapbox://styles/mapbox/streets-v12',
             center: [2.3522, 48.8566], // Position par défaut (Paris) en attendant la localisation
             zoom: 11
           });
           const markers = [];
           let CURRENT_USER_ID = null;
           let FRIENDS_COLORS = {};
          let previewMarker = null;
          function centerTo(lng, lat){
            try { map.flyTo({ center: [Number(lng), Number(lat)], zoom: 13, essential: true }); } catch(_){ }
          }
           function colorFor(uid, fallback){
             try {
               if (!uid) return fallback||'#FF6A2B';
               if (uid === CURRENT_USER_ID) return '#FF6A2B';
               const c = FRIENDS_COLORS[uid];
               return c || (fallback || '#FF6A2B');
             } catch(_){ return fallback||'#FF6A2B'; }
           }
          function createEmojiMarker(emoji, bgColor){
            const size = 40;
            const ring = 3;
            const html = '<div style="'
              + 'width:'+size+'px;height:'+size+'px;border-radius:'+(size/2)+'px;'
              + 'background:'+(bgColor||'#FF6A2B')+';display:flex;align-items:center;justify-content:center;'
              + 'border:'+ring+'px solid #fff;box-shadow:0 1px 2px rgba(0,0,0,0.2);">'
              + '<div style="font-size:22px;line-height:1">'+(emoji||'📍')+'</div>'
              + '</div>';
            const el = document.createElement('div');
            el.innerHTML = html;
            return el.firstChild;
          }
          function createCompositeMarker(primary, secondary){
            const size = 40, ring = 3;
            const small = 18, sRing = 3;
            const mainBg = colorFor(primary.userId, primary.userColor || '#FF6A2B');
            const mainEmoji = primary.emoji==='aubergine'?'🍆':'🍑';
            const html = '<div style="position:relative;width:'+size+'px;height:'+size+'px;">'
              + '<div style="width:'+size+'px;height:'+size+'px;border-radius:'+(size/2)+'px;background:'+mainBg+';display:flex;align-items:center;justify-content:center;border:'+ring+'px solid #fff;box-shadow:0 1px 2px rgba(0,0,0,0.2);">'
              +   '<div style="font-size:22px;line-height:1">'+mainEmoji+'</div>'
              + '</div>'
              + (secondary ? ('<div style="position:absolute;right:-6px;top:-6px;width:'+small+'px;height:'+small+'px;border-radius:'+(small/2)+'px;background:'+(colorFor(secondary.userId, secondary.userColor||'#FF6A2B'))+';display:flex;align-items:center;justify-content:center;border:'+sRing+'px solid #fff;box-shadow:0 1px 2px rgba(0,0,0,0.2);">'
                  + '<div style="font-size:12px;line-height:1">'+(secondary.emoji==='aubergine'?'🍆':'🍑')+'</div>'
                + '</div>') : '')
              + '</div>';
            const el = document.createElement('div');
            el.innerHTML = html;
            return el.firstChild;
          }
          function post(type, payload){
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type, ...(payload||{}) }));
          }
           function clearAll(){ while(markers.length){ const m = markers.pop(); m.remove(); } }
           function syncFcks(list){
             clearAll();
             const groups = {};
             (list||[]).forEach(item=>{
               const key = String(Number(item.longitude).toFixed(6))+'_'+String(Number(item.latitude).toFixed(6));
               (groups[key] = groups[key] || []).push(item);
             });
             Object.values(groups).forEach((arr)=>{
               const primary = (arr.find(i=>i.userId===CURRENT_USER_ID) || arr[0]);
               const secondary = arr.find(i=>i.userId!==primary.userId);
               const el = secondary ? createCompositeMarker(primary, secondary) : createEmojiMarker(primary.emoji==='aubergine'?'🍆':'🍑', colorFor(primary.userId, primary.userColor||'#FF6A2B'));
               const m = new mapboxgl.Marker({ element: el, anchor: 'center' }).setLngLat([Number(primary.longitude), Number(primary.latitude)]).addTo(map);
               m.getElement().style.cursor = 'pointer';
               m.getElement().addEventListener('click', ()=>{ post('selectGroup', { group: arr }); });
               markers.push(m);
             });
           }
          document.addEventListener('message', e=>{
            try{
              const payload = JSON.parse(e.data);
               if(payload.type==='syncFcks'){
                 CURRENT_USER_ID = payload.currentUserId || null;
                 FRIENDS_COLORS = {};
                 const arr = Array.isArray(payload.friends) ? payload.friends : [];
                 for (let i=0;i<arr.length;i++){ const f = arr[i]; if (f && f.uid && f.color) FRIENDS_COLORS[f.uid] = f.color; }
                 syncFcks(payload.fcks||[]);
               } else if (payload.type==='centerTo'){
                 const lng = Number(payload.longitude), lat = Number(payload.latitude);
                 if (isFinite(lng) && isFinite(lat)) centerTo(lng, lat);
               } else if (payload.type==='locateMe'){
                 try {
                   if (navigator && navigator.geolocation && navigator.geolocation.getCurrentPosition) {
                     navigator.geolocation.getCurrentPosition((pos)=>{
                       const lng = pos?.coords?.longitude, lat = pos?.coords?.latitude;
                       if (isFinite(lng) && isFinite(lat)) centerTo(lng, lat);
                     }, ()=>{}, { enableHighAccuracy: true, timeout: 10000 });
                   }
                 } catch(_){ }
              } else if (payload.type==='preview'){
                const lng = Number(payload.longitude), lat = Number(payload.latitude);
                if (!isFinite(lng) || !isFinite(lat)) return;
                if (previewMarker) { previewMarker.remove(); previewMarker = null; }
                const el = createEmojiMarker(payload.emojiChar, payload.color);
                previewMarker = new mapboxgl.Marker({ element: el, anchor: 'center' }).setLngLat([lng, lat]).addTo(map);
                try { map.flyTo({ center: [lng, lat], zoom: 13, essential: true }); } catch(_){ }
              } else if (payload.type==='clearPreview'){
                if (previewMarker) { previewMarker.remove(); previewMarker = null; }
              }
              // Autres types de messages
            }catch(_){ }
          });
          // Interactions futures
        </script>
      </body>
    </html>`;

  const onWebMessage = async (event: any) => {
    try {
      const payload = JSON.parse(event?.nativeEvent?.data || '{}');
      if (payload.type === 'selectFck' && payload.fck) {
        setSelectedFck(payload.fck);
        setFckPopupOpen(true);
      } else if (payload.type === 'selectGroup' && Array.isArray(payload.group)) {
        const group: any[] = payload.group;
        // Ouvrir le panneau du LOV primaire
        const primary = (group.find((g:any)=>g.userId===user?.uid) || group[0]);
        setSelectedFck(primary);
        setFckPopupOpen(true);
        setPendingGroup(group);
      }
    } catch {}
  };

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html: mapHtml }}
        onMessage={onWebMessage}
        injectedJavaScriptBeforeContentLoaded={"true;"}
        style={styles.map}
        ref={webViewRef}
        onLoadEnd={() => {
          if (webViewRef.current) {
            try {
              const colored = fcks.map(item => ({
                ...item,
                userColor: getColorForUserId(item.userId),
              }));
              const payload = JSON.stringify({ type: 'syncFcks', fcks: colored, currentUserId: user?.uid || null, friends });
              webViewRef.current.postMessage(payload);
            } catch {}
          }
        }}
      />
      {/* Boutons UI uniquement (sans fonctionnalités) */}
      <View style={styles.topRow} pointerEvents="box-none">
        <View style={styles.logoRow}>
          <Image 
            source={require('../assets/images/logo2-V1_horizontal.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <LanguageButton style={styles.langBadge} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity style={styles.friendsFab} activeOpacity={1} onPress={() => setFriendsOpen(true)}>
            <Text style={{ fontSize: 18 }}>👥</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.profileChip} 
            activeOpacity={0.8} 
            onPress={() => setProfileMenuOpen((v) => !v)}
          >
            <Text style={styles.profileText}>{pseudo} ▾</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Boutons +/- supprimés; stats sera aligné dans la barre du bas */}

      {/* Bannière publicitaire AdMob */}
      <View style={styles.adBannerContainer}>
        <AdBanner />
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.statsInline} activeOpacity={1} onPress={async () => { await refreshUserFcks(); setStatsOpen(true); }}>
          <Text style={styles.statsIcon}>📊</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.ctaButton, { flex: 1 }]}
          activeOpacity={1}
          onPress={() => {
            resetNewFckForm();
            setNewFckOpen(true);
            postClearPreviewToMap();
          }}
        >
          <Text style={styles.ctaText}>{t('home.markFck')}</Text>
        </TouchableOpacity>
      </View>

      {/* Panel Amis */}
      <Modal visible={friendsOpen} transparent animationType="fade" onRequestClose={() => setFriendsOpen(false)}>
        <Pressable style={styles.accountBackdrop} onPress={() => setFriendsOpen(false)}>
          <Pressable style={styles.accountCard} onPress={() => {}}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.accountTitle}>{t('home.myFriends')}</Text>
              <TouchableOpacity onPress={() => setFriendsOpen(false)}><Text style={styles.accountClose}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
              <View style={{ backgroundColor: '#FF6A2B', padding: 12, borderRadius: 12 }}>
                <Text style={{ color: '#fff', fontWeight: '800' }}>{t('home.myCode')}:  {myCode || '—'}</Text>
              </View>
              <View style={{ flexDirection: 'row', marginTop: 10, gap: 8, alignItems: 'center' }}>
                <TextInput
                  placeholder={t('home.enterFriendCode')}
                  value={addCode}
                  onChangeText={setAddCode}
                  style={[styles.input, { flex: 2.2, height: 48 }]}
                />
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#2D7FF9', minWidth: 84, paddingVertical: 10, flex: 0.5 }]}
                  disabled={adding || !addCode.trim()}
                  onPress={async () => {
                    try {
                      setAdding(true);
                      await addFriendByCode(addCode.trim());
                      setAddCode('');
                    } catch (e: any) {
                      Alert.alert('Erreur', e?.message || "Ajout impossible");
                    } finally {
                      setAdding(false);
                    }
                  }}
                >
                  <Text style={styles.actionBtnText}>{adding ? t('home.adding') : t('home.validate')}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>{t('home.friendsList')}</Text>              
              
              {friends.map(f => {
                const friendFcks = fcks.filter(x => x.userId === f.uid);
                const count = friendFcks.length;
                const avgNum = count ? (friendFcks.reduce((s, x) => s + (x.rating || 0), 0) / count) : 0;
                const avg = Number.isInteger(avgNum) ? String(avgNum) : avgNum.toFixed(1);
                return (
                  <View key={f.uid} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
                    <Text style={{ color: f.color || '#333', fontWeight: '700' }}>{f.displayName}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text>📍 {count}</Text>
                      <Text>★ {avg}</Text>
                      <TouchableOpacity onPress={async () => { try { await removeFriend(f.uid); } catch (e:any) { Alert.alert('Erreur', e?.message||''); } }}>
                        <Text style={{ color: '#999' }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
              

            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {profileMenuOpen && (
        <Pressable style={styles.menuBackdrop} onPress={() => setProfileMenuOpen(false)}>
          <View style={styles.menuCard}>
                                  <TouchableOpacity style={styles.menuItem} onPress={() => { setProfileMenuOpen(false); setAccountOpen(true); }}>
              <Text style={styles.menuItemIcon}>👤</Text>
              <Text style={styles.menuItemText}>{t('home.profileMenu')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setProfileMenuOpen(false); setNotificationsHistoryOpen(true); }}>
              <Text style={styles.menuItemIcon}>🔔</Text>
              <Text style={styles.menuItemText}>{t('notifications.title')}</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Text style={[styles.menuItemIcon, { color: '#FF3B30' }]}>↪️</Text>
              <Text style={[styles.menuItemText, { color: '#FF3B30' }]}>{t('home.logout')}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      )}

      {/* Panneau Mon compte (UI uniquement) */}
      <Modal visible={accountOpen} transparent animationType="fade" onRequestClose={() => setAccountOpen(false)}>
        <Pressable style={styles.accountBackdrop} onPress={() => setAccountOpen(false)}>
          <Pressable style={styles.accountCard} onPress={() => {}}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.accountTitle}>{t('home.profileMenu')}</Text>
              <TouchableOpacity onPress={() => setAccountOpen(false)}><Text style={styles.accountClose}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
              <Text style={styles.sectionTitle}>{t('home.information')}</Text>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldIcon}>👤</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>{t('home.username')}</Text>
                  {/* Affichage en lecture seule, pas de modification de pseudo dans l'app */}
                  <Text style={styles.fieldValue}>{pseudo}</Text>

                </View>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldIcon}>✉️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>{t('home.email')}</Text>
                  <Text style={styles.fieldValue}>{user?.email || '—'}</Text>
                </View>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldIcon}>🗓️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>{t('home.accountCreated')}</Text>
                  <Text style={styles.fieldValue}>{createdAtStr}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.settingsButton} 
                onPress={() => {
                  setAccountOpen(false);
                  setNotificationSettingsOpen(true);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.settingsButtonContent}>
                  <View style={styles.settingsButtonInfo}>
                    <Text style={styles.settingsButtonLabel}>{t('notifications.settings')}</Text>
                  </View>
                  <Text style={styles.settingsButtonArrow}>→</Text>
                </View>
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>{t('home.changePassword')}</Text>
              <TextInput
                placeholder={t('home.currentPassword')}
                secureTextEntry
                value={pwdCurrent}
                onChangeText={setPwdCurrent}
                style={styles.input}
              />
              <TextInput
                placeholder={t('home.newPassword')}
                secureTextEntry
                value={pwdNew}
                onChangeText={setPwdNew}
                style={styles.input}
              />
              <TextInput
                placeholder={t('home.confirmNewPassword')}
                secureTextEntry
                value={pwdConfirm}
                onChangeText={setPwdConfirm}
                style={styles.input}
              />
              <TouchableOpacity style={styles.pwdBtn} activeOpacity={1}>
                <Text style={styles.pwdBtnText}>{t('home.changePassword')}</Text>
              </TouchableOpacity>

                               <View style={styles.footerLinks}>
                   <TouchableOpacity onPress={() => setLegalOpen(true)}>
                     <Text style={styles.linkText}>{t('home.legalInformation')}</Text>
                   </TouchableOpacity>
                 </View>

                 {/* Bouton de suppression de compte - très discret */}
                 <View style={styles.deleteAccountContainer}>
                   <TouchableOpacity 
                     style={styles.deleteAccountButton} 
                     onPress={handleDeleteAccount}
                     activeOpacity={0.7}
                   >
                     <Text style={styles.deleteAccountText}>Supprimer mon compte</Text>
                   </TouchableOpacity>
                 </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal de mot de passe pour suppression de compte */}
      <Modal visible={showPasswordModal} transparent animationType="fade" onRequestClose={() => setShowPasswordModal(false)}>
        <View style={styles.passwordModalBackdrop}>
          <View style={styles.passwordModalContainer}>
            <Text style={styles.passwordModalTitle}>🔐 Réauthentification requise</Text>
            <Text style={styles.passwordModalSubtitle}>
              Pour des raisons de sécurité, veuillez saisir votre mot de passe actuel :
            </Text>
            
            <TextInput
              style={styles.passwordModalInput}
              placeholder="Votre mot de passe"
              secureTextEntry
              value={passwordInput}
              onChangeText={setPasswordInput}
              autoFocus
            />
            
            <View style={styles.passwordModalButtons}>
              <TouchableOpacity 
                style={[styles.passwordModalButton, styles.passwordModalButtonCancel]}
                onPress={() => {
                  setShowPasswordModal(false);
                  setPasswordInput('');
                }}
              >
                <Text style={styles.passwordModalButtonTextCancel}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.passwordModalButton, styles.passwordModalButtonConfirm]}
                onPress={confirmDeleteWithPassword}
                disabled={loading}
              >
                <Text style={[styles.passwordModalButtonTextConfirm, loading && { opacity: 0.5 }]}>
                  {loading ? 'Suppression...' : 'Confirmer'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Navigateur Légal */}
      <Modal visible={legalOpen} transparent animationType="fade" onRequestClose={() => setLegalOpen(false)}>
        <View style={styles.legalBackdrop}>
          <View style={styles.legalContainer}>
            <LegalNavigator onGoBack={() => setLegalOpen(false)} />
          </View>
        </View>
      </Modal>

      {/* Paramètres des notifications */}
      <Modal visible={notificationSettingsOpen} transparent animationType="fade" onRequestClose={() => setNotificationSettingsOpen(false)}>
        <View style={styles.legalBackdrop}>
          <View style={styles.legalContainer}>
            <NotificationSettingsScreen onGoBack={() => setNotificationSettingsOpen(false)} />
          </View>
        </View>
      </Modal>

      {/* Historique des notifications */}
      <Modal visible={notificationsHistoryOpen} transparent animationType="fade" onRequestClose={() => setNotificationsHistoryOpen(false)}>
        <View style={styles.legalBackdrop}>
          <View style={styles.legalContainer}>
            <NotificationsHistoryScreen onGoBack={() => setNotificationsHistoryOpen(false)} />
          </View>
        </View>
      </Modal>

              {/* Panneau Marquez un LOV */}
      <Modal
        visible={newFckOpen}
        transparent
        animationType="fade"
        onRequestClose={() => { setNewFckOpen(false); postClearPreviewToMap(); }}
        onShow={() => { resetNewFckForm(); postClearPreviewToMap(); }}
      >
        <Pressable style={styles.fckBackdrop} onPress={() => { setNewFckOpen(false); postClearPreviewToMap(); }}>
          <Pressable style={styles.fckCard} onPress={() => {}}>
            <View style={styles.fckHeaderRow}>
              <Text style={styles.fckTitle}>{t('home.markFck')}</Text>
              <TouchableOpacity onPress={() => { setNewFckOpen(false); postClearPreviewToMap(); }}><Text style={styles.accountClose}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
              {/* Type de localisation */}
              <Text style={styles.fckLabel}>{t('home.locationTypeLabel')} *</Text>
              <View style={styles.fckRadioRow}>
                <TouchableOpacity style={styles.radioItem} onPress={() => { setLocationType('address'); setSuggestions([]); setSearchQuery(''); setSelectedCoords(null); }}>
                  <View style={[styles.radioDot, locationType==='address' && styles.radioDotActive]} />
                  <Text style={styles.radioText}>{t('home.locationType.address')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.radioItem} onPress={() => { setLocationType('city'); setSuggestions([]); setSearchQuery(''); setSelectedCoords(null); }}>
                  <View style={[styles.radioDot, locationType==='city' && styles.radioDotActive]} />
                  <Text style={styles.radioText}>{t('home.locationType.city')}</Text>
                </TouchableOpacity>
              </View>

              {/* Adresse */}
              <Text style={styles.fckLabel}>{locationType==='address' ? t('home.locationType.address') + ' *' : t('home.city') + ' *'}</Text>
              <TextInput
                placeholder={locationType==='address' ? t('home.addressExample') : t('home.cityExample')}
                style={styles.input}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {!!searchQuery && suggestions.length > 0 && (
                <View style={styles.suggestionsCard}>
                  {suggestions.map(s => (
                    <TouchableOpacity key={s.id} style={styles.suggestionItem} onPress={() => onSelectSuggestion(s)}>
                      <Text style={styles.suggestionText}>{s.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {searching && <Text style={styles.suggestionHint}>{t('home.searching')}</Text>}
              {!searching && searchQuery.length >= 3 && suggestions.length === 0 && (
                <Text style={styles.suggestionHint}>{t('home.noResults')}</Text>
              )}

              {/* Emoji */}
              <Text style={[styles.fckLabel, { marginTop: 10 }]}>{t('home.selectEmoji')} *</Text>
              <View style={styles.emojiRow}>
                <TouchableOpacity
                  style={[styles.emojiCard, selectedEmoji==='aubergine' && styles.emojiCardActive]}
                  onPress={() => setSelectedEmoji('aubergine')}
                >
                  <Text style={[styles.emojiIcon, selectedEmoji==='aubergine' && styles.emojiIconActive]}>🍆</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.emojiCard, selectedEmoji==='peche' && styles.emojiCardActive]}
                  onPress={() => setSelectedEmoji('peche')}
                >
                  <Text style={[styles.emojiIcon, selectedEmoji==='peche' && styles.emojiIconActive]}>🍑</Text>
                </TouchableOpacity>
              </View>

              {/* Partenaire (optionnel) */}
              <Text style={[styles.fckLabel, { marginTop: 10 }]}>{t('home.partnerName')} ({t('common.optional')})</Text>
              <TextInput
                placeholder={t('home.partnerNamePlaceholder')}
                style={styles.input}
                value={partnerName}
                onChangeText={setPartnerName}
              />

              {/* Note */}
              <Text style={[styles.fckLabel, { marginTop: 10 }]}>{t('home.rateExperience')} *</Text>
              <View style={styles.starsRow}>
                {[1,2,3,4,5].map(i => (
                  <TouchableOpacity key={i} onPress={() => setRating(i)}>
                    <Text style={[styles.starIcon, i <= rating ? styles.starActive : styles.starInactive]}>★</Text>
                  </TouchableOpacity>
                ))}
              </View>


              {/* Actions */}
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#eee' }]} onPress={() => { setNewFckOpen(false); postClearPreviewToMap(); }}>
                  <Text style={[styles.actionBtnText, { color: '#333' }]}>{t('home.cancelButton')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#FF6A2B' }]}
                  disabled={!selectedCoords || !selectedEmoji || rating === 0}
                  onPress={async () => {
                    try {
                      if (!selectedCoords || !selectedEmoji || rating === 0) return;
                      setSavingFck(true);
                      // addressLabel = le champ saisi
                      const addressLabel = searchQuery.trim();
                      const cityOnly = extractCityFromLabel(addressLabel, locationType);
                      await addFck({
                        latitude: selectedCoords.latitude,
                        longitude: selectedCoords.longitude,
                        emoji: selectedEmoji,
                        locationType: locationType,
                        addressLabel,
                        city: cityOnly,
                        partnerName,
                        rating,
                        userColor: getUserColor(user?.uid),
                      });
                      setNewFckOpen(false);
                      postClearPreviewToMap();
                      Alert.alert(t('common.success'), t('home.messages.fckAdded'));
                      // Sauvegarde réussie
                    } catch (e: any) {
                      Alert.alert(t('common.error'), e?.message || t('home.messages.fckAddError'));
                    } finally {
                      setSavingFck(false);
                    }
                  }}
                >
                  <Text style={styles.actionBtnText}>{savingFck ? t('home.saving') : t('home.markThisFck')}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Panneau Statistiques */}
      <Modal
        visible={statsOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setStatsOpen(false)}
        onShow={() => { refreshUserFcks(); }}
      >
        <Pressable style={styles.accountBackdrop} onPress={() => setStatsOpen(false)}>
          <Pressable style={styles.accountCard} onPress={() => {}}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.accountTitle}>{t('home.statsTitle')}</Text>
              <TouchableOpacity onPress={() => setStatsOpen(false)}><Text style={styles.accountClose}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
              {(() => {
                const total = userFcks.length;
                const avg = total ? (userFcks.reduce((s, f: any) => s + (Number(f.rating)||0), 0) / total) : 0;
                const recent = [...userFcks].sort((a: any, b: any) => (b.createdAt?.getTime?.()||0) - (a.createdAt?.getTime?.()||0)).slice(0, 3);
                const dist = [1,2,3,4,5].map(star => userFcks.filter((f: any) => Number(f.rating) === star).length);
                return (
                  <>
                    {/* Tuiles */}
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                      <View style={styles.statTile}>
                        <Text style={styles.statTileLabel}>{t('home.totalFcks')}</Text>
                        <Text style={styles.statTileValue}>{total}</Text>
                      </View>
                      <View style={styles.statTile}>
                        <Text style={styles.statTileLabel}>{t('home.averageRating')}</Text>
                        <Text style={styles.statTileValue}>{avg ? avg.toFixed(1) : '—'}</Text>
                      </View>
                    </View>

                    {/* Activité récente */}
                    <View style={styles.cardBox}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={styles.sectionTitle}>{t('home.recentActivity')}</Text>
                      </View>
                      {recent.length === 0 ? (
                        <Text style={{ color: '#777' }}>{t('home.noData')}</Text>
                      ) : recent.map((f: any, idx: number) => (
                        <View key={String(f.id||idx)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={{ fontSize: 16 }}>{f.emoji === 'aubergine' ? '🍆' : '🍑'}</Text>
                            <Text style={{ color: '#111' }}>{deriveCityFromFck(f) || '—'}</Text>
                          </View>
                          <Text style={{ color: '#FFC107', fontWeight: '700' }}>★ {Number(f.rating)||0}</Text>
                        </View>
                      ))}
                      {total > 3 && (
                     <Text style={{ color: '#777' }}>+ {total - 3} {t('home.more')}</Text>
                      )}
      </View>

                    {/* Répartition des notes */}
                    <View style={styles.cardBox}>
                      <Text style={styles.sectionTitle}>{t('home.ratingDistribution')}</Text>
                      {[5,4,3,2,1].map((star) => {
                        const count = dist[star-1];
                        const pct = total ? (count/total) : 0;
                        return (
                          <View key={star} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 }}>
                            <View style={{ width: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                              <Text style={{ marginRight: 4 }}>{star}</Text>
                              <Text>★</Text>
                            </View>
                            <View style={{ flex: 1, height: 8, backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden' }}>
                              <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: '#FFC107' }} />
                            </View>
                            <Text style={{ width: 30, textAlign: 'right' }}>{count}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </>
                );
              })()}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

              {/* Popup LOV (détail) */}
      <Modal
        visible={fckPopupOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFckPopupOpen(false)}
      >
        <Pressable style={styles.accountBackdrop} onPress={() => setFckPopupOpen(false)}>
          <Pressable style={[styles.accountCard, { padding: 12 }]} onPress={() => {}}>
            {(() => {
              const isMine = selectedFck?.userId === user?.uid;
              const fr = isMine ? null : friends.find(f => f.uid === selectedFck?.userId);
              const dotColor = isMine ? '#FF6A2B' : (fr?.color || '#FF6A2B');
              const title = isMine
                ? t('home.messages.yourLov')
                : (fr?.displayName || String((selectedFck?.userEmail || '').split('@')[0] || t('home.messages.friend')));
              return (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: dotColor }} />
                    <Text style={{ fontWeight: '800', color: '#111' }}>{title}</Text>
                    <Text>{selectedFck?.emoji === 'aubergine' ? '🍆' : '🍑'}</Text>
                    <Text style={{ color: '#FFC107', fontWeight: '800' }}>★ {Number(selectedFck?.rating||0)}</Text>
                  </View>
                  <TouchableOpacity onPress={() => { setFckPopupOpen(false); setPendingGroup(null); }}>
                    <Text style={styles.accountClose}>✕</Text>
                  </TouchableOpacity>
                </View>
              );
            })()}

            {/* Affichage du partenaire directement sous le titre principal */}
            {(selectedFck?.userId === user?.uid && !!selectedFck?.partnerName) && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <Text style={{ fontSize: 16 }}>❤</Text>
                <Text style={{ color: '#111' }}>{t('home.messages.with')} <Text style={{ fontWeight: '700' }}>{selectedFck?.partnerName}</Text></Text>
              </View>
            )}





            {Array.isArray(pendingGroup) && pendingGroup.length >= 2 && (()=>{
              const primaryId = selectedFck?.userId;
              
              // Trouver l'ami (pas nous-mêmes)
              const other = pendingGroup.find((g:any) => g.userId !== primaryId);
              
              // Trouver l'ami dans la liste des amis (collection friendships)
              const fr = friends.find(f => f.uid === other?.userId);
              
              if (!other) return null;
              
              // Récupérer le displayName de l'ami depuis la collection friendships
              // Récupérer le nom de l'ami depuis la collection friendships
              const friendName = fr?.displayName || String(((other.userEmail || '') as string).split('@')[0] || t('home.messages.friend'));
              

              
              return (
                <View style={{ marginTop: 8, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#e6f0ff', backgroundColor: '#f4f8ff' }}>
                  <View style={{ flexDirection:'column', gap: 8 }}>
                    {/* Ligne principale : nom de l'ami avec emoji et note */}
                    <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
                      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: fr?.color || '#2D7FF9' }} />
                      <Text style={{ color:'#2D7FF9', fontWeight:'800' }}>{friendName}</Text>
                      <Text>{other.emoji === 'aubergine' ? '🍆' : '🍑'}</Text>
                      <Text style={{ color:'#FFC107', fontWeight:'800' }}>★ {Number(other.rating||0)}</Text>
                    </View>
                    
                    {/* Ligne du partenaire de l'ami (si disponible) */}
                    {other.partnerName && (
                      <View style={{ flexDirection:'row', alignItems:'center', gap:8, marginLeft: 18 }}>
                        <Text style={{ fontSize: 14, color: fr?.color || '#2D7FF9' }}>❤</Text>
                        <Text style={{ color:'#666', fontSize: 13 }}>{t('home.messages.with')} <Text style={{ fontWeight:'600' }}>{other.partnerName}</Text></Text>
                      </View>
                    )}
                    
                    {/* Réactions émojis de l'ami - vous pouvez réagir à son LOV */}
                    <View style={{ marginTop: 6, marginLeft: 0, paddingLeft: 0 }}>
                      <ReactionsInline 
                        lovId={other.id || ''} 
                        size="small"
                      />
                    </View>
                  </View>
                </View>
              );
            })()}



            {selectedFck?.userId === user?.uid ? (
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#2D7FF9' }]}
                  onPress={() => {
                    if (!selectedFck) return;
                    setEditPartnerName(selectedFck.partnerName || '');
                    setEditEmoji(selectedFck.emoji);
                    setEditRating(Number(selectedFck.rating || 0));
                    setEditFckOpen(true);
                  }}
                >
                  <Text style={styles.actionBtnText}>{t('common.edit')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#FF3B30' }]}
                  onPress={() => setDeleteConfirmOpen(true)}
                >
                  <Text style={styles.actionBtnText}>{t('common.delete')}</Text>
                </TouchableOpacity>
              </View>
            ) : null}

                         {/* Affichage des réactions émojis */}
             <View style={{ marginTop: 16, paddingLeft: 0 }}>
               <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#333' }}>
                 {t('home.messages.reactions')}
               </Text>
               <ReactionsInline
                 lovId={selectedFck?.id || ''}
               />
             </View>

          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal Edit LOV */}
      <Modal
        visible={editFckOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setEditFckOpen(false)}
      >
        <Pressable style={styles.accountBackdrop} onPress={() => setEditFckOpen(false)}>
          <Pressable style={styles.accountCard} onPress={() => {}}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.accountTitle}>{t('home.messages.editLov')}</Text>
              <TouchableOpacity onPress={() => setEditFckOpen(false)}><Text style={styles.accountClose}>✕</Text></TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>{t('home.messages.emoji')}</Text>
            <View style={styles.emojiRow}>
              <TouchableOpacity
                style={[styles.emojiCard, editEmoji==='aubergine' && styles.emojiCardActive]}
                onPress={() => setEditEmoji('aubergine')}
              >
                <Text style={styles.emojiIcon}>🍆</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.emojiCard, editEmoji==='peche' && styles.emojiCardActive]}
                onPress={() => setEditEmoji('peche')}
              >
                <Text style={styles.emojiIcon}>🍑</Text>
              </TouchableOpacity>
      </View>

            <Text style={styles.sectionTitle}>{t('home.messages.partnerName')}</Text>
            <TextInput style={styles.input} value={editPartnerName} onChangeText={setEditPartnerName} placeholder={t('home.messages.partnerNameOptional')} />

            <Text style={styles.sectionTitle}>{t('home.messages.rating')}</Text>
            <View style={styles.starsRow}>
              {[1,2,3,4,5].map(i => (
                <TouchableOpacity key={i} onPress={() => setEditRating(i)}>
                  <Text style={[styles.starIcon, i <= editRating ? styles.starActive : styles.starInactive]}>★</Text>
                </TouchableOpacity>
              ))}
        </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#eee' }]} onPress={() => setEditFckOpen(false)}>
                <Text style={[styles.actionBtnText, { color: '#333' }]}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#2D7FF9' }]}
                disabled={!selectedFck || !editEmoji || editRating === 0}
                onPress={async () => {
                  try {
                    if (!selectedFck || !editEmoji || editRating === 0) return;
                    setSavingEdit(true);
                    await updateFck(selectedFck.id, {
                      emoji: editEmoji,
                      partnerName: editPartnerName || undefined,
                      rating: editRating,
                    });
                    // Mise à jour locale pour l'instantanéité
                    setFcks(prev => prev.map(f => f.id === selectedFck.id ? { ...f, emoji: editEmoji, partnerName: editPartnerName || null, rating: editRating } : f));
                    setUserFcks(prev => prev.map(f => f.id === selectedFck.id ? { ...f, emoji: editEmoji, partnerName: editPartnerName || null, rating: editRating } : f));
                    setEditFckOpen(false);
                    setFckPopupOpen(false);
                  } catch (e: any) {
                    Alert.alert('Erreur', e?.message || 'Modification impossible');
                  } finally {
                    setSavingEdit(false);
                  }
                }}
              >
                <Text style={styles.actionBtnText}>{savingEdit ? t('home.messages.saving') : t('common.save')}</Text>
              </TouchableOpacity>
            </View>


          </Pressable>
        </Pressable>
      </Modal>

      {/* Confirmation Suppression */}
      <Modal
        visible={deleteConfirmOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteConfirmOpen(false)}
      >
        <Pressable style={styles.accountBackdrop} onPress={() => setDeleteConfirmOpen(false)}>
          <Pressable style={styles.accountCard} onPress={() => {}}>
            <Text style={styles.accountTitle}>{t('home.messages.deleteConfirm')}</Text>
            <Text style={{ color: '#666', marginTop: 8 }}>{t('home.messages.deleteWarning')}</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#eee' }]} onPress={() => setDeleteConfirmOpen(false)}>
                <Text style={[styles.actionBtnText, { color: '#333' }]}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#FF3B30' }]}
                onPress={async () => {
                  try {
                    if (!selectedFck) return;
                    if (selectedFck.userId !== user?.uid) {
                      Alert.alert('Info', t('home.messages.deleteError'));
                      return;
                    }
                    setDeleting(true);
                    await deleteFck(selectedFck.id);
                    setDeleting(false);
                    setDeleteConfirmOpen(false);
                    setFckPopupOpen(false);
                  } catch (e: any) {
                    setDeleting(false);
                    Alert.alert('Erreur', e?.message || 'Suppression impossible');
                  }
                }}
              >
                <Text style={styles.actionBtnText}>{deleting ? t('home.messages.deleting') : t('common.delete')}</Text>
        </TouchableOpacity>
      </View>
          </Pressable>
        </Pressable>
      </Modal>


    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  topRow: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  friendsFab: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  logoImage: { width: 60, height: 30, marginRight: 8 },
  langBadge: { backgroundColor: '#fff', paddingVertical: 6, paddingHorizontal: 8, borderRadius: 8 },
  langText: { color: '#333', fontWeight: '700' },
  profileChip: { 
    backgroundColor: '#fff', 
    paddingVertical: 10, 
    paddingHorizontal: 16, 
    borderRadius: 16, 
    maxWidth: 220,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  profileText: { color: '#333', fontWeight: '700', fontSize: 14, flexShrink: 1, textAlign: 'center' },
  statsIcon: { fontSize: 18 },
  menuBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  menuCard: {
    position: 'absolute',
    top: 84,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    width: 200,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  menuItemIcon: { fontSize: 14, color: '#333' },
  menuItemText: { fontSize: 14, color: '#333', fontWeight: '600' },
  menuDivider: { height: 1, backgroundColor: '#eee', marginVertical: 4 },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 60, // Remonter au-dessus de la bannière publicitaire
    padding: 12,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsInline: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  ctaButton: { backgroundColor: '#FF6A2B', padding: 14, borderRadius: 14, alignItems: 'center' },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  markerButton: {
    backgroundColor: '#FF3B30',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  markerButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  logoutButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: { fontSize: 18, textAlign: 'center', marginTop: 50, color: '#666' },
  markerBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  markerBadgeText: { color: '#fff', fontWeight: 'bold' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  modalHint: {
    color: '#666',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  actionBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionBtnText: { color: '#fff', fontWeight: '700' },
  accountBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  accountCard: {
    width: '88%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  accountTitle: { fontSize: 20, fontWeight: '800', color: '#111' },
  accountClose: { fontSize: 20, color: '#888', padding: 4 },
  sectionTitle: { marginTop: 16, marginBottom: 8, fontSize: 16, fontWeight: '800', color: '#222' },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', paddingVertical: 10 },
  fieldIcon: { fontSize: 16, width: 22, textAlign: 'center' },
  fieldLabel: { fontSize: 12, color: '#777' },
  fieldValue: { fontSize: 16, color: '#111', fontWeight: '600' },
  editIcon: { color: '#777' },
  saveIcon: { fontSize: 18, color: '#007AFF', paddingHorizontal: 6 },
  pwdBtn: { marginTop: 8, backgroundColor: '#FF6A2B', padding: 14, borderRadius: 12, alignItems: 'center' },
  pwdBtnText: { color: '#fff', fontWeight: '800' },
  footerLinks: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 12 },
  linkText: { color: '#777', fontSize: 12 },
  dot: { color: '#bbb' },
  // Styles pour le bouton de suppression de compte (très discret)
  deleteAccountContainer: { 
    marginTop: 24, 
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee'
  },
  deleteAccountButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ffebee',
  },
  deleteAccountText: {
    color: '#f44336',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Styles pour le modal de mot de passe
  passwordModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passwordModalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  passwordModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
    textAlign: 'center',
    marginBottom: 8,
  },
  passwordModalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  passwordModalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 24,
  },
  passwordModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  passwordModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passwordModalButtonCancel: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  passwordModalButtonConfirm: {
    backgroundColor: '#f44336',
  },
  passwordModalButtonTextCancel: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  passwordModalButtonTextConfirm: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // FCK modal styles
  fckBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  fckCard: { width: '90%', maxHeight: '85%', backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  fckHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fckTitle: { fontSize: 20, fontWeight: '800', color: '#111' },
  fckLabel: { marginTop: 8, marginBottom: 6, fontSize: 14, fontWeight: '700', color: '#222' },
  fckRadioRow: { flexDirection: 'row', gap: 18, alignItems: 'center', marginBottom: 4 },
  radioItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  radioDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#ccc' },
  radioDotActive: { borderColor: '#FF6A2B', backgroundColor: '#FF6A2B' },
  radioText: { color: '#333' },
  suggestionsCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', borderRadius: 10, marginTop: 6, overflow: 'hidden' },
  suggestionItem: { paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  suggestionText: { color: '#333' },
  suggestionHint: { color: '#999', fontSize: 12, marginTop: 6 },
  emojiRow: { flexDirection: 'row', gap: 12 },
  emojiCard: { flex: 1, borderWidth: 1, borderColor: '#eee', borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: '#fff' },
  emojiCardActive: { borderColor: '#FF6A2B', backgroundColor: '#FFF4EF', borderWidth: 2 },
  emojiIcon: { fontSize: 24 },
  emojiIconActive: { fontSize: 24 },
  emojiText: { marginTop: 6, color: '#333', fontWeight: '600' },
  starsRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  starIcon: { fontSize: 28 },
  starActive: { color: '#FFC107' },
  starInactive: { color: '#D0D0D0' },
  // Stats
  statTile: { flex: 1, backgroundColor: '#fff', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: '#eee' },
  statTileLabel: { color: '#777', fontSize: 12 },
  statTileValue: { color: '#111', fontSize: 24, fontWeight: '800' },
  cardBox: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginTop: 12, borderWidth: 1, borderColor: '#eee' },
  // Bouton commentaires simplifié
  commentsButton: {
    backgroundColor: '#FF6A2B', // Couleur orange de l'app
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  commentsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  // Styles pour le navigateur légal
  legalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legalContainer: {
    width: '95%',
    height: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  // Styles pour le bouton des paramètres
  settingsButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  settingsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  settingsButtonInfo: {
    flex: 1,
  },
  settingsButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  settingsButtonArrow: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  // Style pour la bannière publicitaire
  adBannerContainer: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
});

export default HomeScreen;
