import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAlerts } from '../src/context/AlertsContext';
import { useUser } from '../src/context/UserContext';

export default function HeaderRight() {
    const { unreadCount } = useAlerts();
    const router = useRouter();
    const { userData } = useUser();
    const role = (userData?.role || '').trim().toLowerCase();
    const isPenyelaras = role === 'servicecoordinator' || role === 'penyelaras';
    const notificationsPath = isPenyelaras
        ? '/(penyelaras)/notifications'
        : '/(jurutera)/notifications';

    return (
        <TouchableOpacity
            onPress={() => router.push(notificationsPath)}
            style={styles.notifButton}
        >
            <Ionicons name="notifications-outline" size={26} color="#1A1A1A" />
            {unreadCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

// THIS BLOCK MUST BE AT THE BOTTOM
const styles = StyleSheet.create({
    notifButton: {
        marginRight: 20
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#E74C3C',
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center'
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold'
    }
});