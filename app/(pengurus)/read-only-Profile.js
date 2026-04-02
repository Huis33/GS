import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect, useRef } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    TouchableOpacity,
    Modal,
    FlatList,
    Alert,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from 'expo-router';
import { useUser } from '../../src/context/UserContext'; // 
import { updateUserStatus } from '../../src/service/UserService';

export default function EditProfileScreen() {
    const { userData, setUserData } = useUser(); // 
    const navigation = useNavigation();
    const [status, setStatus] = useState(userData?.availabilityStatus || 'Available1');
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const hasStatusChanged = React.useMemo(() => {
        return status !== userData?.availabilityStatus;
    }, [status, userData?.availabilityStatus]);
    const statusOptions = ['Available', 'Not Available', 'On Duty'];

    console.log("Current User Data:", userData);

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            if (!hasStatusChanged) {
                return; // If nothing changed, let them leave
            }
            // Prevent default behavior of leaving the screen
            e.preventDefault();
            Alert.alert(
                'Unsaved Changes',
                'You have unsaved changes. Are you sure you want to leave?',
                [
                    { text: "Don't leave", style: 'cancel', onPress: () => { } },
                    {
                        text: 'Discard',
                        style: 'destructive',
                        // If they choose discard, manually trigger the navigation
                        onPress: () => navigation.dispatch(e.data.action),
                    },
                ]
            );
        });
        return unsubscribe;
    }, [navigation, hasStatusChanged]);

    const formatDOB = (dobValue) => {
        if (!dobValue) return 'Not Provided';
        // 1. Handle Firebase Timestamp (standard object with seconds/nanoseconds)
        if (dobValue && typeof dobValue.toDate === 'function') {
            return dobValue.toDate().toLocaleDateString('en-GB');
        }
        // 2. Handle JS Date objects
        if (dobValue instanceof Date) {
            return dobValue.toLocaleDateString('en-GB');
        }
        // 3. Handle ISO strings or numeric timestamps
        const date = new Date(dobValue);
        if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('en-GB');
        }
        return String(dobValue);
    };

    const handleSaveStatus = async () => {
        const uid = userData?.user?.uid;
        if (!uid) {
            Alert.alert("Error", "User ID not found.");
            return;
        }
        setLoading(true);
        try {
            await updateUserStatus(uid, status);
            if (setUserData) {
                setUserData({
                    ...userData,
                    availabilityStatus: status,
                    lastUpdated: { toDate: () => new Date() } // Mock for UI
                });
            }
            Alert.alert("Success", "Status and Timestamp updated!");
        } catch (error) {
            Alert.alert("Error", "Update failed.");
        } finally {
            setLoading(false);
        }
    };

    const formatTimestamp = (ts) => {
        if (!ts) return 'Never';
        const date = ts.toDate ? ts.toDate() : new Date(ts);
        return date.toLocaleString('en-GB', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const renderStatusItem = ({ item }) => (
        <TouchableOpacity
            style={styles.modalItem}
            onPress={() => {
                setStatus(item);
                setIsModalVisible(false);
            }}
        >
            <Text style={[styles.statusText, item === status && { fontWeight: 'bold', color: '#4CAF50' }]}>
                {item}
            </Text>
            {item === status && <Ionicons name="checkmark" size={20} color="#4CAF50" />}
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.avatarContainer}>
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarLetter}>{userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}</Text>
                </View>
                <Text style={styles.usernameLabel}>Username: {userData?.name || 'User'}</Text>
            </View>

            <View style={styles.statusSection}>
                <Text style={styles.label}>Availability Status:</Text>
                <TouchableOpacity style={styles.pickerContainer} onPress={() => setIsModalVisible(true)}>
                    <Text style={styles.statusText}>{status}</Text>
                    <Ionicons name="chevron-down" size={20} color="black" />
                </TouchableOpacity>

                {/* SHOW SAVE BUTTON ONLY IF STATUS IS DIFFERENT FROM DATABASE */}
                {hasStatusChanged && (
                    <TouchableOpacity
                        style={[styles.saveButton, loading && { opacity: 0.7 }]}
                        onPress={handleSaveStatus}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Status</Text>}
                    </TouchableOpacity>
                )}

                <Text style={styles.lastUpdated}>
                    Last Updated: {formatTimestamp(userData?.lastUpdated)}
                </Text>
            </View>

            {/* FIXED FORM LAYOUT */}
            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>ID</Text>
                    <TextInput style={styles.readOnlyInput} value={userData?.user?.uid || ''} editable={false} />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Name</Text>
                    <TextInput style={styles.readOnlyInput} value={userData?.name || ''} editable={false} />
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                        <Text style={styles.inputLabel}>Date of Birth</Text>
                        <TextInput style={styles.readOnlyInput} value={formatDOB(userData?.dob)} editable={false} />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1.5 }]}>
                        <Text style={styles.inputLabel}>Role</Text>
                        <TextInput style={styles.readOnlyInput} value={userData?.role || 'Engineer'} editable={false} />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput style={styles.readOnlyInput} value={userData?.user?.email || ''} editable={false} />
                </View>
            </View>

            {/* Modal remains same */}
            <Modal transparent visible={isModalVisible} animationType="fade" onRequestClose={() => setIsModalVisible(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsModalVisible(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Status</Text>
                        <FlatList data={statusOptions} keyExtractor={(item) => item} renderItem={renderStatusItem} />
                    </View>
                </TouchableOpacity>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    content: { padding: 20 },
    avatarContainer: { alignItems: 'center', marginBottom: 30 },
    avatarCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    avatarLetter: { fontSize: 60, color: '#000' },
    usernameLabel: { fontSize: 16, fontWeight: '600' },
    statusSection: { marginBottom: 30 },
    label: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
    pickerContainer: { flexDirection: 'row', height: 50, borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 12, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, backgroundColor: '#fff' },
    statusText: { fontSize: 16, color: '#333' },
    saveButton: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 12, marginTop: 15, alignItems: 'center' },
    saveButtonText: { color: '#fff', fontWeight: 'bold' },
    lastUpdated: { fontSize: 12, color: '#BDBDBD', marginTop: 8, textAlign: 'center' },
    form: { width: '100%' },
    inputGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
    readOnlyInput: { height: 50, backgroundColor: '#F9F9F9', borderRadius: 12, paddingHorizontal: 15, fontSize: 16, borderWidth: 1, borderColor: '#E8E8E8', color: '#777' },
    row: { flexDirection: 'row' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '80%', backgroundColor: '#fff', borderRadius: 20, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    modalItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }
});