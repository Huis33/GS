// components/NotificationModalWrapper.js
import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAlerts } from '../src/context/AlertsContext';

export default function NotificationModalWrapper({ children }) {
    const { alerts, isModalVisible, toggleModal } = useAlerts();

    return (
        <View style={{ flex: 1 }}>
            {children}
            {/* The Modal is only rendered if isModalVisible is true */}
            <Modal visible={isModalVisible} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Alerts Center</Text>
                            <TouchableOpacity onPress={toggleModal}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ maxHeight: 300 }}>
                            {alerts.length > 0 ? alerts.map(n => (
                                <View key={n.id} style={styles.notifItem}>
                                    <Text style={styles.notifTitle}>{n.title}</Text>
                                    <Text>{n.body}</Text>
                                </View>
                            )) : <Text>No alerts</Text>}
                        </ScrollView>
                        <TouchableOpacity style={styles.acknowledgeButton} onPress={toggleModal}>
                            <Text style={styles.btnText}>Acknowledge</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
    modalCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    notifItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#EEE' },
    notifTitle: { fontWeight: 'bold' },
    acknowledgeButton: { marginTop: 15, backgroundColor: '#6389DA', padding: 12, borderRadius: 10, alignItems: 'center' },
    btnText: { color: '#FFF', fontWeight: 'bold' }
});