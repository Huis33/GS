// app/(jurutera)/notifications.js
import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAlerts } from '../../src/context/AlertsContext';

export default function NotificationsPage() {
    const { alerts, markAllRead } = useAlerts();

    useEffect(() => {
        // This will now only "dismiss" the notifications for completed tasks
        markAllRead();
    }, []);

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {alerts.length > 0 ? (
                    alerts.map(notif => (
                        <View
                            key={notif.id}
                            style={[
                                styles.notifAlertItem,
                                notif.type === 'overdue' ? styles.borderOverdue : styles.borderSoon
                            ]}
                        >
                            <Text style={styles.notifAlertTitle}>{notif.title}</Text>
                            <Text style={styles.notifAlertBody}>{notif.body}</Text>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="checkmark-circle-outline" size={48} color="#27AE60" />
                        <Text style={styles.noNotifText}>You are all caught up! No active alerts.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFF', padding: 20 },
    notifAlertItem: {
        backgroundColor: '#FFF', // Using card white
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#EBF0FF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2
    },
    borderOverdue: { borderLeftWidth: 6, borderLeftColor: '#E74C3C' },
    borderSoon: { borderLeftWidth: 6, borderLeftColor: '#F39C12' },
    notifAlertTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginBottom: 5 },
    notifAlertBody: { fontSize: 14, color: '#555', lineHeight: 20 },
    emptyContainer: { alignItems: 'center', paddingVertical: 50 },
    noNotifText: { color: '#64748B', fontSize: 15, marginTop: 10, fontWeight: '500' }
});