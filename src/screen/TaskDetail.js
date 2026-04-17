import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { db, auth } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function TaskDetailsScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams(); // Get the Task ID passed from the list

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const isOwner = auth.currentUser?.uid === task?.createdBy;

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
    // 1. Existing Date Helper
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        return timestamp.toDate().toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    // 2. NEW DateTime Helper (Add this here!)
    const formatDateTime = (timestamp) => {
        if (!timestamp) return 'N/A';
        const dateObj = timestamp.toDate();

        const datePart = dateObj.toLocaleDateString('en-US', {
            day: 'numeric', month: 'long', year: 'numeric'
        });

        const timePart = dateObj.toLocaleTimeString('en-US', {
            hour: 'numeric', minute: '2-digit', hour12: true
        });

        return `${datePart} at ${timePart}`;
    };

    const handleDownload = async () => {
        if (!task.attachedFile) {
            Alert.alert("Error", "No file attached to this task.");
            return;
        }

        try {
            const fileUri = task.attachedFile;
            // Get the file name from the URI
            const fileName = fileUri.split('/').pop() || 'attachment.pdf';
            const downloadDest = `${FileSystem.documentDirectory}${fileName}`;

            // Download the file
            const downloadResumable = FileSystem.createDownloadResumable(
                fileUri,
                downloadDest
            );

            const result = await downloadResumable.downloadAsync();

            if (result) {
                // Open the file sharing/preview menu
                await Sharing.shareAsync(result.uri);
            }
        } catch (error) {
            console.error("Download error:", error);
            Alert.alert("Error", "Could not download the file.");
        }
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

                {isOwner ? (
                    <TouchableOpacity
                        onPress={() => router.push({
                            pathname: '/edit-task', // This must match your file name (e.g., edit-task.js)
                            params: { id: id }      // 'id' is the variable holding the Firestore document ID
                        })}
                        style={styles.editButton}
                    >
                        <Ionicons name="create-outline" size={26} color="#2F80ED" />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 26 }} /> // Placeholder for balance
                )}
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
                        {/* Call the function here */}
                        <Text style={styles.dateLabel}>
                            Due: <Text style={styles.dateValue}>{formatDateTime(task.dueDate)}</Text>
                        </Text>
                        <Text style={styles.dateLabel}>
                            Created: <Text style={styles.dateValue}>{formatDate(task.createdDate)}</Text>
                        </Text>
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
                    <Text style={styles.sectionTitle}>Assigned Engineers:</Text>
                    <View style={styles.avatarContainer}>
                        {task.assignedTo && task.assignedTo.length > 0 ? (
                            task.assignedTo.map((name, index) => (
                                <View key={index} style={styles.personRow}>
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>{name.charAt(0)}</Text>
                                    </View>
                                    <Text style={styles.personName}>{name}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noAssignment}>No one assigned yet</Text>
                        )}
                    </View>
                </View>

                {/* --- ATTACHMENT SECTION --- */}
                {task.attachedFile ? (
                    <View style={styles.attachmentSection}>
                        <Text style={styles.sectionTitle}>Attachments</Text>
                        <TouchableOpacity
                            style={styles.attachmentCard}
                            onPress={handleDownload}
                        >
                            <View style={styles.attachmentInfo}>
                                <Ionicons name="document-text" size={24} color="#2F80ED" />
                                <Text style={styles.fileName}>Task Attachment</Text>
                            </View>
                            <Ionicons name="download-outline" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.attachmentSection}>
                        <Text style={styles.sectionTitle}>Attachments</Text>
                        <Text style={styles.noAssignment}>No files attached.</Text>
                    </View>
                )}
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
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
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
    priorityText: { color: '#856404', fontWeight: 'bold', marginLeft: 6 },
    dateInfo: { justifyContent: 'center' },
    dateLabel: { fontSize: 13, color: '#666' },
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
        backgroundColor: '#F8FAFC', // Slightly different shade to differentiate
        borderRadius: 24,
        padding: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#E2E8F0'
    },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#003366', marginBottom: 15 },
    avatarContainer: { flexDirection: 'column' },
    personRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#6389DA'
    },
    avatarText: { color: '#6389DA', fontWeight: 'bold', fontSize: 14 },
    personName: { fontSize: 16, color: '#1A1A1A', fontWeight: '500' },
    noAssignment: { fontSize: 15, color: '#94A3B8', fontStyle: 'italic' },
    attachmentSection: {
        backgroundColor: '#F0F7FF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 40, // Extra space at bottom
        borderWidth: 1,
        borderColor: '#E1E9F5'
    },
    attachmentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 12,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#D6E4F0'
    },
    attachmentInfo: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    fileName: {
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
        fontWeight: '500'
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#003366',
        marginBottom: 5
    },
    noAssignment: {
        fontSize: 15,
        color: '#94A3B8',
        fontStyle: 'italic',
        marginTop: 5
    }
});