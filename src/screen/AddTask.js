import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker'; // Required dependency
import { useRouter } from 'expo-router';
import { addDoc, collection, getDocs, Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
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
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../firebaseConfig';

export default function NewTaskScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

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
    const [assignedEngineer, setAssignedEngineer] = useState(null);
    const [isEngineerModalVisible, setEngineerModalVisible] = useState(false);

    const [dueDate, setDueDate] = useState(() => {
        const d = new Date();
        d.setHours(23, 59, 59, 999);
        return d;
    });
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleDatePickerChange = (event, date) => {
        // Android emits "dismissed" when user closes without selecting.
        if (event?.type === 'dismissed') {
            setShowDatePicker(false);
            return;
        }
        setShowDatePicker(false);
        if (date) setDueDate(date);
    };

    const openDatePicker = () => {
        if (Platform.OS === 'android') {
            DateTimePickerAndroid.open({
                value: dueDate,
                mode: 'date',
                is24Hour: true,
                onChange: handleDatePickerChange,
            });
            return;
        }
        setShowDatePicker(true);
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
        if (!taskName || !selectedCategory) {
            Alert.alert("Required", "Please fill in Task Name and Category.");
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
                status: assignedEngineer ? "Not Yet Started" : "Not Yet Assigned",
                assignedTo: assignedEngineer ? assignedEngineer.name : "",
                hasAttachment: !!selectedPDF,
                attachedFile: selectedPDF ? selectedPDF.uri : "", // In production, upload to Storage first
                createdDate: Timestamp.now(),
                createdBy: currentUser?.uid || "Anonymous",
                creatorName: currentUser?.displayName || "System User"
            };

            await addDoc(collection(db, 'task'), newTask);
            Alert.alert("Success", "Task created successfully!");
            router.back();
        } catch (error) {
            Alert.alert("Error", "Failed to save task.");
            console.error(error);
        } finally {
            setLoading(false);
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

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.formCard}>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Task Name</Text>
                            <TextInput
                                style={styles.input}
                                value={taskName}
                                onChangeText={setTaskName}
                                placeholder="Enter Task Name"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>Description</Text>
                                <Text style={styles.charCount}>{description.length}/500</Text>
                            </View>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Enter details..."
                                multiline
                                value={description}
                                onChangeText={(t) => t.length <= 500 && setDescription(t)}
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1.5, marginRight: 10 }]}>
                                <Text style={styles.label}>Customer</Text>
                                <TextInput style={styles.input} value={customer} onChangeText={setCustomer} placeholder="Danny" />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Contact No.</Text>
                                <TextInput style={styles.input} value={contact} onChangeText={setContact} placeholder="011..." />
                            </View>
                        </View>

                        {/* Schedule & Location */}
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>Due Date</Text>
                                <TouchableOpacity style={styles.dropdown} onPress={openDatePicker}>
                                    <Text style={styles.dropdownText}>{dueDate.toLocaleString()}</Text>
                                    <Ionicons name="calendar-outline" size={20} color="#333" />
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Location</Text>
                                <TextInput
                                    style={styles.input}
                                    value={location}
                                    onChangeText={setLocation}
                                    placeholder="Enter Location"
                                />
                            </View>
                        </View>

                        {Platform.OS === 'ios' && showDatePicker && (
                            <DateTimePicker
                                value={dueDate}
                                mode="datetime"
                                is24Hour={true}
                                onChange={handleDatePickerChange}
                            />
                        )}

                        {/* Category Dropdown (With Priority Display) */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Task Category</Text>
                            <TouchableOpacity
                                style={styles.dropdown}
                                onPress={() => setCategoryModalVisible(true)}
                            >
                                <Text style={styles.dropdownText}>
                                    {selectedCategory
                                        ? `${selectedCategory.categoryName} (${selectedCategory.category})`
                                        : "Select Category"}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {/* Task Status (Static Logic Display) */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Task Status</Text>
                            <View style={[styles.input, styles.disabledInput]}>
                                <Text style={styles.disabledInputText}>
                                    {assignedEngineer ? "Not Yet Started" : "Not Yet Assigned"}
                                </Text>
                            </View>
                        </View>

                        {/* Assign To Dropdown */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Assign To:</Text>
                            <TouchableOpacity
                                style={styles.dropdown}
                                onPress={() => setEngineerModalVisible(true)}
                            >
                                <Text style={styles.dropdownText}>
                                    {assignedEngineer ? assignedEngineer.name : "Select Engineer (Optional)"}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.uploadButton} onPress={handleUploadPDF}>
                            <Text style={styles.uploadButtonText}>
                                {selectedPDF ? `File: ${selectedPDF.name}` : "Upload PDF (Optional)"}
                            </Text>
                        </TouchableOpacity>

                        {/* Bottom Actions */}
                        <View style={styles.bottomActions}>
                            <TouchableOpacity style={styles.resetButton} onPress={() => router.replace('/new-task')}>
                                <Text style={styles.resetButtonText}>Reset</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.saveButton} onPress={handleSaveTask} disabled={loading}>
                                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* --- MODAL FOR CATEGORY DROPDOWN --- */}
            <Modal visible={isCategoryModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Category</Text>
                        <ScrollView>
                            {categories.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setSelectedCategory(item);
                                        setCategoryModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.itemTitle}>{item.categoryName}</Text>
                                    <Text style={styles.itemSubtitle}>Priority: {item.category}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity onPress={() => setCategoryModalVisible(false)} style={styles.closeBtn}>
                            <Text style={{ color: '#6389DA', fontWeight: 'bold' }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* --- MODAL FOR ENGINEER DROPDOWN --- */}
            <Modal visible={isEngineerModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Engineer</Text>
                        <ScrollView>
                            <TouchableOpacity
                                style={styles.modalItem}
                                onPress={() => { setAssignedEngineer(null); setEngineerModalVisible(false); }}
                            >
                                <Text style={styles.itemTitle}>Do Not Assign Yet</Text>
                            </TouchableOpacity>
                            {engineers.map((eng) => (
                                <TouchableOpacity
                                    key={eng.id}
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setAssignedEngineer(eng);
                                        setEngineerModalVisible(false);
                                    }}
                                >
                                    <View style={styles.engineerRow}>
                                        <View>
                                            <Text style={styles.itemTitle}>{eng.name}</Text>
                                            <Text style={styles.itemSubtitle}>{eng.skillSet || 'General Technician'}</Text>
                                        </View>

                                        {/* Availability Tag */}
                                        <View style={[
                                            styles.statusBadge,
                                            { backgroundColor: eng.availability === 'Available' ? '#E7F9ED' : '#FFEBEB' }
                                        ]}>
                                            <View style={[
                                                styles.statusDot,
                                                { backgroundColor: eng.availability === 'Available' ? '#2ecc71' : '#e74c3c' }
                                            ]} />
                                            <Text style={[
                                                styles.statusText,
                                                { color: eng.availability === 'Available' ? '#1e8449' : '#c0392b' }
                                            ]}>
                                                {eng.availability || 'Unknown'}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity onPress={() => setEngineerModalVisible(false)} style={styles.closeBtn}>
                            <Text style={{ color: '#6389DA', fontWeight: 'bold', marginTop: 10 }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
    headerTitle: { fontSize: 22, fontWeight: 'bold' },
    backButton: { padding: 4 },
    scrollContent: { padding: 15 },
    formCard: { backgroundColor: '#F0F7FF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E1E9F5' },
    inputGroup: { marginBottom: 18 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between' },
    label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    charCount: { fontSize: 12, color: '#999' },
    input: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: '#D6E4F0' },
    textArea: { height: 100, textAlignVertical: 'top' },
    row: { flexDirection: 'row' },
    dropdown: { backgroundColor: '#fff', borderRadius: 12, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#D6E4F0' },
    dropdownText: { fontSize: 14, color: '#333' },
    disabledInput: { backgroundColor: '#E8E8E8', borderColor: '#CCC' },
    disabledInputText: { color: '#777' },
    uploadButton: { backgroundColor: '#6389DA', borderRadius: 25, paddingVertical: 14, alignItems: 'center', marginTop: 10, marginBottom: 25 },
    uploadButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    bottomActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    resetButton: { flex: 1, alignItems: 'center', paddingVertical: 12 },
    resetButtonText: { color: '#333', fontSize: 16, fontWeight: '500' },
    saveButton: { flex: 1, backgroundColor: '#6389DA', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginLeft: 20 },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    // Modal Styles for Dropdowns
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 20, padding: 20, maxHeight: '70%' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
    itemTitle: { fontSize: 16, color: '#333' },
    itemSubtitle: { fontSize: 13, color: '#888' },
    closeBtn: { marginTop: 15, alignItems: 'center' },
    engineerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize'
    },
});