import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import AuthScreen from './src/screens/AuthScreen';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

function RootNavigator() {
  const { currentUser } = useAuth();
  
  // If user is logged in, show the main app, else show the auth screen
  return currentUser ? <AppNavigator /> : <AuthScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </AuthProvider>
  );
}
