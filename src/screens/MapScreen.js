import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Battery from 'expo-battery';
import { useAuth } from '../contexts/AuthContext';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../config/firebase';

export default function MapScreen() {
  const { currentUser } = useAuth();
  const [location, setLocation] = useState(null);
  const [batteryLevel, setBatteryLevel] = useState(null);
  const [partnerLocation, setPartnerLocation] = useState(null);
  const [partnerBattery, setPartnerBattery] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      // Initial Battery
      const battery = await Battery.getBatteryLevelAsync();
      setBatteryLevel(Math.round(battery * 100));

      // Watch Location and Battery
      Location.watchPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
        distanceInterval: 10,
      }, (loc) => {
        setLocation(loc.coords);
        if (currentUser) {
          // Update DB with our location
          set(ref(database, `users/${currentUser.uid}/status`), {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            battery: batteryLevel,
            timestamp: Date.now()
          });
        }
      });
    })();

    // Listen to Partner (assuming hardcoded partnerId or logic to find partner)
    // For demo, we just listen to a "partner" node or skip if no pairing logic exists
    // Implementation of pairing is needed for a real app.
  }, [currentUser, batteryLevel]);

  return (
    <View style={styles.container}>
      {location ? (
        <MapView 
          style={styles.map} 
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker 
            coordinate={location} 
            title="You" 
            description={`Battery: ${batteryLevel}%`} 
            pinColor="#ff4d6d"
          />
          {partnerLocation && (
            <Marker 
              coordinate={partnerLocation} 
              title="Partner" 
              description={`Battery: ${partnerBattery}%`}
              pinColor="#4d90ff"
            />
          )}
        </MapView>
      ) : (
        <Text>Getting Location...</Text>
      )}
      
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>Your Battery: {batteryLevel !== null ? `${batteryLevel}%` : '...'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  overlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 8,
  },
  overlayText: {
    fontWeight: 'bold',
    color: '#ff4d6d',
  }
});
