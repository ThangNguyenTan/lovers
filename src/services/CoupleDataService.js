import { doc, setDoc, onSnapshot, collection, addDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { ref, set, onValue } from 'firebase/database';
import { db, database } from '../config/firebase';

/**
 * Initializes the master couple document in Firestore.
 */
export const createCoupleDocument = async (coupleId, userAId, userBId, userAInfo, userBInfo) => {
  const coupleRef = doc(db, 'couples', coupleId);
  await setDoc(coupleRef, {
    users: {
      [userAId]: userAInfo,
      [userBId]: userBInfo
    },
    created_at: serverTimestamp(),
    anniversaries: [],
    virtualPet: {
      type: 'cat',
      name: 'Mochi',
      hungerLevel: 100,
      happinessLevel: 100,
      lastFed: serverTimestamp()
    }
  });
};

/**
 * Subscribes to the master couple document for real-time reactivity in the UI.
 * This reads all top-level states (Pet, Anniversaries, Users) in one call.
 */
export const subscribeToCoupleState = (coupleId, callback) => {
  const coupleRef = doc(db, 'couples', coupleId);
  return onSnapshot(coupleRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    } else {
      callback(null);
    }
  });
};

/**
 * Sends a chat message to the sub-collection.
 */
export const sendMessage = async (coupleId, senderId, text, effectTrigger = null) => {
  const messagesRef = collection(db, 'couples', coupleId, 'messages');
  await addDoc(messagesRef, {
    senderId,
    text,
    timestamp: serverTimestamp(),
    effectTrigger
  });
};

/**
 * Adds a memory story to the timeline sub-collection.
 */
export const addStory = async (coupleId, title, description, imageUrls = [], locationGeo = null) => {
  const storiesRef = collection(db, 'couples', coupleId, 'stories');
  await addDoc(storiesRef, {
    title,
    description,
    dateOccurred: serverTimestamp(),
    imageUrls,
    locationGeo
  });
};

/**
 * Updates the high-frequency ephemeral location in Realtime Database.
 */
export const updateRealtimeLocation = async (coupleId, userId, lat, lng, batteryLevel, isCharging, status = 'moving') => {
  const locationRef = ref(database, `rt_locations/${coupleId}/${userId}`);
  await set(locationRef, {
    lat,
    lng,
    batteryLevel,
    isCharging,
    lastUpdated: Date.now(),
    status
  });
};

/**
 * Subscribes to real-time location updates for both users in a couple.
 */
export const subscribeToLocations = (coupleId, callback) => {
  const locationsRef = ref(database, `rt_locations/${coupleId}`);
  return onValue(locationsRef, (snapshot) => {
    callback(snapshot.val() || {});
  });
};

/**
 * Subscribes to the latest messages in the chat.
 */
export const subscribeToMessages = (coupleId, callback, maxMessages = 50) => {
  const messagesRef = collection(db, 'couples', coupleId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(maxMessages));
  
  return onSnapshot(q, (snapshot) => {
    const messages = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    callback(messages.reverse());
  });
};

/**
 * Subscribes to the shared memory stories.
 */
export const subscribeToStories = (coupleId, callback) => {
  const storiesRef = collection(db, 'couples', coupleId, 'stories');
  const q = query(storiesRef, orderBy('dateOccurred', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const stories = [];
    snapshot.forEach((doc) => {
      stories.push({ id: doc.id, ...doc.data() });
    });
    callback(stories);
  });
};

/**
 * Updates the state of the shared virtual pet.
 */
export const updatePetState = async (coupleId, newState) => {
  const coupleRef = doc(db, 'couples', coupleId);
  await setDoc(coupleRef, { virtualPet: newState }, { merge: true });
};


