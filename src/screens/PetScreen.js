import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ProgressBarAndroid, ProgressViewIOS, Platform } from 'react-native';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../config/firebase';
import * as Haptics from 'expo-haptics';

export default function PetScreen() {
  const [petData, setPetData] = useState({ state: 'normal', hunger: 50, happiness: 50 });
  const petRef = ref(database, 'couple_data/pet');

  useEffect(() => {
    const unsubscribe = onValue(petRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPetData(data);
      }
    });

    return () => unsubscribe();
  }, []);

  const updatePet = (hungerDelta, happinessDelta) => {
    let newHunger = Math.min(100, Math.max(0, petData.hunger + hungerDelta));
    let newHappy = Math.min(100, Math.max(0, petData.happiness + happinessDelta));
    
    let newState = 'normal';
    if (newHunger < 30) newState = 'hungry';
    if (newHappy > 80 && newHunger > 50) newState = 'happy';
    if (newHappy < 30) newState = 'sad';

    set(petRef, {
      ...petData,
      hunger: newHunger,
      happiness: newHappy,
      state: newState,
      lastUpdate: Date.now()
    });
  };

  const feedPet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updatePet(20, 5);
  };

  const playPet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updatePet(-10, 20); // Playing makes them hungry but happier
  };

  const getPetEmoji = () => {
    switch(petData.state) {
      case 'happy': return '🐶✨';
      case 'sad': return '🙍‍♂️🐶';
      case 'hungry': return '🐶🍖';
      default: return '🐶';
    }
  };

  const ProgressBar = ({ label, value, color }) => (
    <View style={styles.progressContainer}>
      <Text style={styles.progressLabel}>{label}</Text>
      {Platform.OS === 'ios' ? (
        <ProgressViewIOS style={styles.bar} progress={value / 100} progressTintColor={color} trackTintColor="#eee" />
      ) : (
        <ProgressBarAndroid style={styles.bar} styleAttr="Horizontal" indeterminate={false} progress={value / 100} color={color} />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.petEmoji}>{getPetEmoji()}</Text>
      <Text style={styles.petStatus}>Your pet is {petData.state}!</Text>

      <View style={styles.statsCard}>
        <ProgressBar label="Hunger" value={petData.hunger} color="#ffb703" />
        <ProgressBar label="Happiness" value={petData.happiness} color="#ff4d6d" />
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.button, {backgroundColor: '#ffb703'}]} onPress={feedPet}>
          <Text style={styles.buttonText}>Feed 🍖</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, {backgroundColor: '#ff4d6d'}]} onPress={playPet}>
          <Text style={styles.buttonText}>Play 🎾</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fffcfc',
  },
  petEmoji: {
    fontSize: 120,
    marginBottom: 20,
  },
  petStatus: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
    textTransform: 'capitalize',
  },
  statsCard: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 40,
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
    fontWeight: '600',
  },
  bar: {
    transform: [{ scaleY: 2 }],
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
