import Ionicons from '@expo/vector-icons/build/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme } from '../../hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#6389DA', // The blue from your login button
      tabBarInactiveTintColor: '#BDBDBD',
      tabBarStyle: { height: 70, paddingBottom: 10 },
      headerShown: false,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "calendar" : "calendar-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Task',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "list" : "list-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}