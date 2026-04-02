import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useNavigation, router } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { useUser } from '../../src/context/UserContext';

function CustomDrawerContent(props) {
    const { userData } = useUser();

    const handleLogout = () => {
        props.navigation.closeDrawer();
        router.push('/logout-confirm');
    };

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
            <View style={styles.drawerHeader}>
                <Ionicons name="person-circle" size={60} color="#6389DA" />
                <Text style={styles.userName}>{userData?.name || 'User'}</Text>
                <Text style={styles.userRole}>{userData?.role || 'Operation Manager'}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <DrawerItemList {...props} />
            </View>
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

export default function OMDrawerLayout() {
    const { userData } = useUser();

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer
                drawerContent={(props) => <CustomDrawerContent {...props} />}
                screenOptions={({ navigation }) => ({ // Access navigation from here instead of useNavigation()
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
                <Drawer.Screen
                    name="read-only-Profile"
                    options={{
                        drawerLabel: 'Profile',
                        drawerIcon: ({ color, size }) => <Ionicons name="person-circle-outline" color={color} size={size} />
                    }}
                />
                <Drawer.Screen
                    name="task"
                    options={{
                        drawerLabel: 'All Task',
                        drawerIcon: ({ color, size }) => <Ionicons name="list" color={color} size={size} />
                    }}
                />
                <Drawer.Screen
                    name="profile"
                    options={{
                        drawerLabel: 'Profile',
                        headerTitle: 'User Profile',
                        drawerIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />
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
    },
    headerWelcome: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000',
        // Ensures the font looks clean on both iOS and Android
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    },
});