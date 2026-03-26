import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { auth } from '../../firebaseConfig'; // Ensure this path is correct
import { signOut } from 'firebase/auth';
import { router } from 'expo-router';

// Custom Sidebar Component
function CustomDrawerContent(props) {
    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to log out?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // 1. Sign out from Firebase
                            await signOut(auth);

                            // 2. Clear navigation and go to app/index.tsx
                            router.replace('/');
                        } catch (error) {
                            console.error("Logout Error:", error);
                            Alert.alert("Error", "Failed to log out. Please try again.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
            {/* Sidebar Header */}
            <View style={styles.drawerHeader}>
                <Ionicons name="person-circle" size={60} color="#6389DA" />
                <Text style={styles.userName}>Alice Tan</Text>
                <Text style={styles.userRole}>Jurutera</Text>
            </View>

            {/* Navigation Links (Home & Profile) */}
            <View style={{ flex: 1 }}>
                <DrawerItemList {...props} />
            </View>

            {/* Logout Button at Bottom */}
            <View style={styles.logoutSection}>
                <DrawerItem
                    label="Log Out"
                    onPress={handleLogout}
                    icon={({ color, size }) => (
                        <Ionicons name="log-out-outline" color="#FF4444" size={size} />
                    )}
                    labelStyle={{ color: '#FF4444', fontWeight: 'bold' }}
                />
            </View>
        </DrawerContentScrollView>
    );
}

export default function JuruteraDrawerLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer
                drawerContent={(props) => <CustomDrawerContent {...props} />}
                screenOptions={{
                    headerShown: true,
                    headerTintColor: '#000',
                    drawerActiveTintColor: '#6389DA',
                }}
            >
                {/* Points to app/(jurutera)/(tabs)/index.js */}
                <Drawer.Screen
                    name="(tabs)"
                    options={{
                        drawerLabel: 'Edit Profile',
                        title: 'Schedule',
                        drawerIcon: ({ color, size }) => (
                            <Ionicons name="brush" color={color} size={size} />
                        )
                    }}
                />

                {/* Points to app/(jurutera)/profile.js */}
                <Drawer.Screen
                    name="profile"
                    options={{
                        drawerLabel: 'Profile',
                        title: 'User Profile',
                        drawerIcon: ({ color, size }) => (
                            <Ionicons name="person-outline" color={color} size={size} />
                        )
                    }}
                />
            </Drawer>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    drawerHeader: {
        padding: 20,
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        marginBottom: 10,
    },
    userName: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
    userRole: { fontSize: 14, color: '#666' },
    logoutSection: {
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        marginBottom: 20,
    }
});