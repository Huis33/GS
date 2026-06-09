// components/HeaderRight.js
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAlerts } from '../src/context/AlertsContext';

export default function HeaderRight({ onOpen }) {
    const { unreadCount, markAllRead, toggleModal } = useAlerts();

    return (
        <TouchableOpacity onPress={() => { markAllRead(); toggleModal(); }} style={styles.notifButton}>
            <Ionicons name="notifications-outline" size={26} color="#1A1A1A" />
            {unreadCount > 0 && (
                <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount}</Text></View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    notifButton: { marginRight: 20 },
    badge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#E74C3C', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
    badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' }
});