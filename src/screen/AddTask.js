import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker'; // Required dependency
import { useRouter, useNavigation } from 'expo-router';
import { addDoc, collection, getDocs, Timestamp } from 'firebase/firestore';
import React, { useEffect, useState, useRef } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../firebaseConfig';

export default function NewTaskScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const isDirtyRef = useRef(false);

    // --- FORM STATES ---
    const [taskName, setTaskName] = useState('');
    const [description, setDescription] = useState('');
    const [customer, setCustomer] = useState('');
    const [contact, setContact] = useState('');
    const [location, setLocation] = useState(''); // Changed to text input
    const [selectedPDF, setSelectedPDF] = useState(null);

    // Dynamic Data States
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
    const [engineers, setEngineers] = useState([]);
    const [assignedTo, setAssignedTo] = useState([]);
    const [isEngineerModalVisible, setEngineerModalVisible] = useState(false);

    const [dueDate, setDueDate] = useState(() => {
        const d = new Date();
        d.setHours(23, 59, 59, 999);
        return d;
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [pickerMode, setPickerMode] = useState('date');

    const handleDatePickerChange = (event, selectedDate) => {
        if (event.type === 'dismissed') return;

        const currentDate = selectedDate || dueDate;
        setDueDate(currentDate);

        // AUTO-OPEN TIME PICKER ON ANDROID
        if (Platform.OS === 'android' && pickerMode === 'date') {
            openPicker('time');
        }
    };

    // --- UPDATED DATE/TIME LOGIC ---
    const openPicker = (mode) => {
        Keyboard.dismiss();
        if (Platform.OS === 'android') {
            DateTimePickerAndroid.open({
                value: dueDate,
                mode: mode, // 'date' or 'time'
                is24Hour: true,
                onChange: handleDatePickerChange,
            });
            return;
        }
        // For iOS, you might need a separate state for showDatePicker 
        // or use a modal, but this logic handles the mode selection:
        setPickerMode(mode);
        setShowDatePicker(true);
    };

    const handleReset = () => {
        Alert.alert(
            "Reset Form",
            "Are you sure you want to clear all fields?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset", style: "destructive", onPress: () => {
                        setTaskName('');
                        setDescription('');
                        setCustomer('');
                        setContact('');
                        setLocation('');
                        setSelectedPDF(null);
                        setSelectedCategory(null);
                        setAssignedEngineer(null);
                        const d = new Date();
                        d.setHours(23, 59, 59, 999);
                        setDueDate(d);
                    }
                }
            ]
        );
    };

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Priorities (Categories)
                const catSnap = await getDocs(collection(db, 'priority'));
                setCategories(catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // 2. Fetch Engineers
                const userSnap = await getDocs(collection(db, 'user'));
                const engineerData = userSnap.docs
                    .map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                    .filter(u => u.role === 'Engineer');

                setEngineers(engineerData);

            } catch (error) {
                console.error("Error fetching data:", error);
                Alert.alert("Error", "Failed to load engineers or categories.");
            }
        };

        fetchData();
    }, []);

    // This effect runs whenever these values change
    useEffect(() => {
        // Check if any field has been modified from its initial state
        const hasTaskName = taskName.trim().length > 0;
        const hasDescription = description.trim().length > 0;
        const hasCustomer = customer.trim().length > 0;
        const hasContact = contact.trim().length > 0;
        const hasLocation = location.trim().length > 0;
        const hasCategory = selectedCategory !== null;
        const hasEngineers = assignedTo.length > 0;
        const hasPDF = selectedPDF !== null;

        // Optional: Check if date has changed from the initial "end of day" default
        // This part is tricky because 'dueDate' is an object. 
        // Usually, checking if the user touched the name/category is enough.

        if (hasTaskName || hasDescription || hasCustomer || hasContact ||
            hasLocation || hasCategory || hasEngineers || hasPDF) {
            isDirtyRef.current = true;
        } else {
            isDirtyRef.current = false;
        }
    }, [
        taskName, description, customer, contact,
        location, selectedCategory, assignedTo, selectedPDF
    ]);

    const handleUploadPDF = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });
            if (!result.canceled) {
                setSelectedPDF(result.assets[0]);
            }
        } catch (error) {
            Alert.alert("Error", "Could not access storage.");
        }
    };

    const handleSaveTask = async () => {
        // 1. Validation for ALL compulsory fields
        const isFormValid =
            taskName.trim() !== '' &&
            description.trim() !== '' &&
            customer.trim() !== '' &&
            contact.trim() !== '' &&
            location.trim() !== '' &&
            selectedCategory !== null;

        if (!isFormValid) {
            Alert.alert(
                "Missing Information",
                "Please fill in all required fields:\n• Task Name\n• Description\n• Customer\n• Contact No.\n• Location\n• Category"
            );
            return;
        }

        setLoading(true);
        try {
            const currentUser = auth.currentUser;
            const newTask = {
                name: taskName,
                taskDescription: description,
                location: location,
                customer: customer,
                contactNo: contact,
                categoryName: selectedCategory.categoryName,
                priority: selectedCategory.category,
                dueDate: Timestamp.fromDate(dueDate),
                // Status Logic: Changes if an engineer is assigned
                status: assignedTo.length > 0 ? "Not Yet Started" : "Not Yet Assigned",
                assignedTo: assignedTo.map(e => e.name),
                assignedIds: assignedTo.map(e => e.id),
                hasAttachment: !!selectedPDF,
                attachedFile: selectedPDF ? selectedPDF.uri : "",
                createdDate: Timestamp.now(),
                createdBy: currentUser?.uid || "Anonymous",
                creatorName: currentUser?.displayName || "System User"
            };

            await addDoc(collection(db, 'task'), newTask);
            Alert.alert("Success", "Task created successfully!");
            isDirtyRef.current = false;
            router.back();
        } catch (error) {
            Alert.alert("Error", "Failed to save task.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleEngineer = (engineer) => {
        setAssignedTo((prev) => {
            const isSelected = prev.find(item => item.id === engineer.id);
            if (isSelected) {
                // Remove if already selected
                return prev.filter(item => item.id !== engineer.id);
            } else {
                // Add if not selected
                return [...prev, engineer];
            }
        });
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            // If the ref is false, we just let the user navigate away
            if (!isDirtyRef.current) {
                return;
            }

            // If changes exist, stop the navigation and show the alert
            e.preventDefault();

            Alert.alert(
                'Unsaved Changes',
                'You have started filling out this task. Are you sure you want to discard your progress?',
                [
                    { text: "Stay", style: 'cancel', onPress: () => { } },
                    {
                        text: 'Discard',
                        style: 'destructive',
                        // This tells the navigator to resume the action we stopped
                        onPress: () => navigation.dispatch(e.data.action),
                    },
                ]
            );
        });

        return unsubscribe;
    }, [navigation]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close-outline" size={30} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Task</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Section: Primary Information */}
                    <Text style={styles.sectionHeader}>TASK INFORMATION</Text>
                    <View style={styles.card}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Task Name</Text>
                            <TextInput
                                style={styles.input}
                                value={taskName}
                                onChangeText={setTaskName}
                                placeholder="e.g. System Maintenance"
                                placeholderTextColor="#AAA"
                            />
                        </View>

                        <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>Description</Text>
                                <Text style={styles.charCount}>{description.length}/500</Text>
                            </View>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Provide context or instructions..."
                                placeholderTextColor="#AAA"
                                multiline
                                value={description}
                                onChangeText={(t) => t.length <= 500 && setDescription(t)}
                            />
                        </View>
                    </View>

                    {/* Section: Client & Logistics */}
                    <Text style={styles.sectionHeader}>LOGISTICS & CLIENT</Text>
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>Customer</Text>
                                <TextInput style={styles.input} value={customer} onChangeText={setCustomer} placeholder="Name" />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Contact No.</Text>
                                <TextInput style={styles.input} value={contact} onChangeText={setContact} placeholder="01X-XXX" keyboardType="phone-pad" />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Location</Text>
                            <View style={styles.inputWithIcon}>
                                <Ionicons name="location-outline" size={20} color="#6389DA" />
                                <TextInput
                                    style={styles.flexInput}
                                    value={location}
                                    onChangeText={setLocation}
                                    placeholder="Enter location"
                                />
                            </View>
                        </View>

                        {/* Section: Split Date & Time */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Due Date & Time</Text>
                            <View style={styles.row}>
                                {/* Date Input */}
                                <TouchableOpacity
                                    style={[styles.inputWithIcon, { flex: 1, marginRight: 8 }]}
                                    onPress={() => openPicker('date')}
                                >
                                    <Ionicons name="calendar-outline" size={18} color="#6389DA" />
                                    <Text style={styles.flexInputText}>
                                        {dueDate.toLocaleDateString()}
                                    </Text>
                                </TouchableOpacity>

                                {/* Time Input */}
                                <TouchableOpacity
                                    style={[styles.inputWithIcon, { flex: 1, marginLeft: 8 }]}
                                    onPress={() => openPicker('time')}
                                >
                                    <Ionicons name="time-outline" size={18} color="#6389DA" />
                                    <Text style={styles.flexInputText}>
                                        {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Section: Assignment */}
                    <Text style={styles.sectionHeader}>CLASSIFICATION</Text>
                    <View style={styles.card}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Category</Text>
                            <TouchableOpacity style={styles.dropdown} onPress={() => setCategoryModalVisible(true)}>
                                <Text style={selectedCategory ? styles.dropdownValue : styles.dropdownPlaceholder}>
                                    {selectedCategory ? `${selectedCategory.categoryName} (${selectedCategory.category})` : "Select a category"}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#888" />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                            <Text style={styles.label}>Assign Engineer</Text>
                            <TouchableOpacity style={styles.dropdown} onPress={() => setEngineerModalVisible(true)}>
                                <Text style={assignedTo.length > 0 ? styles.dropdownValue : styles.dropdownPlaceholder}>
                                    {assignedTo.length > 0
                                        ? assignedTo.map(e => e.name).join(', ')
                                        : "Choose engineers (Optional)"}
                                </Text>
                                <Ionicons name="people-outline" size={20} color="#888" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.attachmentBtn} onPress={handleUploadPDF}>
                        <Ionicons name="document-attach-outline" size={20} color="#6389DA" />
                        <Text style={styles.attachmentBtnText}>
                            {selectedPDF ? selectedPDF.name : "Attach Documentation (PDF)"}
                        </Text>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                    <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.saveButton, loading && { opacity: 0.7 }]}
                    onPress={handleSaveTask}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Text style={styles.saveButtonText}>Create Task</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Modals remain the same logic as your original code */}
            <Modal visible={isCategoryModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Category</Text>
                        <ScrollView>
                            {categories.map((item) => (
                                <TouchableOpacity key={item.id} style={styles.modalItem} onPress={() => { setSelectedCategory(item); setCategoryModalVisible(false); }}>
                                    <Text style={styles.itemTitle}>{item.categoryName}</Text>
                                    <Text style={styles.itemSubtitle}>Priority: {item.category}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity onPress={() => setCategoryModalVisible(false)} style={styles.closeBtn}><Text style={styles.closeBtnText}>Cancel</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal visible={isEngineerModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Assign Engineers</Text>
                            <TouchableOpacity onPress={() => setEngineerModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                            {engineers.map((eng) => {
                                const isSelected = assignedTo.some(item => item.id === eng.id);
                                return (
                                    <TouchableOpacity
                                        key={eng.id}
                                        style={[styles.engineerCard, isSelected && styles.selectedEngineerCard]}
                                        onPress={() => toggleEngineer(eng)}
                                    >
                                        <View style={styles.engineerInfo}>
                                            <Text style={[styles.itemTitle, isSelected && { color: '#6389DA' }]}>
                                                {eng.name}
                                            </Text>
                                            <Text style={styles.itemSubtitle}>{eng.skillSet || 'General Technician'}</Text>
                                        </View>

                                        <View style={styles.engineerStatus}>
                                            {isSelected ? (
                                                <Ionicons name="checkmark-circle" size={24} color="#6389DA" />
                                            ) : (
                                                <View style={[styles.statusBadge, { backgroundColor: eng.availability === 'Available' ? '#E7F9ED' : '#FFEBEB' }]}>
                                                    <Text style={[styles.statusText, { color: eng.availability === 'Available' ? '#1e8449' : '#c0392b' }]}>
                                                        {eng.availability}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                onPress={() => setEngineerModalVisible(false)}
                                style={styles.confirmButton}
                            >
                                <Text style={styles.confirmButtonText}>
                                    Confirm Selection {assignedTo.length > 0 ? `(${assignedTo.length})` : ''}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* iOS Date/Time Picker Modal */}
            {Platform.OS === 'ios' && (
                <Modal
                    visible={showDatePicker}
                    transparent={true}
                    animationType="slide"
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.iosPickerContainer}>
                            <View style={styles.iosPickerHeader}>
                                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                    <Text style={styles.iosDoneText}>Done</Text>
                                </TouchableOpacity>
                            </View>

                            <DateTimePicker
                                value={dueDate}
                                mode={pickerMode}
                                display="spinner"
                                onChange={(event, date) => {
                                    if (date) setDueDate(date);
                                }}
                            />
                        </View>
                    </View>
                </Modal>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0'
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
    headerActionText: { fontSize: 16, fontWeight: '600', color: '#6389DA' },
    backButton: { padding: 4 },
    scrollContent: { padding: 16 },
    sectionHeader: { fontSize: 12, fontWeight: '700', color: '#94A3B8', marginBottom: 8, marginLeft: 4, letterSpacing: 1 },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
    },
    inputGroup: { marginBottom: 20 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
    charCount: { fontSize: 11, color: '#94A3B8' },
    input: {
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#1E293B'
    },
    textArea: { height: 100, textAlignVertical: 'top' },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        paddingHorizontal: 10,
        height: 48
    },
    flexInput: { flex: 1, marginLeft: 6, fontSize: 14, color: '#1E293B' },
    flexInputText: { flex: 1, marginLeft: 8, fontSize: 15, color: '#1E293B' },
    dropdown: {
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    dropdownValue: { fontSize: 15, color: '#1E293B' },
    dropdownPlaceholder: { fontSize: 15, color: '#94A3B8' },
    attachmentBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: '#6389DA',
        borderStyle: 'dashed',
        borderRadius: 16,
        backgroundColor: '#F0F7FF'
    },
    attachmentBtnText: { marginLeft: 8, color: '#6389DA', fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
    modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20, color: '#1E293B' },
    modalItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    itemTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
    itemSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
    closeBtn: { marginTop: 20, alignItems: 'center', paddingBottom: 10 },
    closeBtnText: { color: '#6389DA', fontWeight: '700', fontSize: 16 },
    engineerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
    footer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 20,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        alignItems: 'center',
    },
    resetButton: {
        flex: 1,
        height: 54,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    resetButtonText: {
        color: '#94A3B8',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        flex: 2,
        height: 54,
        backgroundColor: '#6389DA',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#6389DA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    iosPickerContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 40, // Space for the bottom of the screen
    },
    iosPickerHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    iosDoneText: {
        color: '#6389DA',
        fontWeight: '700',
        fontSize: 16,
    },
    selectedItem: {
        backgroundColor: '#F0F7FF', // Light blue tint
        borderColor: '#6389DA',
        borderLeftWidth: 4,
    },
    // --- Modal Specific Styles ---
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalScrollView: {
        marginBottom: 10,
    },
    engineerCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    selectedEngineerCard: {
        backgroundColor: '#F0F7FF',
        borderColor: '#6389DA',
        // Adds that nice blue accent line on the left
        borderLeftWidth: 4,
    },
    engineerInfo: {
        flex: 1, // This prevents the text from pushing icons off screen
    },
    engineerStatus: {
        marginLeft: 12,
        alignItems: 'flex-end',
    },
    modalFooter: {
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 20 : 0, // Extra space for iPhone home bar
    },
    confirmButton: {
        backgroundColor: '#6389DA',
        borderRadius: 14,
        height: 54,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});