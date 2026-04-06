import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { ref, push, onValue, serverTimestamp } from 'firebase/database';
import { database } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import * as Haptics from 'expo-haptics';

export default function ChatScreen() {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [showMissYou, setShowMissYou] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Assuming a static shared "couple_chat" node for now
  const chatRef = ref(database, 'couple_chat/messages');

  useEffect(() => {
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        // Sort messages
        messageList.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(messageList.reverse());
      }
    });
    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (inputText.trim() === '') return;
    
    await push(chatRef, {
      text: inputText,
      senderId: currentUser?.uid || 'unknown',
      timestamp: serverTimestamp()
    });
    
    setInputText('');
  };

  const triggerMissYou = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowMissYou(true);
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start(() => setShowMissYou(false));

    // Send a system message
    push(chatRef, {
      text: "💖 I Miss You!",
      senderId: currentUser?.uid || 'unknown',
      isSystem: true,
      timestamp: serverTimestamp()
    });
  };

  const renderItem = ({ item }) => {
    const isMe = item.senderId === currentUser?.uid;
    if (item.isSystem) {
      return <Text style={styles.systemMessage}>{item.text}</Text>;
    }

    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
        <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      {showMissYou && (
        <Animated.View style={[styles.missYouOverlay, { opacity: fadeAnim }]}>
          <Text style={styles.missYouText}>💖 I MISS YOU 💖</Text>
        </Animated.View>
      )}

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        inverted // Flips the list so new messages are at the bottom visually
        contentContainerStyle={styles.listContent}
      />
      
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.missYouButton} onPress={triggerMissYou}>
          <Text style={styles.missYouButtonText}>💖</Text>
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor="#999"
        />
        
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffcfc',
  },
  listContent: {
    padding: 15,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#ff4d6d',
    borderBottomRightRadius: 5,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#eee',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: '#fff',
  },
  theirMessageText: {
    color: '#333',
  },
  systemMessage: {
    alignSelf: 'center',
    color: '#ff4d6d',
    fontWeight: 'bold',
    marginVertical: 10,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  missYouButton: {
    padding: 10,
    marginRight: 5,
    backgroundColor: '#ffe5ec',
    borderRadius: 20,
  },
  missYouButtonText: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#ff4d6d',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  missYouOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 77, 109, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
  },
  missYouText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  }
});
