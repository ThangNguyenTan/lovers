import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import * as Location from 'expo-location';
import * as Battery from 'expo-battery';
import { useAuth } from '../contexts/AuthContext';
import { updateRealtimeLocation, subscribeToLocations } from '../services/CoupleDataService';

const COLORS = {
  background: '#121212',
  primary: '#FF4B72',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textSec: '#A0A0A0'
};

export default function MapScreen() {
  const { currentUser, coupleId } = useAuth();
  const [locations, setLocations] = useState({});

  useEffect(() => {
    let locationSubscription = null;

    const setupLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 10,
        },
        async (location) => {
          const { latitude, longitude } = location.coords;
          try {
            const batteryLevel = await Battery.getBatteryLevelAsync();
            const batteryState = await Battery.getBatteryStateAsync();
            const isCharging = batteryState === Battery.BatteryState.CHARGING || batteryState === Battery.BatteryState.FULL;

            if (coupleId && currentUser) {
              updateRealtimeLocation(
                coupleId,
                currentUser.uid,
                latitude,
                longitude,
                Math.round(batteryLevel * 100),
                isCharging
              );
            }
          } catch (e) {}
        }
      );
    };

    setupLocation();

    let unsubscribeLocations = null;
    if (coupleId) {
      unsubscribeLocations = subscribeToLocations(coupleId, (data) => {
        setLocations(data);
      });
    }

    return () => {
      if (locationSubscription) locationSubscription.remove();
      if (unsubscribeLocations) unsubscribeLocations();
    };
  }, [coupleId]);

  return (
    <View style={styles.container}>
       <Text style={{ fontSize: 60 }}>📍</Text>
       <Text style={{ color: '#FFF', marginTop: 20, fontSize: 18 }}>Maps are available on the app!</Text>
       <Text style={{ color: COLORS.textSec, marginTop: 10 }}>Live location tracking is active.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
