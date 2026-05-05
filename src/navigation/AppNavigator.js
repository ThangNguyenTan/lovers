import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import PairingScreen from '../screens/PairingScreen';
import MainDashboard from '../screens/MainDashboard';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { currentUser, coupleId, isLoading } = useAuth();

  // Show a splash screen or spinner while checking Firebase Auth and Firestore states
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF4B72" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* State 1: User is not logged in */}
        {!currentUser ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : 
        /* State 2: User is logged in, but not matched into a Couple ID */
        !coupleId ? (
          <Stack.Screen name="Pairing" component={PairingScreen} />
        ) : 
        /* State 3: User is logged in AND matched */
        (
          <Stack.Screen name="Dashboard" component={MainDashboard} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
