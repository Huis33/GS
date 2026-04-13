import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { DrawerActions } from '@react-navigation/native';
import { router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useUser } from '../../src/context/UserContext';

function CustomDrawerContent(props) {
    const { userData } = useUser();

    const handleLogout = () => {
        props.navigation.closeDrawer();
        router.push('/logout-confirm');
    };

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
            {/* 1. Profile Header Section */}
            <View style={styles.drawerHeader}>
                <Ionicons name="person-circle" size={60} color="#6389DA" />
                <Text style={styles.userName}>{userData?.name || 'User'}</Text>
                <Text style={styles.userRole}>{userData?.role || 'Service Coordinator'}</Text>
            </View>

            {/* 2. Main Navigation Items (Filtered via Screen Options instead of JS logic) */}
            <View style={{ flex: 1 }}>
                <DrawerItemList {...props} />
            </View>

            {/* 3. Bottom Logout Section */}
            <View style={styles.logoutSection}>
                <DrawerItem
                    label="Log Out"
                    onPress={handleLogout}
                    icon={({ size }) => <Ionicons name="log-out-outline" color="#FF4444" size={size} />}
                    labelStyle={{ color: '#FF4444', fontWeight: 'bold' }}
                />
            </View>
        </DrawerContentScrollView>
    );
}

export default function PenyelarasDrawerLayout() {
    const { userData } = useUser();

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer
                drawerContent={(props) => <CustomDrawerContent {...props} />}
                screenOptions={({ navigation }) => ({
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
                    headerTitle: () => (
                        <Text style={styles.headerWelcome}>
                            Welcome, {userData?.name || 'User'}
                        </Text>
                    ),
                    drawerActiveTintColor: '#6389DA',
                })}
            >
                {/* HIDE THE TABS FROM DRAWER MENU */}
                <Drawer.Screen
                    name="(tabs)"
                    options={{
                        drawerItemStyle: { display: 'none' }, // This hides it from the sidebar list
                        //headerShown: false,                  // Keeps the tab navigator's own header (if any)
                    }}
                />

                {/* SHOW EDIT PROFILE */}
                <Drawer.Screen
                    name="profile"
                    options={({ navigation }) => ({
                        drawerLabel: 'Profile',
                        headerTitle: 'Profile',
                        drawerIcon: ({ color, size }) => <Ionicons name="brush" color={color} size={size} />,
                        headerLeft: () => (
                            <TouchableOpacity
                                style={{ marginLeft: 20 }}
                                onPress={() => router.replace('/(penyelaras)/(tabs)')}
                            >
                                <Ionicons name="arrow-back" size={28} color="black" />
                            </TouchableOpacity>
                        ),
                    })}
                />

            </Drawer>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    drawerHeader: {
        paddingVertical: 30,
        paddingHorizontal: 20,
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
    },
    headerWelcome: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    },
});