import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAlerts } from '../src/context/AlertsContext';

export default function HeaderRight() {
    const { unreadCount, markAllRead } = useAlerts();
    const router = useRouter();

    return (
        <TouchableOpacity
            onPress={() => {
                markAllRead();
                // Adjust this path based on your actual file structure
                router.push('/(jurutera)/notifications');
            }}
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