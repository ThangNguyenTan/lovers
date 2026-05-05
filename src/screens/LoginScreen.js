import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Platform,
  SafeAreaView
} from 'react-native';
import { getAuth, signInWithPopup, signInAnonymously, GoogleAuthProvider } from 'firebase/auth';
import { app } from '../config/firebase';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  background: '#121212',
  surface: '#1E1E1E',
  primary: '#FF4B72',
  text: '#FFFFFF',
  textSec: '#A0A0A0',
  google: '#4285F4'
};

const LoginScreen = () => {
  const handleGoogleLogin = async () => {
    const authInstance = getAuth(app);
    const provider = new GoogleAuthProvider();
    
    if (!authInstance || !provider) {
      alert("Firebase not ready. Please try again.");
      return;
    }

    try {
      if (Platform.OS === 'web') {
        try {
          const result = await signInWithPopup(authInstance, provider);
          console.log("Logged in with Google:", result.user.email);
        } catch (popupError) {
          if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/cancelled-popup-request') {
            alert("Popup was blocked! Please allow popups for this site or try again.");
          } else {
            throw popupError;
          }
        }
      } else {
        alert("Native Google Login requires extra setup. Use the web version to test now!");
      }
    } catch (e) {
      console.error("Google Login Error:", e.code, e.message);
      if (e.code === 'auth/admin-restricted-operation') {
        alert("Google Login is not enabled in your Firebase Console yet!");
      } else if (e.code === 'auth/operation-not-allowed') {
        alert("This auth method is disabled in Firebase Console.");
      } else {
        alert("Login failed: " + e.message);
      }
    }
  };

  const handleGuestLogin = async () => {
    const authInstance = getAuth(app);
    try {
      await signInAnonymously(authInstance);
    } catch (e) {
      console.error("Guest Login Error:", e.message);
      alert("Anonymous login is disabled in Firebase console.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.branding}>
           <Ionicons name="heart" size={80} color={COLORS.primary} />
           <Text style={styles.title}>Lovers</Text>
           <Text style={styles.subtitle}>Connect deeply, anywhere.</Text>
        </View>

        <View style={styles.form}>
           <TouchableOpacity 
             style={[styles.loginBtn, { backgroundColor: COLORS.google }]} 
             onPress={handleGoogleLogin}
           >
             <Ionicons name="logo-google" size={20} color="#FFF" style={{ marginRight: 10 }} />
             <Text style={styles.btnText}>Sign in with Google</Text>
           </TouchableOpacity>

           <TouchableOpacity 
             style={[styles.loginBtn, styles.guestBtn]} 
             onPress={handleGuestLogin}
           >
             <Text style={[styles.btnText, { color: COLORS.text }]}>Try as Guest</Text>
           </TouchableOpacity>
        </View>

        <Text style={styles.footer}>By signing in, you agree to our Terms.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: 30, justifyContent: 'space-around', alignItems: 'center' },
  branding: { alignItems: 'center' },
  title: { fontSize: 48, fontWeight: 'bold', color: COLORS.text, marginTop: 10 },
  subtitle: { color: COLORS.textSec, fontSize: 16, marginTop: 8 },
  form: { width: '100%', maxWidth: 400 },
  loginBtn: { 
    height: 56, 
    borderRadius: 28, 
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5
  },
  guestBtn: { 
    backgroundColor: 'transparent', 
    borderWidth: 1.5, 
    borderColor: '#333' 
  },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  footer: { color: '#555', fontSize: 12, textAlign: 'center' }
});

export default LoginScreen;
