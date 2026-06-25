import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert, Platform,
    ScrollView, StatusBar,
    StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';

// 1. IMPORT CENTRALIZED UTILITIES & THEME
import { COLORS, PRIORITY_CONFIG } from '../../constants/theme';
import { auth, db } from '../../firebaseConfig';
import { getStatusStyles } from '../service/statusService';
import { saveAndShareFile } from '../utils/fileDownloader';
import { generateTaskHtml } from '../utils/pdfGenerator';

export default function TaskDetailsScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    const isOwner = auth.currentUser?.uid === task?.createdBy;
    const canExport = true;
    const isTaskDone = task?.status === 'Done';
    const canEdit = isOwner && !isTaskDone;

    // --- HELPERS ---
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        return timestamp.toDate().toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const formatDateTime = (timestamp) => {
        if (!timestamp) return 'N/A';
        const dateObj = timestamp.toDate();
        return dateObj.toLocaleDateString('en-US', {
            day: 'numeric', month: 'long', year: 'numeric'
        }) + ` at ` + dateObj.toLocaleTimeString('en-US', {
            hour: 'numeric', minute: '2-digit', hour12: true
        });
    };

    const fetchTaskDetails = async (isMounted) => {
        try {
            const docRef = doc(db, 'task', id);
            const docSnap = await getDoc(docRef);

            if (isMounted && docSnap.exists()) {
                setTask(docSnap.data());
            }
        } catch (error) {
            console.error("Error fetching task:", error);
        } finally {
            if (isMounted) {
                setLoading(false);
            }
        }
    };

    useFocusEffect(
        useCallback(() => {
            let isMounted = true;
            if (id) {
                fetchTaskDetails(isMounted);
            }
            return () => {
                isMounted = false;
            };
        }, [id])
    );

    const handleExportPDF = async () => {
        try {
            setDownloading(true);
            const htmlContent = generateTaskHtml(task, id, formatDateTime);
            const { uri } = await Print.printToFileAsync({ html: htmlContent });
            const fileName = `Report_${task.name.replace(/\s+/g, '_')}.pdf`;
            await saveAndShareFile(uri, fileName);
        } catch (error) {
            Alert.alert("Error", "Failed to generate PDF report.");
        } finally {
            setDownloading(false);
        }
    };

    // 🚀 FIXED: Rewritten handleDownload to accept the exact file map shape from Firestore
    const handleDownload = async (fileObj) => {
        const targetUrl = typeof fileObj === 'string' ? fileObj : fileObj?.url;
        const targetName = fileObj?.name || '';
        let targetType = fileObj?.type || '';

        if (!targetUrl) {
            return Alert.alert("Error", "No file resource found.");
        }

        if (targetUrl.startsWith('file://') || targetUrl.startsWith('content://')) {
            return Alert.alert(
                "Database Error",
                "This file points to a non-existent local device path."
            );
        }

        try {
            if (Platform.OS === 'web') {
                window.open(targetUrl, '_blank');
                return;
            }
            setDownloading(true);

            // 1. Clean out query parameters and lowercase the URL for matching
            const cleanUrl = targetUrl.split('?')[0].toLowerCase();
            const lowerName = targetName.toLowerCase();
            const lowerType = targetType.toLowerCase();

            let fileExtension = '';

            // 2. FORCE IMAGE OVERRIDE: If anything indicates it's an image, force it.
            if (cleanUrl.includes('.png') || lowerName.includes('.png') || lowerType.includes('png')) {
                fileExtension = 'png';
            } else if (cleanUrl.includes('.jpg') || cleanUrl.includes('.jpeg') || lowerName.includes('.jpg') || lowerName.includes('.jpeg') || lowerType.includes('jpg') || lowerType.includes('jpeg')) {
                fileExtension = 'jpg';
            } else if (cleanUrl.includes('.webp') || lowerName.includes('.webp')) {
                fileExtension = 'webp';
            } else {
                // 3. Fallback to normal parsing if it's not an obvious image
                const decodedUrl = decodeURIComponent(cleanUrl);
                const urlFilename = decodedUrl.substring(decodedUrl.lastIndexOf('/') + 1);
                const extractedExt = urlFilename.includes('.') ? urlFilename.split('.').pop() : '';

                if (extractedExt && extractedExt.length >= 2 && extractedExt.length <= 4) {
                    fileExtension = extractedExt;
                } else if (targetName && targetName.includes('.')) {
                    fileExtension = targetName.split('.').pop()?.toLowerCase().trim() || 'pdf';
                } else {
                    fileExtension = targetType.includes('/') ? targetType.split('/').pop()?.toLowerCase().trim() : targetType.toLowerCase().trim() || 'pdf';
                }
            }

            // Fallback safety check
            if (!fileExtension || fileExtension.length > 4) {
                fileExtension = 'pdf';
            }

            // 4. Construct safe filename structures
            let baseName = targetName ? targetName.replace(/\.[^/.]+$/, "") : `Attachment_${id.substring(0, 5)}`;
            baseName = baseName.replace(/[^a-zA-Z0-9_\-]/g, '_');

            const fileName = `${baseName}_${Date.now()}.${fileExtension}`;
            const tempUri = `${FileSystem.cacheDirectory}${fileName}`;

            // 5. Download execution
            const downloadResumable = FileSystem.createDownloadResumable(targetUrl, tempUri);
            const { uri } = await downloadResumable.downloadAsync();

            await saveAndShareFile(uri, fileName);
        } catch (error) {
            console.error("Download error: ", error);
            Alert.alert("Error", "Failed to process download.");
        } finally {
            setDownloading(false);
        }
    };

    if (loading) return (
        <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
    );

    if (!task) return (
        <View style={styles.centerContainer}><Text>Task not found.</Text></View>
    );

    const statusStyle = getStatusStyles(task.status);
    const priorityStyle = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG['Medium'];

    return (
        <ScreenContainer style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {downloading && (
                <View style={styles.overlayLoader}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            )}

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={26} color={COLORS.textDark} />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Task Details</Text>

                {canEdit ? (
                    <TouchableOpacity onPress={() => router.push({ pathname: '/edit-task', params: { id: id } })}>
                        <Ionicons name="create-outline" size={26} color={COLORS.primary} />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 26 }} />
                )}
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>{task.name}</Text>
                <Text style={styles.taskID}>Task ID: {id.substring(0, 8).toUpperCase()}</Text>

                <View style={styles.metaRow}>
                    <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.bg }]}>
                        <Ionicons name={priorityStyle.icon} size={18} color={priorityStyle.text} />
                        <Text style={[styles.priorityText, { color: priorityStyle.text }]}>{task.priority}</Text>
                    </View>
                    <View style={styles.dateInfo}>
                        {task.startDate && (
                            <Text style={[styles.dateLabel, { marginBottom: 2 }]}>
                                Start: <Text style={styles.dateValue}>{formatDateTime(task.startDate)}</Text>
                            </Text>
                        )}
                        <Text style={styles.dateLabel}>
                            Due: <Text style={styles.dateValue}>{formatDateTime(task.dueDate)}</Text>
                        </Text>
                        <Text style={[styles.dateLabel, { marginTop: 2, fontSize: 11 }]}>
                            Created: <Text style={styles.dateValue}>{formatDate(task.createdDate)}</Text>
                        </Text>
                    </View>
                </View>

                <View style={styles.detailsCard}>
                    <Text style={styles.boldLabel}>Task Information</Text>
                    <DetailItem label="Customer" value={task.customer} isBold />
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

                <View style={styles.assignedSection}>
                    <Text style={styles.sectionTitle}>Assigned Engineers:</Text>
                    {task.assignedTo?.map((name, index) => (
                        <View key={index} style={styles.personRow}>
                            <View style={styles.avatar}><Text style={styles.avatarText}>{name.charAt(0)}</Text></View>
                            <Text style={styles.personName}>{name}</Text>
                        </View>
                    )) || <Text style={styles.noAssignment}>No one assigned yet</Text>}
                </View>

                {/* 🚀 FIXED ATTACHMENTS VIEW BLOCK WITH STRICT SCHEMA SENSITIVITY */}
                <View style={styles.attachmentSection}>
                    <Text style={styles.sectionTitle}>Attachments</Text>

                    {task.attachedFiles && Array.isArray(task.attachedFiles) && task.attachedFiles.length > 0 ? (
                        task.attachedFiles.map((file, index) => {
                            if (!file || !file.url) return null;

                            // Dynamically set correct icons
                            const isImage = ['jpg', 'jpeg', 'png', 'webp'].includes(file.type?.toLowerCase() || file.name?.split('.').pop()?.toLowerCase());
                            const iconName = isImage ? "image-outline" : "document-text-outline";

                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.attachmentCard}
                                    onPress={() => handleDownload(file)} // 👈 Pass full object map
                                    disabled={downloading}
                                >
                                    <View style={styles.attachmentInfo}>
                                        <Ionicons name={iconName} size={24} color={COLORS.primary} />
                                        <Text style={styles.fileName} numberOfLines={1}>
                                            {file.name || `Attachment ${index + 1}`}
                                        </Text>
                                    </View>
                                    <Ionicons name="download-outline" size={24} color={COLORS.textGray} />
                                </TouchableOpacity>
                            );
                        })
                    ) : task.attachedFile && typeof task.attachedFile === 'string' && task.attachedFile.trim() !== '' ? (
                        <TouchableOpacity
                            style={styles.attachmentCard}
                            onPress={() => handleDownload({ url: task.attachedFile, name: 'Attachment.png' })} // 🚀 Wrap in object container shape safely
                            disabled={downloading}
                        >
                            <View style={styles.attachmentInfo}>
                                <Ionicons name="image-outline" size={24} color={COLORS.primary} />
                                <Text style={styles.fileName}>Task Attachment (Legacy)</Text>
                            </View>
                            <Ionicons name="download-outline" size={24} color={COLORS.textGray} />
                        </TouchableOpacity>
                    ) : (
                        <Text style={styles.noAssignment}>No files attached.</Text>
                    )}
                </View>

                {canExport && (
                    <TouchableOpacity style={styles.savePdfButton} onPress={handleExportPDF} disabled={downloading}>
                        <Ionicons name="document-text-outline" size={20} color={COLORS.white} />
                        <Text style={styles.savePdfButtonText}>Save as PDF Report</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </ScreenContainer>
    );
}

