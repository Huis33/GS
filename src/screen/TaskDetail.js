import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TaskDetailsScreen() {
    const router = useRouter();

    // Dummy Data based on image_5ffd62.jpg
    const taskDetails = {
        title: "User Testing Session",
        taskID: "T098764567",
        priority: "Medium",
        dueDate: "4 Jan 2026",
        createdDate: "1 Jan 2026",
        fullName: "User Testing Session – GAIA Science Scheduling System",
        customerName: "GAIA Science Internal Testing Team",
        contact: "012-3456789",
        location: "GAIA Science Laboratory, Level 3",
        date: "3 January 2026",
        time: "10:00 AM – 11:00 PM",
        category: "User Testing Session",
        assignedBy: "Evelyn Choo",
        description: "Conduct a structured user testing session to evaluate the usability and functionality of the GAIA Science Scheduling System. Participants are required to perform predefined tasks while feedback, usability issues, and system performance observations are recorded for analysis and system improvement.",
        assignedTo: [
            { id: '1', name: 'Daisy Holloway', initial: 'D' },
            { id: '2', name: 'Lyra Vane', initial: 'L' }
        ]
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Task Details</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Task Title and ID */}
                <Text style={styles.title}>{taskDetails.title}</Text>
                <Text style={styles.taskID}>TaskID: {taskDetails.taskID}</Text>

                {/* Priority and Dates */}
                <View style={styles.metaRow}>
                    <View style={styles.priorityBadge}>
                        <Ionicons name="timer-outline" size={16} color="#856404" />
                        <Text style={styles.priorityText}>{taskDetails.priority}</Text>
                    </View>
                    <View style={styles.dateInfo}>
                        <Text style={styles.dateLabel}>Due: {taskDetails.dueDate}</Text>
                        <Text style={styles.dateLabel}>Task Created By: {taskDetails.createdDate}</Text>
                    </View>
                </View>

                {/* Main Details Card */}
                <View style={styles.detailsCard}>
                    <Text style={styles.boldLabel}>Task Name: {taskDetails.fullName}</Text>
                    <Text style={styles.infoText}>Customer Name: {taskDetails.customerName}</Text>
                    <Text style={styles.infoText}>Customer Contact Number: {taskDetails.contact}</Text>
                    <Text style={styles.infoText}>Task Location: {taskDetails.location}</Text>
                    <Text style={styles.infoText}>Task Date: {taskDetails.date}</Text>
                    <Text style={styles.infoText}>Task Time: {taskDetails.time}</Text>
                    <Text style={styles.infoText}>Task Category / Type: {taskDetails.category}</Text>
                    <Text style={styles.infoText}>Assigned by: {taskDetails.assignedBy}</Text>

                    <Text style={[styles.infoText, { marginTop: 15 }]}>Task Description:</Text>
                    <Text style={styles.descriptionText}>{taskDetails.description}</Text>
                </View>

                {/* Assigned To Section */}
                <View style={styles.assignedSection}>
                    <Text style={styles.sectionTitle}>Assigned To:</Text>
                    {taskDetails.assignedTo.map(person => (
                        <View key={person.id} style={styles.personRow}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{person.initial}</Text>
                            </View>
                            <Text style={styles.personName}>{person.name}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 15 },
    content: { padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    taskID: { fontSize: 14, color: '#666', marginBottom: 15 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    priorityBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3CD', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, marginRight: 15 },
    priorityText: { color: '#856404', fontWeight: 'bold', marginLeft: 5 },
    dateInfo: { flex: 1 },
    dateLabel: { fontSize: 12, color: '#666' },
    detailsCard: { backgroundColor: '#E8F0FE', borderRadius: 20, padding: 20, marginBottom: 20 },
    boldLabel: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 10 },
    infoText: { fontSize: 15, color: '#333', marginBottom: 8 },
    descriptionText: { fontSize: 14, color: '#444', lineHeight: 20 },
    assignedSection: { backgroundColor: '#E8F0FE', borderRadius: 20, padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    personRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    avatar: { width: 35, height: 35, borderRadius: 17.5, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: '#DDD' },
    avatarText: { color: '#6B4EFF', fontWeight: 'bold' },
    personName: { fontSize: 16, color: '#333' }
});