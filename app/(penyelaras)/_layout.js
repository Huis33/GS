import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useUser } from '../../src/context/UserContext';
import HeaderRight from '../../components/HeaderRight';
import CustomDrawerContent, { DRAWER_SCREEN_OPTIONS } from '../../components/CustomDrawerContent';

export default function PenyelarasDrawerLayout() {
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
                    headerTitle: () => (
                        <Text style={styles.headerWelcome}>Welcome, {userData?.name || 'User'}</Text>
                    ),
                    headerRight: () => <HeaderRight />,
                })}
            >
                <Drawer.Screen name="(tabs)" options={{ drawerItemStyle: { display: 'none' } }} />

                <Drawer.Screen
                    name="profile"
                    options={{
                        drawerLabel: 'Profile',
                        headerTitle: 'Profile',
                        drawerIcon: ({ color, size }) => <Ionicons name="person-circle-outline" color={color} size={size} />,
                        headerLeft: () => (
                            <TouchableOpacity style={{ marginLeft: 20 }} onPress={() => router.replace('/(penyelaras)/(tabs)')}>
                                <Ionicons name="arrow-back" size={28} color="black" />
                            </TouchableOpacity>
                        ),
                    }}
                />

                <Drawer.Screen
                    name="notifications"
                    options={{
                        title: 'Notifications',
                        drawerItemStyle: { display: 'none' },
                        headerLeft: () => (
                            <TouchableOpacity style={{ marginLeft: 20 }} onPress={() => router.back()}>
                                <Ionicons name="arrow-back" size={28} color="black" />
                            </TouchableOpacity>
                        ),
                    }}
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
