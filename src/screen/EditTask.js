import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { doc, getDoc, updateDoc, getDocs, collection, Timestamp } from 'firebase/firestore';
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
import { useUser } from '../context/UserContext';

export default function EditTaskScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const { id } = useLocalSearchParams(); // Get the Task ID from router params
    const { userData } = useUser();

    const [loading, setLoading] = useState(true); // Loading the initial data
    const [updating, setUpdating] = useState(false); // Saving the changes
    const isDirtyRef = useRef(false);

    // --- FORM STATES ---
    const [taskName, setTaskName] = useState('');
    const [description, setDescription] = useState('');
    const [customer, setCustomer] = useState('');
    const [contact, setContact] = useState('');
    const [location, setLocation] = useState('');
    const [selectedPDF, setSelectedPDF] = useState(null);
    const [existingPDFUrl, setExistingPDFUrl] = useState("");

    // Dynamic Data States
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
    const [engineers, setEngineers] = useState([]);
    const [assignedTo, setAssignedTo] = useState([]);
    const [isEngineerModalVisible, setEngineerModalVisible] = useState(false);
    const [dueDate, setDueDate] = useState(new Date());

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [pickerMode, setPickerMode] = useState('date');

    // --- FETCH EXISTING TASK & SETUP DATA ---
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // 1. Fetch Categories and Engineers (Same as NewTask)
                const catSnap = await getDocs(collection(db, 'priority'));
                const catList = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCategories(catList);

                const userSnap = await getDocs(collection(db, 'user'));
                const engineerData = userSnap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(u => u.role === 'Engineer');
                setEngineers(engineerData);

                // 2. Fetch the specific Task to Edit
                const docRef = doc(db, 'task', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();

                    // Security: Only allow creator to edit
                    if (data.createdBy !== auth.currentUser?.uid) {
                        Alert.alert("Access Denied", "You can only edit tasks you created.");
                        router.back();
                        return;
                    }

                    // Fill States
                    setTaskName(data.name || "");
                    setDescription(data.taskDescription || "");
                    setCustomer(data.customer || "");
                    setContact(data.contactNo || "");
                    setLocation(data.location || "");
                    setDueDate(data.dueDate.toDate());
                    setExistingPDFUrl(data.attachedFile || "");

                    // Match Category
                    const matchedCat = catList.find(c => c.categoryName === data.categoryName);
                    setSelectedCategory(matchedCat || null);

                    // Match Engineers
                    const matchedEngineers = engineerData.filter(eng =>
                        data.assignedIds?.includes(eng.id)
                    );
                    setAssignedTo(matchedEngineers);

                } else {
                    Alert.alert("Error", "Task not found.");
                    router.back();
                }
            } catch (error) {
                console.error(error);
                Alert.alert("Error", "Failed to load data.");
            } finally {
                setLoading(false);
                // Reset dirty ref after initial load
                setTimeout(() => { isDirtyRef.current = false; }, 500);
            }
        };

        fetchAllData();
    }, [id]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            if (!isDirtyRef.current || updating) return;

            // Prevent default behavior
            e.preventDefault();

            Alert.alert(
                "Unsaved Changes",
                "You have unsaved changes. Are you sure you want to leave?",
                [
                    { text: "Stay", style: "cancel", onPress: () => { } },
                    {
                        text: "Discard",
                        style: "destructive",
                        onPress: () => navigation.dispatch(e.data.action),
                    },
                ]
            );
        });
        return unsubscribe;
    }, [navigation]);

    // --- FORM LOGIC (REUSED FROM NEW TASK) ---
    const handleDatePickerChange = (event, selectedDate) => {
        if (event.type === 'dismissed') return;
        const currentDate = selectedDate || dueDate;
        setDueDate(currentDate);
        if (Platform.OS === 'android' && pickerMode === 'date') openPicker('time');
    };

    const openPicker = (mode) => {
        Keyboard.dismiss();
        if (Platform.OS === 'android') {
            DateTimePickerAndroid.open({
                value: dueDate,
                mode: mode,
                is24Hour: true,
                onChange: handleDatePickerChange,
            });
            return;
        }
        setPickerMode(mode);
        setShowDatePicker(true);
    };

    const handleUploadPDF = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
            if (!result.canceled) {
                setSelectedPDF(result.assets[0]);
                isDirtyRef.current = true;
            }
        } catch (error) {
            Alert.alert("Error", "Could not access storage.");
        }
    };

    const toggleEngineer = (engineer) => {
        isDirtyRef.current = true;
        setAssignedTo((prev) => {
            const isSelected = prev.find(item => item.id === engineer.id);
            return isSelected ? prev.filter(item => item.id !== engineer.id) : [...prev, engineer];
        });
    };

    // --- SAVE CHANGES ---
    const handleUpdateTask = async () => {
        const isFormValid = taskName.trim() !== '' && selectedCategory !== null;

        if (!isFormValid) {
            Alert.alert("Error", "Task Name and Category are required.");
            return;
        }

        setUpdating(true);
        try {
            const docRef = doc(db, 'task', id);
            const updatedData = {
                name: taskName,
                taskDescription: description,
                location: location,
                customer: customer,
                contactNo: contact,
                categoryName: selectedCategory.categoryName,
                priority: selectedCategory.category,
                dueDate: Timestamp.fromDate(dueDate),
                status: assignedTo.length > 0 ? "Not Yet Started" : "Not Yet Assigned",
                assignedTo: assignedTo.map(e => e.name),
                assignedIds: assignedTo.map(e => e.id),
                hasAttachment: !!selectedPDF || !!existingPDFUrl,
                attachedFile: selectedPDF ? selectedPDF.uri : existingPDFUrl,
                lastEditedAt: Timestamp.now(),
            };

            await updateDoc(docRef, updatedData);
            isDirtyRef.current = false;
            Alert.alert("Success", "Task updated successfully!");
            router.back();
        } catch (error) {
            Alert.alert("Error", "Failed to update task.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#6389DA" />
                <Text style={{ marginTop: 10, color: '#94A3B8' }}>Loading task details...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="close-outline" size={30} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Task</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Reuse your exactly same JSX cards here */}
                    <Text style={styles.sectionHeader}>TASK INFORMATION</Text>
                    <View style={styles.card}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Task Name</Text>
                            <TextInput
                                style={styles.input}
                                value={taskName}
                                onChangeText={(t) => { setTaskName(t); isDirtyRef.current = true; }}
                            />
                        </View>
                        <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>Description</Text>
                                <Text style={styles.charCount}>{description.length}/500</Text>
                            </View>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                multiline
                                value={description}
                                onChangeText={(t) => { setDescription(t); isDirtyRef.current = true; }}
                            />
                        </View>
                    </View>

                    <Text style={styles.sectionHeader}>LOGISTICS & CLIENT</Text>
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>Customer</Text>
                                <TextInput style={styles.input} value={customer} onChangeText={(t) => { setCustomer(t); isDirtyRef.current = true; }} />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Contact No.</Text>
                                <TextInput style={styles.input} value={contact} onChangeText={(t) => { setContact(t); isDirtyRef.current = true; }} keyboardType="phone-pad" />
                            </View>
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Location</Text>
                            <View style={styles.inputWithIcon}>
                                <Ionicons name="location-outline" size={20} color="#6389DA" />
                                <TextInput style={styles.flexInput} value={location} onChangeText={(t) => { setLocation(t); isDirtyRef.current = true; }} />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Due Date & Time</Text>
                            <View style={styles.row}>
                                <TouchableOpacity style={[styles.inputWithIcon, { flex: 1, marginRight: 8 }]} onPress={() => openPicker('date')}>
                                    <Ionicons name="calendar-outline" size={18} color="#6389DA" />
                                    <Text style={styles.flexInputText}>{dueDate.toLocaleDateString()}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.inputWithIcon, { flex: 1, marginLeft: 8 }]} onPress={() => openPicker('time')}>
                                    <Ionicons name="time-outline" size={18} color="#6389DA" />
                                    <Text style={styles.flexInputText}>
                                        {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.sectionHeader}>CLASSIFICATION</Text>
                    <View style={styles.card}>
                        {/* Category Label */}
                        <Text style={styles.label}>Task Category</Text>
                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() => setCategoryModalVisible(true)}
                        >
                            <Text style={selectedCategory ? styles.dropdownValue : styles.dropdownPlaceholder}>
                                {selectedCategory ? `${selectedCategory.categoryName} (${selectedCategory.category})` : "Select a category"}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#888" />
                        </TouchableOpacity>

                        {/* Engineer Label */}
                        <Text style={[styles.label, { marginTop: 20 }]}>Assigned Engineers</Text>
                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() => setEngineerModalVisible(true)}
                        >
                            <Text style={assignedTo.length > 0 ? styles.dropdownValue : styles.dropdownPlaceholder}>
                                {assignedTo.length > 0 ? assignedTo.map(e => e.name).join(', ') : "Choose engineers (Optional)"}
                            </Text>
                            <Ionicons name="people-outline" size={20} color="#888" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.attachmentBtn} onPress={handleUploadPDF}>
                        <Ionicons name="document-attach-outline" size={20} color="#6389DA" />
                        <Text style={styles.attachmentBtnText}>
                            {selectedPDF ? selectedPDF.name : (existingPDFUrl ? "Change Attachment" : "Attach Documentation (PDF)")}
                        </Text>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveButton, { flex: 1 }, updating && { opacity: 0.7 }]}
                    onPress={handleUpdateTask}
                    disabled={updating}
                >
                    {updating ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.saveButtonText}>Update Task</Text>}
                </TouchableOpacity>
            </View>

            <Modal visible={isCategoryModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Category</Text>
                        <ScrollView style={styles.modalScrollView}>
                            {categories.map((cat) => (
                                <TouchableOpacity 
                                    key={cat.id} 
                                    style={[
                                        styles.modalItem, 
                                        selectedCategory?.id === cat.id && styles.selectedItem
                                    ]}
                                    onPress={() => {
                                        setSelectedCategory(cat);
                                        setCategoryModalVisible(false);
                                        isDirtyRef.current = true; // Mark as dirty
                                    }}
                                >
                                    <Text style={styles.itemTitle}>{cat.categoryName}</Text>
                                    <Text style={styles.itemSubtitle}>{cat.category}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity onPress={() => setCategoryModalVisible(false)} style={styles.closeBtn}>
                            <Text style={styles.closeBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* --- 5. ENGINEER MODAL --- */}
            <Modal visible={isEngineerModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Assign Engineers</Text>
                        <ScrollView style={styles.modalScrollView}>
                            {engineers.map((eng) => {
                                const isSelected = assignedTo.some(item => item.id === eng.id);
                                return (
                                    <TouchableOpacity 
                                        key={eng.id} 
                                        style={[styles.engineerCard, isSelected && styles.selectedEngineerCard]}
                                        onPress={() => toggleEngineer(eng)}
                                    >
                                        <View style={styles.engineerInfo}>
                                            <Text style={styles.itemTitle}>{eng.name}</Text>
                                            <Text style={styles.itemSubtitle}>{eng.username}</Text>
                                        </View>
                                        {isSelected && <Ionicons name="checkmark-circle" size={24} color="#6389DA" />}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity 
                                style={styles.confirmButton} 
                                onPress={() => setEngineerModalVisible(false)}
                            >
                                <Text style={styles.confirmButtonText}>Confirm Selection ({assignedTo.length})</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
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
    footer: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', alignItems: 'center', },
    resetButton: { flex: 1, height: 54, justifyContent: 'center', alignItems: 'center', marginRight: 12, },
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