import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db } from "../../firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import ScreenContainer from '../../components/ScreenContainer';

export default function EngineerDetails() {
    const { name } = useLocalSearchParams();
    const router = useRouter();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!name) return;

        // Query: Find tasks where this engineer's name exists in assignedTo array
        const q = query(
            collection(db, 'task'),
            where('assignedTo', 'array-contains', name)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTasks = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                let displayDate = 'No Date';

                // Standardized date fix
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
            }); // FIXED: Added missing closing parenthesis for snapshot.forEach

            setTasks(fetchedTasks);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [name]);

    if (loading) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#6389DA" />
        </View>
    );

    return (
        <ScreenContainer style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Engineer Info</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Card - Clickable to see full profile */}
                <View style={styles.profileCardWrapper}>
                    <TouchableOpacity
                        style={styles.profileCard}
                        activeOpacity={0.8}
                        onPress={() =>
                            router.push({
                                pathname: '/read-only-eng-profile', // Ensure this matches your file name
                                params: { name: name }
                            })
                        }
                    >
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{name?.charAt(0).toUpperCase()}</Text>
                        </View>

                        <Text style={styles.engineerName}>{name}</Text>
                        <Text style={styles.statsSub}>
                            Total Tasks Handled: {tasks.length}
                        </Text>
                        <View style={styles.viewProfileBadge}>
                            <Text style={styles.viewProfileText}>View Full Profile</Text>
                            <Ionicons name="chevron-forward" size={14} color="#6389DA" />
                        </View>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Task History</Text>

                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <TouchableOpacity
                            key={task.id}
                            style={styles.taskCard}
                            onPress={() => router.push({ pathname: '/task-detail', params: { id: task.id } })}
                        >
                            <View style={styles.dateRow}>
                                <Ionicons name="calendar-outline" size={14} color="#666" />
                                <Text style={styles.dateText}>{task.formattedDate}</Text>
                            </View>
                            <Text style={styles.taskName}>{task.name}</Text>
                            <Text style={styles.taskDesc} numberOfLines={2}>{task.taskDescription}</Text>

                            <View style={[
                                styles.badge,
                                { backgroundColor: task.status === 'Done' ? '#C8E6C9' : '#FFF9C4' }
                            ]}>
                                <Text style={styles.badgeText}>{task.status}</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={styles.emptyText}>No tasks found for this engineer.</Text>
                )}
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFF' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#FFF'
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    content: { padding: 20 },
    profileCard: {
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 25,
        borderRadius: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#6389DA',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10
    },
    avatarText: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
    engineerName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    statsSub: { fontSize: 14, color: '#666', marginTop: 4 },
    viewProfileBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: '#F0F4FF',
        borderRadius: 20,
    },
    viewProfileText: { fontSize: 12, color: '#6389DA', fontWeight: 'bold', marginRight: 4 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
    taskCard: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 15,
        marginBottom: 12,
        elevation: 2,
        borderLeftWidth: 6,
        borderLeftColor: '#6389DA'
    },
    dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    dateText: { fontSize: 12, color: '#666', marginLeft: 5 },
    taskName: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
    taskDesc: { fontSize: 13, color: '#666', marginVertical: 5 },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 6,
        marginTop: 5
    },
    badgeText: { fontSize: 10, fontWeight: 'bold', color: '#333' },
    emptyText: { textAlign: 'center', color: '#999', marginTop: 20 },
    profileCardWrapper: {
        marginBottom: 30
    },
});