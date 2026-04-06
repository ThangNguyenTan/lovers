import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import Screens
import MapScreen from '../screens/MapScreen';
import ChatScreen from '../screens/ChatScreen';
import MemoriesScreen from '../screens/MemoriesScreen';
import PetScreen from '../screens/PetScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Map':
              iconName = focused ? 'location' : 'location-outline';
              break;
            case 'Chat':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Memories':
              iconName = focused ? 'book' : 'book-outline';
              break;
            case 'Pet':
              iconName = focused ? 'paw' : 'paw-outline';
              break;
            case 'Profile':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ff4d6d',
        tabBarInactiveTintColor: 'gray',
        headerShown: true, // We can hide it later per-screen if desired
      })}
    >
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Our World' }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ title: 'Messages' }} />
      <Tab.Screen name="Memories" component={MemoriesScreen} options={{ title: 'Memories' }} />
      <Tab.Screen name="Pet" component={PetScreen} options={{ title: 'Our Pet' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Together' }} />
    </Tab.Navigator>
  );
}
