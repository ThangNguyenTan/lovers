import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [coupleId, setCoupleId] = useState(null);
  const [coupleData, setCoupleData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUserDoc = null;
    let unsubscribeCoupleDoc = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        unsubscribeUserDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            const newCoupleId = userData.coupleId || null;
            
            // If coupleId changed, reset coupleData and re-subscribe
            if (newCoupleId !== coupleId) {
              setCoupleId(newCoupleId);
              if (unsubscribeCoupleDoc) unsubscribeCoupleDoc();
              
              if (newCoupleId) {
                const coupleRef = doc(db, 'couples', newCoupleId);
                unsubscribeCoupleDoc = onSnapshot(coupleRef, (coupleSnap) => {
                  setCoupleData(coupleSnap.exists() ? coupleSnap.data() : null);
                });
              } else {
                setCoupleData(null);
              }
            }
          } else {
            setCoupleId(null);
            setCoupleData(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error subscribing to user doc:", error);
          setLoading(false);
        });
      } else {
        setCoupleId(null);
        setCoupleData(null);
        setLoading(false);
        if (unsubscribeUserDoc) unsubscribeUserDoc();
        if (unsubscribeCoupleDoc) unsubscribeCoupleDoc();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
      if (unsubscribeCoupleDoc) unsubscribeCoupleDoc();
    };
  }, [coupleId]); // Added coupleId to dependencies to manage the sub-subscription

  const value = {
    currentUser,
    coupleId,
    coupleData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
