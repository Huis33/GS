import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useNavigation, router } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { useUser } from '../../src/context/UserContext';
import CustomDrawerContent, { DRAWER_SCREEN_OPTIONS } from '../../components/CustomDrawerContent';

export default function OMDrawerLayout() {
    const { userData } = useUser();

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer
                drawerContent={(props) => <CustomDrawerContent {...props} />}
                screenOptions={({ navigation }) => ({
                    ...DRAWER_SCREEN_OPTIONS,
                    headerShown: true,
                    headerTitleAlign: 'center',
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: '#FFFFFF' },
                    headerLeft: () => (
                        <TouchableOpacity
                            style={{ marginLeft: 20 }}
                            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                        >
                            <Ionicons name="menu-outline" size={30} color="black" />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity
                            style={{ marginRight: 20 }}
                            onPress={() => router.push('/analytics')}
                        >
                            <Ionicons name="stats-chart-outline" size={24} color="black" />
                        </TouchableOpacity>
                    ),
                    headerTitle: () => (
                        <Text style={styles.headerWelcome}>
                            Welcome, {userData?.name || 'User'}
                        </Text>
                    ),
                })}
            >
                <Drawer.Screen
                    name="(tabs)"
                    options={{
                        drawerLabel: 'Home',
                        drawerIcon: ({ color, size }) => <Ionicons name="home-sharp" color={color} size={size} />,
                    }}
                />
                <Drawer.Screen
                    name="read-only-Profile"
                    options={{
                        drawerLabel: 'Profile',
                        drawerIcon: ({ color, size }) => <Ionicons name="person-circle-outline" color={color} size={size} />,
                    }}
                />
                <Drawer.Screen
                    name="task"
                    options={{
                        drawerLabel: 'All Tasks',
                        drawerIcon: ({ color, size }) => <Ionicons name="list" color={color} size={size} />,
                    }}
                />
                <Drawer.Screen
                    name="profile"
                    options={{
                        drawerLabel: 'Edit Profile',
                        headerTitle: 'User Profile',
                        drawerIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />,
                    }}
                />
                <Drawer.Screen
                    name="analytics"
                    options={{ headerShown: false, drawerItemStyle: { display: 'none' } }}
                />
            </Drawer>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    headerWelcome: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    },
});
