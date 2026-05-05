import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import our tabs
import MapScreen from './MapScreen';
import ChatScreen from './ChatScreen';
import MemoriesScreen from './MemoriesScreen';
import PetScreen from './PetScreen';

const Tab = createBottomTabNavigator();

// Sleek dark-mode palette for our Tabs
const COLORS = {
  background: '#121212',
  surface: '#1E1E1E',
  primary: '#FF4B72',
  inactive: '#777777',
  border: '#333333'
};

const MainDashboard = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600'
        }
      }}
    >
      <Tab.Screen 
        name="Map" 
        component={MapScreen} 
        options={{ 
          // Note: In a real app we'd use Ionicons/MaterialIcons here
          tabBarLabel: 'Map' 
        }} 
      />
      
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={{ 
          tabBarLabel: 'Chat'
        }} 
      />

      <Tab.Screen 
        name="Memories" 
        component={MemoriesScreen} 
        options={{ 
          tabBarLabel: 'Memories'
        }} 
      />

      <Tab.Screen 
        name="Pet" 
        component={PetScreen} 
        options={{ 
          tabBarLabel: 'Pet'
        }} 
      />
    </Tab.Navigator>
  );
};

export default MainDashboard;
