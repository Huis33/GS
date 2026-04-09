import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar
} from 'react-native';
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
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Custom Header - Full Width Control */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={26} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Task Details</Text>
                <View style={{ width: 26 }} /> {/* Balance for centering */}
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Task Title and ID */}
                <Text style={styles.title}>{taskDetails.title}</Text>
                <Text style={styles.taskID}>TaskID: {taskDetails.taskID}</Text>

                {/* Priority and Dates */}
                <View style={styles.metaRow}>
                    <View style={styles.priorityBadge}>
                        <Ionicons name="alert-circle-outline" size={18} color="#856404" />
                        <Text style={styles.priorityText}>{taskDetails.priority}</Text>
                    </View>
                    <View style={styles.dateInfo}>
                        <Text style={styles.dateLabel}>Due: <Text style={styles.dateValue}>{taskDetails.dueDate}</Text></Text>
                        <Text style={styles.dateLabel}>Created: <Text style={styles.dateValue}>{taskDetails.createdDate}</Text></Text>
                    </View>
                </View>

                {/* Main Details Card */}
                <View style={styles.detailsCard}>
                    <Text style={styles.boldLabel}>Task Details</Text>

                    <DetailItem label="Full Name" value={taskDetails.fullName} isBold />
                    <DetailItem label="Customer" value={taskDetails.customerName} />
                    <DetailItem label="Contact" value={taskDetails.contact} />
                    <DetailItem label="Location" value={taskDetails.location} />
                    <DetailItem label="Date" value={taskDetails.date} />
                    <DetailItem label="Time" value={taskDetails.time} />
                    <DetailItem label="Category" value={taskDetails.category} />
                    <DetailItem label="Assigned By" value={taskDetails.assignedBy} />

                    <View style={styles.divider} />

                    <Text style={styles.descriptionLabel}>Task Description:</Text>
                    <Text style={styles.descriptionText}>{taskDetails.description}</Text>
                </View>

                {/* Assigned To Section */}
                <View style={styles.assignedSection}>
                    <Text style={styles.sectionTitle}>Assigned To:</Text>
                    <View style={styles.avatarContainer}>
                        {taskDetails.assignedTo.map(person => (
                            <View key={person.id} style={styles.personRow}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>{person.initial}</Text>
                                </View>
                                <Text style={styles.personName}>{person.name}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const DetailItem = ({ label, value, isBold }) => (
    <View style={styles.detailItemRow}>
        <Text style={styles.infoLabel}>{label}: </Text>
        <Text style={[styles.infoValue, isBold && styles.infoValueBold]}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
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