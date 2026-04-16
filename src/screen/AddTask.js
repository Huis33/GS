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
                    <Ionicons name="close-outline" size={30} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Task</Text>
                <TouchableOpacity onPress={handleSaveTask} disabled={loading}>
                    {loading ? <ActivityIndicator size="small" color="#6389DA" /> : <Text style={styles.headerActionText}>Save</Text>}
                </TouchableOpacity>
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
                                    placeholder="Enter address or site"
                                />
                            </View>
                        </View>

                        <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                            <Text style={styles.label}>Due Date</Text>
                            <TouchableOpacity style={styles.inputWithIcon} onPress={openDatePicker}>
                                <Ionicons name="calendar-outline" size={20} color="#6389DA" />
                                <Text style={styles.flexInputText}>{dueDate.toLocaleDateString()} {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                            </TouchableOpacity>
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
                                <Text style={assignedEngineer ? styles.dropdownValue : styles.dropdownPlaceholder}>
                                    {assignedEngineer ? assignedEngineer.name : "Choose an engineer (Optional)"}
                                </Text>
                                <Ionicons name="person-add-outline" size={20} color="#888" />
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
                        <Text style={styles.modalTitle}>Select Engineer</Text>
                        <ScrollView>
                            <TouchableOpacity style={styles.modalItem} onPress={() => { setAssignedEngineer(null); setEngineerModalVisible(false); }}>
                                <Text style={styles.itemTitle}>Do Not Assign Yet</Text>
                            </TouchableOpacity>
                            {engineers.map((eng) => (
                                <TouchableOpacity key={eng.id} style={styles.modalItem} onPress={() => { setAssignedEngineer(eng); setEngineerModalVisible(false); }}>
                                    <View style={styles.engineerRow}>
                                        <View><Text style={styles.itemTitle}>{eng.name}</Text><Text style={styles.itemSubtitle}>{eng.skillSet || 'General Technician'}</Text></View>
                                        <View style={[styles.statusBadge, { backgroundColor: eng.availability === 'Available' ? '#E7F9ED' : '#FFEBEB' }]}>
                                            <Text style={[styles.statusText, { color: eng.availability === 'Available' ? '#1e8449' : '#c0392b' }]}>{eng.availability}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity onPress={() => setEngineerModalVisible(false)} style={styles.closeBtn}><Text style={styles.closeBtnText}>Cancel</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    row: { flexDirection: 'row' },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48
    },
    flexInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#1E293B' },
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
});