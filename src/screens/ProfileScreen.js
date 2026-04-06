import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function ProfileScreen() {
  const { currentUser } = useAuth();
  const [anniversaryDate, setAnniversaryDate] = useState('');
  const [daysTogether, setDaysTogether] = useState(0);

  const anniversaryRef = ref(database, 'couple_data/anniversary');

  useEffect(() => {
    const unsubscribe = onValue(anniversaryRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.date) {
        setAnniversaryDate(data.date);
        calculateDays(data.date);
      }
    });

    return () => unsubscribe();
  }, []);

  const calculateDays = (dateString) => {
    const start = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDaysTogether(diffDays);
  };

  const saveAnniversary = () => {
    // Basic validation YYYY-MM-DD
    if (anniversaryDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      set(anniversaryRef, { date: anniversaryDate });
      calculateDays(anniversaryDate);
    } else {
      alert("Please format the date as YYYY-MM-DD");
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Our Journey 💖</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.daysNumber}>{daysTogether}</Text>
        <Text style={styles.daysText}>Days Together</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Set Anniversary Date (YYYY-MM-DD)</Text>
        <TextInput 
          style={styles.input}
          value={anniversaryDate}
          onChangeText={setAnniversaryDate}
          placeholder="e.g. 2023-02-14"
        />
        <TouchableOpacity style={styles.saveBtn} onPress={saveAnniversary}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffcfc',
    padding: 20,
    alignItems: 'center',
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff4d6d',
  },
  card: {
    backgroundColor: '#ff4d6d',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#ff4d6d',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    marginBottom: 40,
  },
  daysNumber: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#fff',
  },
  daysText: {
    fontSize: 20,
    color: '#ffe5ec',
    marginTop: 10,
    fontWeight: '600',
  },
  section: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 40,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  saveBtn: {
    backgroundColor: '#ff4d6d',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutBtn: {
    padding: 15,
  },
  logoutText: {
    color: '#999',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
