import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '../src/context/UserContext';

export const DRAWER_SCREEN_OPTIONS = {
    drawerStyle: {
        width: 288,
        backgroundColor: '#FFFFFF',
    },
    drawerActiveTintColor: '#6389DA',
    drawerInactiveTintColor: '#475569',
    drawerActiveBackgroundColor: 'rgba(99, 137, 218, 0.12)',
    drawerLabelStyle: {
        fontSize: 15,
        fontWeight: '500',
        marginLeft: -8,
    },
    drawerItemStyle: {
        borderRadius: 12,
        marginHorizontal: 12,
        marginVertical: 2,
    },
    overlayColor: 'rgba(15, 23, 42, 0.45)',
    sceneContainerStyle: {
        backgroundColor: '#FFFFFF',
    },
};

export default function CustomDrawerContent(props) {
    const { userData } = useUser();
    const insets = useSafeAreaInsets();

    const handleLogout = () => {
        props.navigation.closeDrawer();
        router.push('/logout-confirm');
    };

    const initials = userData?.name
        ? userData.name
              .split(' ')
              .map((part) => part[0])
              .join('')
              .substring(0, 2)
              .toUpperCase()
        : 'U';

    return (
        <View style={styles.wrapper}>
            <DrawerContentScrollView
                {...props}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                    <View style={styles.avatarRing}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                    </View>
                    <Text style={styles.userName} numberOfLines={1}>
                        {userData?.name || 'User'}
                    </Text>
                    <Text style={styles.userRole}>{userData?.role || 'User'}</Text>
                </View>

                <View style={styles.menuSection}>
                    <DrawerItemList {...props} />
                </View>
            </DrawerContentScrollView>

            <View style={[styles.logoutSection, { paddingBottom: Math.max(insets.bottom, 12) }]}>
                <DrawerItem
                    label="Log Out"
                    onPress={handleLogout}
                    icon={({ size }) => <Ionicons name="log-out-outline" color="#EF4444" size={size} />}
                    labelStyle={styles.logoutLabel}
                    style={styles.logoutItem}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        backgroundColor: '#F0F4FF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        alignItems: 'center',
    },
    avatarRing: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#6389DA',
        padding: 3,
        marginBottom: 12,
    },
    avatar: {
        flex: 1,
        borderRadius: 33,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#6389DA',
    },
    userName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        textAlign: 'center',
    },
    userRole: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 4,
        textAlign: 'center',
    },
    menuSection: {
        flex: 1,
        paddingTop: 8,
        paddingBottom: 8,
    },
    logoutSection: {
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingTop: 4,
    },
    logoutLabel: {
        color: '#EF4444',
        fontWeight: '600',
        fontSize: 15,
    },
    logoutItem: {
        borderRadius: 12,
        marginHorizontal: 8,
    },
});
