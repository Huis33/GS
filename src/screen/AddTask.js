import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker'; // Required dependency
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function NewTaskScreen() {
    const router = useRouter();

    // We only use state for the PDF for now to verify the button works
    const [selectedPDF, setSelectedPDF] = useState(null);

    const handleUploadPDF = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (!result.canceled) {
                const file = result.assets[0];
                setSelectedPDF(file); // Store the file object

                Alert.alert(
                    "Success",
                    `Selected: ${file.name}\nSize: ${(file.size / 1024 / 1024).toFixed(2)} MB`
                );
            }
        } catch (error) {
            Alert.alert("Error", "Could not access storage.");
            console.error(error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={26} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Task</Text>
                <View style={{ width: 26 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.formCard}>
                        {/* Static Placeholder Data */}
                        <Text style={styles.taskIDText}>TaskID: T098764567</Text>

                        {/* Task Name - REMAINING FAKE UI */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Task Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="System Validation and Verification"
                                placeholderTextColor="#999"
                            />
                        </View>

                        {/* Description - REMAINING FAKE UI */}
                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>Description</Text>
                                <Text style={styles.charCount}>34/100</Text>
                            </View>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="-"
                                placeholderTextColor="#999"
                                multiline
                            />
                        </View>

                        {/* Customer & Contact - REMAINING FAKE UI */}
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1.5, marginRight: 10 }]}>
                                <Text style={styles.label}>Customer</Text>
                                <TextInput style={styles.input} placeholder="Danny" placeholderTextColor="#999" />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Contact No.</Text>
                                <TextInput style={styles.input} placeholder="011-1066 1872" placeholderTextColor="#999" />
                            </View>
                        </View>

                        {/* Schedule & Location - REMAINING FAKE UI */}
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>Schedule (Due Date)</Text>
                                <TouchableOpacity style={styles.dropdown}>
                                    <Text style={styles.dropdownText}>Select Date</Text>
                                    <Ionicons name="chevron-down" size={20} color="#333" />
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Location</Text>
                                <TouchableOpacity style={styles.dropdown}>
                                    <Text style={styles.dropdownText}>-</Text>
                                    <Ionicons name="chevron-down" size={20} color="#333" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Task Category & Status - REMAINING FAKE UI */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Task Category</Text>
                            <TouchableOpacity style={styles.dropdown}>
                                <Text style={styles.dropdownText}>Select</Text>
                                <Ionicons name="chevron-down" size={20} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Task Status</Text>
                            <View style={[styles.input, styles.disabledInput]}>
                                <Text style={styles.disabledInputText}>Not Yet Assigned</Text>
                            </View>
                        </View>

                        {/* Assign To - REMAINING FAKE UI */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Assign To:</Text>
                            <TouchableOpacity style={styles.dropdown}>
                                <Text style={styles.dropdownText}>Select Engineer</Text>
                                <Ionicons name="chevron-down" size={20} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {/* Upload PDF Button - NOW FUNCTIONAL */}
                        <TouchableOpacity
                            style={styles.uploadButton}
                            onPress={handleUploadPDF}
                        >
                            <Text style={styles.uploadButtonText} numberOfLines={1}>
                                {selectedPDF ? `File: ${selectedPDF.name}` : "Upload PDF"}
                            </Text>
                        </TouchableOpacity>

                        {/* Bottom Action Buttons */}
                        <View style={styles.bottomActions}>
                            <TouchableOpacity style={styles.resetButton} onPress={() => setSelectedPDF(null)}>
                                <Text style={styles.resetButtonText}>Reset</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.saveButton} onPress={() => Alert.alert("Note", "Saving is not connected to DB yet.")}>
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

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
        borderBottomColor: '#EEE'
    },
    headerTitle: { fontSize: 22, fontWeight: 'bold' },
    backButton: { padding: 4 },
    scrollContent: { padding: 15 },

    formCard: {
        backgroundColor: '#F0F7FF',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E1E9F5'
    },
    taskIDText: { fontSize: 13, color: '#666', marginBottom: 15 },

    inputGroup: { marginBottom: 18 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between' },
    label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    charCount: { fontSize: 12, color: '#999' },

    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#D6E4F0'
    },
    textArea: { height: 80, textAlignVertical: 'top' },
    row: { flexDirection: 'row' },

    dropdown: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D6E4F0'
    },
    dropdownText: { fontSize: 15, color: '#999' },
    disabledInput: { backgroundColor: '#E0E0E0', borderColor: '#CCC' },
    disabledInputText: { color: '#777' },

    uploadButton: {
        backgroundColor: '#6389DA',
        borderRadius: 25,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 25
    },
    uploadButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    // New Styles for Reset and Save
    bottomActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5
    },
    resetButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12
    },
    resetButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '500'
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#6389DA',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        marginLeft: 20,
        // Added shadow to match the elevation in the image
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    }
});