import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,           // Hide the tab header (Drawer handles this)
                tabBarActiveTintColor: '#6389DA', // Your signature blue color
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    height: 60,                // Give it some height
                    paddingBottom: 10,
                },
            }}
        >
            {/* LEFT TAB: Schedule */}
            <Tabs.Screen
                name="index" // This points to app/(jurutera)/(tabs)/index.js
                options={{
                    title: 'Schedule',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="calendar" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="engineer" // This points to app/(jurutera)/(tabs)/index.js
                options={{
                    title: 'Engineer',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />

            {/* RIGHT TAB: Tasks */}
            <Tabs.Screen
                name="service-level" // This points to app/(jurutera)/(tabs)/tasks.js
                options={{
                    title: 'Service Level',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="swap-vertical-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}