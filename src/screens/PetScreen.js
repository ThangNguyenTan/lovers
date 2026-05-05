import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { updatePetState } from '../services/CoupleDataService';
import { serverTimestamp } from 'firebase/firestore';

const { width } = Dimensions.get('window');

const COLORS = {
  background: '#121212',
  surface: '#1E1E1E',
  primary: '#FF4B72',
  text: '#FFFFFF',
  textSec: '#A0A0A0',
  success: '#4CAF50'
};

const PetStatus = ({ label, value, icon, color }) => (
  <View style={styles.statusItem}>
    <View style={styles.statusHeader}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={styles.statusValue}>{value}%</Text>
    </View>
    <View style={styles.progressBarBg}>
      <View style={[styles.progressBarFill, { width: `${value}%`, backgroundColor: color }]} />
    </View>
  </View>
);

export default function PetScreen() {
  const { coupleId, coupleData } = useAuth();
  const pet = coupleData?.virtualPet || { name: 'Mochi', hungerLevel: 50, happinessLevel: 50 };
  const anniversaries = coupleData?.anniversaries || [];

  const handleFeed = async () => {
    const newHunger = Math.min(100, pet.hungerLevel + 20);
    await updatePetState(coupleId, {
      ...pet,
      hungerLevel: newHunger,
      lastFed: serverTimestamp()
    });
  };

  const handlePet = async () => {
    const newHappy = Math.min(100, pet.happinessLevel + 10);
    await updatePetState(coupleId, {
      ...pet,
      happinessLevel: newHappy
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Little One</Text>
      </View>

      <View style={styles.petCard}>
         <View style={styles.petImageContainer}>
            <Ionicons name="paw" size={80} color={COLORS.primary} />
            <Text style={styles.petName}>{pet.name}</Text>
         </View>

         <View style={styles.statusContainer}>
            <PetStatus label="Hunger" value={pet.hungerLevel} icon="restaurant" color="#FFA000" />
            <PetStatus label="Happiness" value={pet.happinessLevel} icon="heart" color={COLORS.primary} />
         </View>

         <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleFeed}>
               <Ionicons name="pizza" size={24} color="#FFF" />
               <Text style={styles.actionBtnText}>Feed</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#4C8BF5' }]} onPress={handlePet}>
               <Ionicons name="hand-right" size={24} color="#FFF" />
               <Text style={styles.actionBtnText}>Pet</Text>
            </TouchableOpacity>
         </View>
      </View>

      <View style={styles.sectionHeader}>
         <Text style={styles.sectionTitle}>Anniversaries</Text>
         <TouchableOpacity>
            <Ionicons name="add-circle" size={24} color={COLORS.primary} />
         </TouchableOpacity>
      </View>

      {anniversaries.length > 0 ? (
        anniversaries.map((ann, index) => (
          <View key={index} style={styles.anniversaryCard}>
             <View style={styles.annIcon}>
                <Ionicons name="calendar" size={24} color={COLORS.primary} />
             </View>
             <View style={styles.annInfo}>
                <Text style={styles.annTitle}>{ann.title}</Text>
                <Text style={styles.annDate}>{ann.date}</Text>
             </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyAnn}>
           <Text style={styles.emptyText}>Add your first shared milestone!</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingTop: 60 },
  header: { marginBottom: 24 },
  headerTitle: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  petCard: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 24, alignItems: 'center' },
  petImageContainer: { alignItems: 'center', marginBottom: 24 },
  petName: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginTop: 12 },
  statusContainer: { width: '100%', marginBottom: 24 },
  statusItem: { marginBottom: 16 },
  statusHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  statusLabel: { color: COLORS.textSec, marginLeft: 8, flex: 1 },
  statusValue: { color: '#FFF', fontWeight: 'bold' },
  progressBarBg: { height: 8, backgroundColor: '#333', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  actionRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  actionBtn: { 
    flex: 0.48, 
    flexDirection: 'row', 
    backgroundColor: COLORS.success, 
    padding: 12, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  actionBtnText: { color: '#FFF', fontWeight: 'bold', marginLeft: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, marginBottom: 16 },
  sectionTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  anniversaryCard: { 
    backgroundColor: COLORS.surface, 
    padding: 16, 
    borderRadius: 16, 
    flexDirection: 'row', 
    alignItems: 'center',
    marginBottom: 12
  },
  annIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#2A2A2A', justifyContent: 'center', alignItems: 'center' },
  annInfo: { marginLeft: 16 },
  annTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  annDate: { color: COLORS.textSec, fontSize: 13, marginTop: 2 },
  emptyAnn: { padding: 20, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: COLORS.border, borderRadius: 16 },
  emptyText: { color: COLORS.textSec }
});
