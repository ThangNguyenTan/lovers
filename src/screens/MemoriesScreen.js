import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal } from 'react-native';
import { ref, push, onValue } from 'firebase/database';
import { database } from '../config/firebase';

export default function MemoriesScreen() {
  const [memories, setMemories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const memoriesRef = ref(database, 'couple_data/memories');

  useEffect(() => {
    const unsubscribe = onValue(memoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const memList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        memList.sort((a, b) => b.timestamp - a.timestamp);
        setMemories(memList);
      }
    });

    return () => unsubscribe();
  }, []);

  const addMemory = async () => {
    if (!newTitle.trim()) return;
    
    await push(memoriesRef, {
      title: newTitle,
      description: newDesc,
      timestamp: Date.now()
    });

    setNewTitle('');
    setNewDesc('');
    setModalVisible(false);
  };

  const renderMemory = ({ item }) => {
    const date = new Date(item.timestamp).toLocaleDateString();
    return (
      <View style={styles.memoryCard}>
        <Text style={styles.memoryTitle}>{item.title}</Text>
        <Text style={styles.memoryDate}>{date}</Text>
        {item.description ? <Text style={styles.memoryDesc}>{item.description}</Text> : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={memories}
        keyExtractor={item => item.id}
        renderItem={renderMemory}
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <Text style={styles.modalHeader}>New Memory</Text>
          <TextInput
            style={styles.input}
            placeholder="Title (e.g. Our first trip!)"
            value={newTitle}
            onChangeText={setNewTitle}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description..."
            value={newDesc}
            onChangeText={setNewDesc}
            multiline
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.saveButton} onPress={addMemory}>
              <Text style={styles.buttonText}>Save Memory</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffcfc',
  },
  list: {
    padding: 20,
  },
  memoryCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#ff4d6d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  memoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  memoryDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  memoryDesc: {
    fontSize: 16,
    color: '#666',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff4d6d',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff4d6d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 30,
    color: '#fff',
    lineHeight: 32,
  },
  modalContainer: {
    flex: 1,
    padding: 30,
    backgroundColor: '#fff',
  },
  modalHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff4d6d',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'column',
    gap: 10,
  },
  saveButton: {
    backgroundColor: '#ff4d6d',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#999',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
