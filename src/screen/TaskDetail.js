import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
// Firebase Imports
import { db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function TaskDetailsScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams(); // Get the Task ID passed from the list

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchTaskDetails();
        }
    }, [id]);

    const fetchTaskDetails = async () => {
        try {
            const docRef = doc(db, 'task', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setTask(docSnap.data());
            } else {
                console.log("No such document!");
            }
        } catch (error) {
            console.error("Error fetching task:", error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to format Firebase Timestamps
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        return timestamp.toDate().toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2F80ED" />
            </View>
        );
    }

    if (!task) {
        return (
            <View style={styles.centerContainer}>
                <Text>Task not found.</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={26} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Task Details</Text>
                <View style={{ width: 26 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Task Title and ID (Using Firestore ID) */}
                <Text style={styles.title}>{task.name}</Text>
                <Text style={styles.taskID}>Task ID: {id.substring(0, 8).toUpperCase()}</Text>

                {/* Priority and Dates */}
                <View style={styles.metaRow}>
                    <View style={styles.priorityBadge}>
                        <Ionicons name="alert-circle-outline" size={18} color="#856404" />
                        <Text style={styles.priorityText}>{task.priority}</Text>
                    </View>
                    <View style={styles.dateInfo}>
                        <Text style={styles.dateLabel}>Due: <Text style={styles.dateValue}>{formatDate(task.dueDate)}</Text></Text>
                        <Text style={styles.dateLabel}>Created: <Text style={styles.dateValue}>{formatDate(task.createdDate)}</Text></Text>
                    </View>
                </View>

                {/* Main Details Card */}
                <View style={styles.detailsCard}>
                    <Text style={styles.boldLabel}>Task Information</Text>

                    <DetailItem label="Customer" value={task.customer} isBold />
                    <DetailItem label="Contact" value={task.contactNo} />
                    <DetailItem label="Location" value={task.location} />
                    <DetailItem label="Category" value={task.categoryName} />
                    <DetailItem label="Creator" value={task.creatorName} />
                    <DetailItem label="Status" value={task.status} />

                    <View style={styles.divider} />

                    <Text style={styles.descriptionLabel}>Task Description:</Text>
                    <Text style={styles.descriptionText}>{task.taskDescription}</Text>
                </View>

                {/* Assigned To Section */}
                <View style={styles.assignedSection}>
                    <Text style={styles.sectionTitle}>Assigned To:</Text>
                    <View style={styles.avatarContainer}>
                        {task.assignedTo ? (
                            <View style={styles.personRow}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>{task.assignedTo.charAt(0)}</Text>
                                </View>
                                <Text style={styles.personName}>{task.assignedTo}</Text>
                            </View>
                        ) : (
                            <Text style={styles.personName}>No one assigned yet</Text>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const DetailItem = ({ label, value, isBold }) => (
    <View style={styles.detailItemRow}>
        <Text style={styles.infoLabel}>{label}: </Text>
        <Text style={[styles.infoValue, isBold && styles.infoValueBold]}>{value || 'N/A'}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
    backButton: { padding: 4 },
    content: { padding: 20 },
    title: { fontSize: 26, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 5 },
    taskID: { fontSize: 14, color: '#888', marginBottom: 20 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
    priorityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3CD',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        marginRight: 20
    },
    priorityText: { color: '#856404', fontWeight: 'bold', marginLeft: 6, fontSize: 14 },
    dateInfo: { justifyContent: 'center' },
    dateLabel: { fontSize: 13, color: '#666', marginBottom: 2 },
    dateValue: { color: '#333', fontWeight: '600' },
    detailsCard: {
        backgroundColor: '#F0F7FF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E1E9F5'
    },
    boldLabel: { fontSize: 18, fontWeight: 'bold', color: '#003366', marginBottom: 15 },
    detailItemRow: { flexDirection: 'row', marginBottom: 10, flexWrap: 'wrap' },
    infoLabel: { fontSize: 15, color: '#555', fontWeight: '500' },
    infoValue: { fontSize: 15, color: '#1A1A1A', flexShrink: 1 },
    infoValueBold: { fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: '#D6E4F0', marginVertical: 15 },
    descriptionLabel: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    descriptionText: { fontSize: 14, color: '#444', lineHeight: 22 },
    assignedSection: {
        backgroundColor: '#F0F7FF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#E1E9F5'
    },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#003366', marginBottom: 15 },
    avatarContainer: { flexDirection: 'column' },
    personRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        borderWidth: 1,
        borderColor: '#6389DA'
    },
    avatarText: { color: '#6389DA', fontWeight: 'bold', fontSize: 16 },
    personName: { fontSize: 16, color: '#1A1A1A', fontWeight: '500' }
});