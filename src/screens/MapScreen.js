import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Dimensions, Image } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
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

const mapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#212121" }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#212121" }]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{ "color": "#181818" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#2c2c2c" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#000000" }]
  }
];

export default function MapScreen() {
  const { currentUser, coupleId, coupleData } = useAuth();
  const [myLocation, setMyLocation] = useState(null);
  const [locations, setLocations] = useState({});
  const mapRef = useRef(null);

  const partnerId = coupleData ? Object.keys(coupleData.users).find(id => id !== currentUser.uid) : null;
  const partnerInfo = partnerId ? coupleData.users[partnerId] : null;

  useEffect(() => {
    let locationSubscription = null;

    const setupLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 10,
        },
        async (location) => {
          const { latitude, longitude } = location.coords;
          setMyLocation({ latitude, longitude });

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

  const partnerLoc = partnerId ? locations[partnerId] : null;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={mapStyle}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {myLocation && (
          <Marker
            coordinate={myLocation}
            title="Me"
            pinColor={COLORS.primary}
          />
        )}

        {partnerLoc && (
          <Marker
            coordinate={{ latitude: partnerLoc.lat, longitude: partnerLoc.lng }}
            title={partnerInfo?.name || "Partner"}
          >
            <View style={styles.markerContainer}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {(partnerInfo?.name || "P").charAt(0)}
                </Text>
              </View>
              <View style={styles.batteryBadge}>
                <Text style={styles.batteryText}>{partnerLoc.batteryLevel}%</Text>
              </View>
            </View>
          </Marker>
        )}
      </MapView>
      
      <View style={styles.overlay}>
        <View style={styles.statusCard}>
           <Text style={styles.statusTitle}>
             {partnerInfo?.name || "Partner"} is {partnerLoc?.status || 'Active'}
           </Text>
           {partnerLoc && (
             <Text style={styles.statusDetail}>
               Battery: {partnerLoc.batteryLevel}% {partnerLoc.isCharging ? '⚡' : ''}
             </Text>
           )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  markerContainer: { alignItems: 'center', justifyContent: 'center' },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.primary, borderWidth: 2, borderColor: '#FFF',
    alignItems: 'center', justifyContent: 'center'
  },
  avatarText: { color: '#FFF', fontWeight: 'bold' },
  batteryBadge: {
    position: 'absolute', top: -10, right: -10,
    backgroundColor: '#4CAF50', paddingHorizontal: 4, borderRadius: 6
  },
  batteryText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  overlay: { position: 'absolute', bottom: 20, left: 20, right: 20 },
  statusCard: {
    backgroundColor: COLORS.surface, padding: 16, borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5
  },
  statusTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  statusDetail: { color: COLORS.textSec, fontSize: 12, marginTop: 4 }
});
