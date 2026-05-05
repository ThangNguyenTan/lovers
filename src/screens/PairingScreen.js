import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { createPairingCode, pairUsers } from '../services/PairingService';

// Sleek, premium dark mode palette
const COLORS = {
  background: '#121212',
  surface: '#1E1E1E',
  primary: '#FF4B72', // Vibrant romantic pink
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  inputBg: '#2A2A2A',
  border: '#333333'
};

const PairingScreen = () => {
  const { currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('invite'); // 'invite' or 'enter'
  const [myCode, setMyCode] = useState(null);
  const [partnerCode, setPartnerCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateCode = async () => {
    setIsLoading(true);
    try {
      // For MVP, we send minimal user metadata. 
      const userInfo = { name: currentUser?.displayName || "Partner", email: currentUser?.email };
      const code = await createPairingCode(currentUser.uid, userInfo);
      setMyCode(code);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not generate code right now. Make sure you are online.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePair = async () => {
    if (partnerCode.length !== 6) {
      Alert.alert("Invalid Code", "Please enter the 6-character code your partner gave you.");
      return;
    }
    
    setIsLoading(true);
    try {
      const userInfo = { name: currentUser?.displayName || "Partner", email: currentUser?.email };
      // Attempt to run the highly secure pairing transaction
      await pairUsers(partnerCode, currentUser.uid, userInfo);
      
      // We don't need to navigate explicitly! 
      // AuthContext is actively listening to Firebase. Once this transaction succeeds,
      // the context will automatically detect the new `coupleId` and the root navigator will flip the screen.
    } catch (error) {
      Alert.alert("Pairing Failed", error.message || "Invalid or expired code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Find Your Person</Text>
        <Text style={styles.subtitle}>Link your accounts to start sharing</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'invite' && styles.activeTab]} 
          onPress={() => setActiveTab('invite')}
        >
          <Text style={[styles.tabText, activeTab === 'invite' && styles.activeTabText]}>Invite</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'enter' && styles.activeTab]} 
          onPress={() => setActiveTab('enter')}
        >
          <Text style={[styles.tabText, activeTab === 'enter' && styles.activeTabText]}>Enter Code</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'invite' ? (
          <View style={styles.card}>
            <Text style={styles.cardInstruction}>
              Share this code with your partner. It expires in 24 hours.
            </Text>
            
            {myCode ? (
              <View style={styles.codeContainer}>
                <Text style={styles.codeText}>{myCode}</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.primaryButton} 
                onPress={handleGenerateCode}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Generate Code</Text>}
              </TouchableOpacity>
            )}
            
            {myCode && (
              <Text style={styles.waitingText}>Waiting for partner to connect...</Text>
            )}
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardInstruction}>
              Enter the 6-character code from your partner's phone.
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="e.g. A9B2XF"
              placeholderTextColor={COLORS.textSecondary}
              value={partnerCode}
              onChangeText={setPartnerCode}
              autoCapitalize="characters"
              maxLength={6}
            />
            
            <TouchableOpacity 
              style={[styles.primaryButton, partnerCode.length !== 6 && styles.disabledButton]} 
              onPress={handlePair}
              disabled={isLoading || partnerCode.length !== 6}
            >
              {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Connect</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 32,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.border,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 15,
  },
  activeTabText: {
    color: COLORS.text,
  },
  content: {
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardInstruction: {
    color: COLORS.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  codeContainer: {
    backgroundColor: COLORS.inputBg,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 16,
  },
  codeText: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 4,
  },
  waitingText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 8,
    fontStyle: 'italic',
  },
  input: {
    width: '100%',
    backgroundColor: COLORS.inputBg,
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
    letterSpacing: 2,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default PairingScreen;
