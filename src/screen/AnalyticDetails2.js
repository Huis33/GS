import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db } from "../../firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function CoordinatorDetails() {
    const { name } = useLocalSearchParams();
    const router = useRouter();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!name) return;

        // QUERY: Find tasks created by this coordinator
        const q = query(
            collection(db, 'task'),
            where('creatorName', '==', name) // Plain string comparison
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTasks = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                let displayDate = 'No Date';

                // Standardized date fix to avoid the "Object as child" error
                if (data.dueDate && typeof data.dueDate.toDate === 'function') {
                    displayDate = data.dueDate.toDate().toLocaleDateString('en-MY');
                } else if (typeof data.dueDate === 'string') {
                    displayDate = data.dueDate;
                }

                fetchedTasks.push({
                    id: doc.id,
                    ...data,
                    formattedDate: displayDate
                });
            });
            setTasks(fetchedTasks);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [name]);

    if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6389DA" />;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Coordinator Info</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{name?.charAt(0)}</Text>
                    </View>
                    <Text style={styles.coordinatorName}>{name}</Text>
                    <Text style={styles.statsSub}>Tasks Created: {tasks.length}</Text>
                </View>

                <Text style={styles.sectionTitle}>Tasks Managed</Text>
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <View key={task.id} style={styles.taskCard}>
                            <View style={styles.dateRow}>
                                <Ionicons name="calendar-outline" size={14} color="#666" />
                                <Text style={styles.dateText}>{task.formattedDate}</Text>
                            </View>
                            <Text style={styles.taskName}>{task.name}</Text>
                            <Text style={styles.taskDesc} numberOfLines={2}>{task.taskDescription}</Text>
                            <View style={[styles.badge, { backgroundColor: task.status === 'Done' ? '#C8E6C9' : '#FFF9C4' }]}>
                                <Text style={styles.badgeText}>{task.status}</Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyText}>No tasks found for this coordinator.</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF' },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    content: { padding: 20 },
    profileCard: { alignItems: 'center', marginBottom: 25, backgroundColor: '#FFF', padding: 20, borderRadius: 20, elevation: 2 },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#6389DA', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    avatarText: { fontSize: 30, fontWeight: 'bold', color: '#FFF' },
    coordinatorName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    statsSub: { fontSize: 14, color: '#666', marginTop: 4 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
    taskCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 12, elevation: 1, borderLeftWidth: 5, borderLeftColor: '#6389DA' },
    dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    dateText: { fontSize: 12, color: '#666', marginLeft: 5 },
    taskName: { fontSize: 16, fontWeight: 'bold' },
    taskDesc: { fontSize: 13, color: '#666', marginVertical: 5 },
    badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 5, marginTop: 5 },
    badgeText: { fontSize: 10, fontWeight: 'bold' },
    emptyText: { textAlign: 'center', color: '#999', marginTop: 20 }
});