import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTabBarStyle } from '../../../hooks/useTabBarStyle';

export default function TabLayout() {
    const tabBarStyle = useTabBarStyle();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#6389DA',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Schedule',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="calendar" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="engineer"
                options={{
                    title: 'Engineer',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="service-level"
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
