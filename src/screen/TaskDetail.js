import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { doc, getDoc } from 'firebase/firestore';
import React, { useCallback, useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../firebaseConfig';
import * as Print from 'expo-print';

const PRIORITY_CONFIG = {
    'Critical': { bg: '#FDECEC', text: '#D32F2F', icon: 'alert-circle' },
    'High': { bg: '#FEF0E6', text: '#E65100', icon: 'arrow-up-circle' },
    'Medium': { bg: '#FFF9E6', text: '#F57C00', icon: 'remove-circle' },
    'Low': { bg: '#F1F9F1', text: '#388E3C', icon: 'arrow-down-circle' },
};

export default function TaskDetailsScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams(); // Get the Task ID passed from the list

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const isOwner = auth.currentUser?.uid === task?.createdBy;
    const canExport = true; // Set your logic here: userRole === 'Coordinator' || userRole === 'Manager'

    const handleExportPDF = async () => {
        try {
            setLoading(true);

            // 1. Create HTML Template (Matching your UI colors)
            const htmlContent = `
                <html>
                    <head>
                        <style>
                            body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
                            .header { border-bottom: 2px solid #2F80ED; padding-bottom: 10px; margin-bottom: 20px; }
                            .title { fontSize: 24px; font-weight: bold; margin: 0; }
                            .id { color: #888; font-size: 12px; }
                            .section { margin-bottom: 20px; padding: 15px; border-radius: 10px; background-color: #F0F7FF; }
                            .label { font-weight: bold; color: #003366; width: 150px; display: inline-block; }
                            .row { margin-bottom: 8px; border-bottom: 1px solid #E1E9F5; padding-bottom: 4px; }
                            .status { font-weight: bold; color: ${getStatusStyles(task.status).text}; }
                            .desc { line-height: 1.5; white-space: pre-wrap; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1 class="title">${task.name}</h1>
                            <p class="id">Task ID: ${id.toUpperCase()}</p>
                        </div>

                        <div class="section">
                            <h3>Task Information</h3>
                            <div class="row"><span class="label">Status:</span> <span class="status">${task.status}</span></div>
                            <div class="row"><span class="label">Priority:</span> <span>${task.priority}</span></div>
                            <div class="row"><span class="label">Customer:</span> <span>${task.customer}</span></div>
                            <div class="row"><span class="label">Location:</span> <span>${task.location}</span></div>
                            <div class="row"><span class="label">Category:</span> <span>${task.categoryName}</span></div>
                            <div class="row"><span class="label">Created By:</span> <span>${task.creatorName}</span></div>
                            <div class="row"><span class="label">Due Date:</span> <span>${formatDateTime(task.dueDate)}</span></div>
                        </div>

                        <div class="section" style="background-color: #F8FAFC;">
                            <h3>Description</h3>
                            <p class="desc">${task.taskDescription}</p>
                        </div>

                        <div class="section">
                            <h3>Assigned Engineers</h3>
                            <p>${task.assignedTo?.join(', ') || 'None'}</p>
                        </div>

                        <p style="text-align: center; font-size: 10px; color: #999; margin-top: 50px;">
                            Generated on ${new Date().toLocaleString()}
                        </p>
                    </body>
                </html>
            `;

            // 2. Generate PDF File
            const { uri } = await Print.printToFileAsync({ html: htmlContent });

            // 3. Save/Share file using your existing logic
            const fileName = `Report_${task.name.replace(/\s+/g, '_')}.pdf`;

            if (Platform.OS === 'android') {
                const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
                if (permissions.granted) {
                    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
                    const newUri = await FileSystem.StorageAccessFramework.createFileAsync(
                        permissions.directoryUri,
                        fileName,
                        'application/pdf'
                    );
                    await FileSystem.writeAsStringAsync(newUri, base64, { encoding: FileSystem.EncodingType.Base64 });
                    Alert.alert("Success", "Report saved to Downloads.");
                }
            } else {
                await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
            }

        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to generate PDF report.");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (id) {
                fetchTaskDetails();
            }
        }, [id])
    );

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
        return dateObj.toLocaleDateString('en-US', {
            day: 'numeric', month: 'long', year: 'numeric'
        }) + ` at ` + dateObj.toLocaleTimeString('en-US', {
            hour: 'numeric', minute: '2-digit', hour12: true
        });
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Not Yet Started':
                return { bg: '#FFDCDC', text: '#C0392B' };
            case 'In Progress':
                return { bg: '#F5EFEB', text: '#A67C52' };
            case 'Done':
                return { bg: '#D5FFD6', text: '#1E8449' };
            case 'Not Yet Assigned':
                return { bg: '#F1F5F9', text: '#475569' };
            default:
                return { bg: '#FFF', text: '#374151' };
        }
    };
    
    const handleDownload = async () => {
        if (!task.attachedFile) {
            Alert.alert("Error", "No file attached to this task.");
            return;
        }
    
        try {
            const fileUri = task.attachedFile;
            const fileName = `Task_${id.substring(0, 5)}.pdf`;
    
            // --- 1. WEB PLATFORM ---
            if (Platform.OS === 'web') {
                const link = document.createElement('a');
                link.href = fileUri;
                link.download = fileName;
                link.target = "_blank";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                return;
            }
    
            setLoading(true);
    
            // --- 2. DOWNLOAD TO CACHE FIRST ---
            // We download the file to the app's internal cache before moving it to public storage
            const tempUri = `${FileSystem.cacheDirectory}${fileName}`;
            const downloadResumable = FileSystem.createDownloadResumable(fileUri, tempUri);
            const { uri } = await downloadResumable.downloadAsync();
    
            // --- 3. SAVE TO LOCAL DEVICE ---
            if (Platform.OS === 'android') {
                // Android: Use Storage Access Framework (SAF)
                // This allows the user to pick a folder (like Downloads) to save the PDF
                const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
                
                if (permissions.granted) {
                    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
                    
                    // Create the file in the selected directory
                    const newFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
                        permissions.directoryUri,
                        fileName,
                        'application/pdf'
                    );
    
                    // Write the data to the new file
                    await FileSystem.writeAsStringAsync(newFileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
                    Alert.alert("Success", "File saved to your selected folder.");
                } else {
                    Alert.alert("Permission Denied", "Could not save the file without folder access.");
                }
            } else {
                // iOS: Direct local saving is not allowed by Apple. 
                // Sharing.shareAsync is the "Save to Files" standard for iOS.
                await Sharing.shareAsync(uri);
            }
        } catch (error) {
            console.error("Download error:", error);
            Alert.alert("Error", "Failed to process download.");
        } finally {
            setLoading(false);
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

    const priorityStyle = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG['Medium'];
    const statusStyle = getStatusStyles(task.status);

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
                    <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.bg }]}>
                        <Ionicons name={priorityStyle.icon} size={18} color={priorityStyle.text} />
                        <Text style={[styles.priorityText, { color: priorityStyle.text }]}>{task.priority}</Text>
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
                    <View style={styles.detailItemRow}>
                        <Text style={styles.infoLabel}>Progress: </Text>
                        <View style={[styles.inlineStatusBadge, { backgroundColor: statusStyle.bg }]}>
                            <Text style={[styles.statusTabText, { color: statusStyle.text }]}>{task.status}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.descriptionLabel}>Task Description:</Text>
                    <Text style={styles.descriptionText}>{task.taskDescription}</Text>
                </View>

                {/* Assigned To Section */}
                <View style={styles.assignedSection}>
                    <Text style={styles.sectionTitle}>Assigned Engineers:</Text>
                    {task.assignedTo?.map((name, index) => (
                        <View key={index} style={styles.personRow}>
                            <View style={styles.avatar}><Text style={styles.avatarText}>{name.charAt(0)}</Text></View>
                            <Text style={styles.personName}>{name}</Text>
                        </View>
                    )) || <Text style={styles.noAssignment}>No one assigned yet</Text>}
                </View>

                {/* --- ATTACHMENT SECTION --- */}
                <View style={styles.attachmentSection}>
                    <Text style={styles.sectionTitle}>Attachments</Text>
                    {task.attachedFile ? (
                        <TouchableOpacity style={styles.attachmentCard} onPress={handleDownload}>
                            <View style={styles.attachmentInfo}>
                                <Ionicons name="document-text" size={24} color="#2F80ED" />
                                <Text style={styles.fileName}>Task Attachment</Text>
                            </View>
                            <Ionicons name="download-outline" size={24} color="#666" />
                        </TouchableOpacity>
                    ) : <Text style={styles.noAssignment}>No files attached.</Text>}
                </View>
                {canExport && (
                    <TouchableOpacity style={styles.savePdfButton} onPress={handleExportPDF}>
                        <Ionicons name="document-text-outline" size={20} color="#FFF" />
                        <Text style={styles.savePdfButtonText}>Save as PDF Report</Text>
                    </TouchableOpacity>
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
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    backButton: { padding: 4 },
    content: { padding: 20 },
    title: { fontSize: 26, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 5 },
    taskID: { fontSize: 14, color: '#888', marginBottom: 20 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
    priorityBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, marginRight: 15 },
    priorityText: { fontWeight: 'bold', marginLeft: 6, fontSize: 14 },
    dateInfo: { flex: 1 },
    dateLabel: { fontSize: 12, color: '#666' },
    dateValue: { color: '#333', fontWeight: '600' },
    detailsCard: { backgroundColor: '#F0F7FF', borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#E1E9F5' },
    boldLabel: { fontSize: 18, fontWeight: 'bold', color: '#003366', marginBottom: 15 },
    detailItemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' },
    infoLabel: { fontSize: 15, color: '#555', fontWeight: '500' },
    infoValue: { fontSize: 15, color: '#1A1A1A', flexShrink: 1 },
    infoValueBold: { fontWeight: 'bold' },
    inlineStatusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginLeft: 4 },
    statusTabText: { fontSize: 13, fontWeight: '700' },
    divider: { height: 1, backgroundColor: '#D6E4F0', marginVertical: 15 },
    descriptionLabel: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    descriptionText: { fontSize: 14, color: '#444', lineHeight: 22 },
    assignedSection: { backgroundColor: '#F8FAFC', borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#003366', marginBottom: 12 },
    personRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: '#6389DA' },
    avatarText: { color: '#6389DA', fontWeight: 'bold', fontSize: 14 },
    personName: { fontSize: 16, color: '#1A1A1A', fontWeight: '500' },
    noAssignment: { fontSize: 14, color: '#94A3B8', fontStyle: 'italic', marginTop: 5 },
    attachmentSection: { backgroundColor: '#F0F7FF', borderRadius: 24, padding: 20, marginBottom: 40, borderWidth: 1, borderColor: '#E1E9F5' },
    attachmentCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginTop: 10, borderWidth: 1, borderColor: '#D6E4F0' },
    attachmentInfo: { flexDirection: 'row', alignItems: 'center' },
    fileName: { marginLeft: 10, fontSize: 16, color: '#333', fontWeight: '500' }, savePdfButton: {
        backgroundColor: '#1E8449', // Professional green
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginTop: 10,
        marginBottom: 30,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    savePdfButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});