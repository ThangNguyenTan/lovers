import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../contexts/AuthContext';
import { sendMessage, subscribeToMessages } from '../services/CoupleDataService';

const { width, height } = Dimensions.get('window');

const COLORS = {
  background: '#121212',
  surface: '#1E1E1E',
  primary: '#FF4B72',
  text: '#FFFFFF',
  textSec: '#A0A0A0',
  bubbleMe: '#FF4B72',
  bubbleOther: '#2A2A2A',
};

const HeartEffect = ({ active, onComplete }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start(() => onComplete());
    }
  }, [active]);

  if (!active) return null;

  return (
    <Animated.View style={[styles.effectContainer, { opacity: anim }]}>
       <Ionicons name="heart" size={120} color={COLORS.primary} />
       <Text style={styles.effectText}>I Miss You!</Text>
    </Animated.View>
  );
};

export default function ChatScreen() {
  const { currentUser, coupleId } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isEffectActive, setIsEffectActive] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (coupleId) {
      const unsubscribe = subscribeToMessages(coupleId, (newMessages) => {
        setMessages(newMessages);
        
        // Listen for new "miss_you_ping" from partner
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.senderId !== currentUser.uid && lastMsg.effectTrigger === 'miss_you_ping') {
           triggerLocalEffect();
        }
      });
      return unsubscribe;
    }
  }, [coupleId]);

  const triggerLocalEffect = () => {
    setIsEffectActive(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSend = async () => {
    if (inputText.trim() === '') return;
    const text = inputText;
    setInputText('');
    await sendMessage(coupleId, currentUser.uid, text);
  };

  const handleMissYou = async () => {
    await sendMessage(coupleId, currentUser.uid, "💖 Sent a Miss You ping!", 'miss_you_ping');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const renderMessage = ({ item }) => {
    const isMe = item.senderId === currentUser.uid;
    return (
      <View style={[styles.messageWrapper, isMe ? styles.alignRight : styles.alignLeft]}>
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <HeartEffect active={isEffectActive} onComplete={() => setIsEffectActive(false)} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Private Chat</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <View style={styles.inputArea}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleMissYou}>
             <Ionicons name="heart" size={28} color={COLORS.primary} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            placeholder="Type a sweet message..."
            placeholderTextColor={COLORS.textSec}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
             <Ionicons name="send" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    height: 90, 
    justifyContent: 'flex-end', 
    alignItems: 'center', 
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222'
  },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  listContent: { padding: 16, paddingBottom: 32 },
  messageWrapper: { marginBottom: 12, maxWidth: '80%' },
  alignRight: { alignSelf: 'flex-end' },
  alignLeft: { alignSelf: 'flex-start' },
  bubble: { padding: 12, borderRadius: 20 },
  bubbleMe: { backgroundColor: COLORS.bubbleMe, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: COLORS.bubbleOther, borderBottomLeftRadius: 4 },
  messageText: { color: '#FFF', fontSize: 16 },
  inputArea: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    backgroundColor: COLORS.surface,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12
  },
  input: { 
    flex: 1, 
    backgroundColor: '#2A2A2A', 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    color: '#FFF',
    maxHeight: 100,
    marginHorizontal: 8
  },
  actionBtn: { padding: 4 },
  sendBtn: { 
    backgroundColor: COLORS.primary, 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  effectContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  effectText: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 20,
  }
});
