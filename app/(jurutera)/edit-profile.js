import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../src/context/UserContext'; // 

export default function EditProfileScreen() {
    const { userData } = useUser(); // 

    // State for the only editable field
    const [status, setStatus] = useState(userData?.status || 'Available');

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Profile Avatar Placeholder */}
            <View style={styles.avatarContainer}>
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarLetter}>
                        {userData?.name ? userData.name.charAt(0).toUpperCase() : 'A'}
                    </Text>
                </View>
                <Text style={styles.usernameLabel}>Username: {userData?.name || 'User'}</Text>
            </View>

            {/* Availability Status Section (Editable) */}
            <View style={styles.statusSection}>
                <Text style={styles.label}>Availability Status:</Text>
                <View style={styles.pickerContainer}>
                    <Text style={styles.statusText}>{status}</Text>
                    <Ionicons name="chevron-down" size={20} color="black" />
                </View>
                <Text style={styles.lastUpdated}>
                    Last Updated: 4/1/2026 14:16:23
                </Text>
            </View>

            {/* Information Fields (Read-Only) */}
            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>ID</Text>
                    <TextInput
                        style={styles.readOnlyInput}
                        value="Eng001" // This would eventually come from userData.uid or similar
                        editable={false}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Name</Text>
                    <TextInput
                        style={styles.readOnlyInput}
                        value={userData?.name || ''}
                        editable={false}
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                        <Text style={styles.inputLabel}>Date of Birth</Text>
                        <TextInput
                            style={styles.readOnlyInput}
                            value="17/4/1998"
                            editable={false}
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1.5 }]}>
                        <Text style={styles.inputLabel}>Role</Text>
                        <TextInput
                            style={styles.readOnlyInput}
                            value={userData?.role || 'Engineer'}
                            editable={false}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput
                        style={styles.readOnlyInput}
                        value={userData?.user?.email || ''}
                        editable={false}
                    />
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    content: { padding: 20, alignItems: 'center' },
    avatarContainer: { alignItems: 'center', marginBottom: 30 },
    avatarCircle: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15
    },
    avatarLetter: { fontSize: 80, fontWeight: '300', color: '#000' },
    usernameLabel: { fontSize: 16, fontWeight: '600', color: '#333' },
    statusSection: { width: '100%', marginBottom: 30, alignItems: 'center' },
    label: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, alignSelf: 'flex-start' },
    pickerContainer: {
        flexDirection: 'row',
        width: '60%',
        height: 50,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        alignSelf: 'flex-end',
        marginTop: -40, // Adjust to match your image layout
    },
    statusText: { fontSize: 16, color: '#333' },
    lastUpdated: { fontSize: 12, color: '#BDBDBD', marginTop: 10, alignSelf: 'center' },
    form: { width: '100%' },
    inputGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
    readOnlyInput: {
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        color: '#555',
    },
    row: { flexDirection: 'row', width: '100%' }
});