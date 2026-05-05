import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToStories, addStory } from '../services/CoupleDataService';

const COLORS = {
  background: '#121212',
  surface: '#1E1E1E',
  primary: '#FF4B72',
  text: '#FFFFFF',
  textSec: '#A0A0A0',
  border: '#333333'
};

export default function MemoriesScreen() {
  const { coupleId } = useAuth();
  const [stories, setStories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    if (coupleId) {
      const unsubscribe = subscribeToStories(coupleId, (data) => {
        setStories(data);
      });
      return unsubscribe;
    }
  }, [coupleId]);

  const handleCreate = async () => {
    if (newTitle.trim() === '') return;
    await addStory(coupleId, newTitle, newDesc);
    setIsModalVisible(false);
    setNewTitle('');
    setNewDesc('');
  };

  const renderStory = ({ item }) => (
    <View style={styles.storyCard}>
       <View style={styles.cardHeader}>
          <Text style={styles.storyTitle}>{item.title}</Text>
          <Text style={styles.storyDate}>
            {item.dateOccurred?.toDate ? item.dateOccurred.toDate().toLocaleDateString() : 'Just now'}
          </Text>
       </View>
       {item.imageUrls && item.imageUrls.length > 0 ? (
         <Image source={{ uri: item.imageUrls[0] }} style={styles.storyImage} />
       ) : (
         <View style={styles.placeholderImg}>
            <Ionicons name="images" size={40} color={COLORS.border} />
         </View>
       )}
       <Text style={styles.storyDesc}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Memories</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setIsModalVisible(true)}>
           <Ionicons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={stories}
        keyExtractor={(item) => item.id}
        renderItem={renderStory}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="camera" size={60} color={COLORS.border} />
            <Text style={styles.emptyText}>No memories yet. Create your first one!</Text>
          </View>
        }
      />

      <Modal visible={isModalVisible} animationType="slide" transparent>
         <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
               <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>New Memory</Text>
                  <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                     <Ionicons name="close" size={24} color="#FFF" />
                  </TouchableOpacity>
               </View>
               
               <ScrollView>
                  <Text style={styles.label}>Title</Text>
                  <TextInput 
                    style={styles.input}
                    placeholder="E.g. First Date at the Park"
                    placeholderTextColor={COLORS.textSec}
                    value={newTitle}
                    onChangeText={setNewTitle}
                  />

                  <Text style={styles.label}>Description</Text>
                  <TextInput 
                    style={[styles.input, styles.textArea]}
                    placeholder="Tell the story..."
                    placeholderTextColor={COLORS.textSec}
                    value={newDesc}
                    onChangeText={setNewDesc}
                    multiline
                  />

                  <TouchableOpacity style={styles.saveBtn} onPress={handleCreate}>
                     <Text style={styles.saveBtnText}>Save Memory</Text>
                  </TouchableOpacity>
               </ScrollView>
            </View>
         </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    height: 100, 
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'flex-end', 
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: COLORS.surface
  },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  addBtn: { backgroundColor: COLORS.primary, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 20 },
  storyCard: { backgroundColor: COLORS.surface, borderRadius: 16, marginBottom: 20, overflow: 'hidden' },
  cardHeader: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storyTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  storyDate: { color: COLORS.textSec, fontSize: 12 },
  storyImage: { width: '100%', height: 200, backgroundColor: '#333' },
  placeholderImg: { width: '100%', height: 200, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' },
  storyDesc: { padding: 16, color: COLORS.textSec, lineHeight: 20 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: COLORS.textSec, marginTop: 16, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, height: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  label: { color: COLORS.textSec, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#2A2A2A', borderRadius: 12, padding: 12, color: '#FFF' },
  textArea: { height: 120, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 32 },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});