const DetailItem = ({ label, value, isBold }) => (
    <View style={styles.detailItemRow}>
        <Text style={styles.infoLabel}>{label}: </Text>
        <Text style={[styles.infoValue, isBold && styles.infoValueBold]}>{value || 'N/A'}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark },
    backButton: { padding: 4 },
    content: { padding: 20 },
    title: { fontSize: 26, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 5 },
    taskID: { fontSize: 14, color: COLORS.textGray, marginBottom: 20 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
    priorityBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, marginRight: 15 },
    priorityText: { fontWeight: 'bold', marginLeft: 6, fontSize: 14 },
    dateInfo: { flex: 1 },
    dateLabel: { fontSize: 12, color: COLORS.textGray },
    dateValue: { color: COLORS.textDark, fontWeight: '600' },
    detailsCard: { backgroundColor: COLORS.cardBlue, borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: COLORS.borderBlue },
    boldLabel: { fontSize: 18, fontWeight: 'bold', color: '#003366', marginBottom: 15 },
    detailItemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' },
    infoLabel: { fontSize: 15, color: '#555', fontWeight: '500' },
    infoValue: { fontSize: 15, color: COLORS.textDark, flexShrink: 1 },
    infoValueBold: { fontWeight: 'bold' },
    inlineStatusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginLeft: 4 },
    statusTabText: { fontSize: 13, fontWeight: '700' },
    divider: { height: 1, backgroundColor: '#D6E4F0', marginVertical: 15 },
    descriptionLabel: { fontSize: 15, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 8 },
    descriptionText: { fontSize: 14, color: '#444', lineHeight: 22 },
    assignedSection: { backgroundColor: '#F8FAFC', borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#003366', marginBottom: 12 },
    personRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: COLORS.secondary },
    avatarText: { color: COLORS.secondary, fontWeight: 'bold', fontSize: 14 },
    personName: { fontSize: 16, color: COLORS.textDark, fontWeight: '500' },
    noAssignment: { fontSize: 14, color: '#94A3B8', fontStyle: 'italic', marginTop: 5 },
    attachmentSection: { backgroundColor: COLORS.cardBlue, borderRadius: 24, padding: 20, marginBottom: 40, borderWidth: 1, borderColor: COLORS.borderBlue },
    attachmentCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, padding: 15, borderRadius: 12, marginTop: 10, borderWidth: 1, borderColor: '#D6E4F0' },
    attachmentInfo: { flexDirection: 'row', alignItems: 'center' },
    fileName: { marginLeft: 10, fontSize: 16, color: COLORS.textDark, fontWeight: '500' },
    savePdfButton: { backgroundColor: COLORS.success, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, marginTop: 10, marginBottom: 30 },
    savePdfButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
    overlayLoader: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999
    }
});