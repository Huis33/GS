import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useUser } from '../../src/context/UserContext';

export default function ProfileScreen() {
    const { userData } = useUser();

    const formatDOB = (dobValue) => {
        if (!dobValue) return 'Not Provided';
        // Handle Firebase Timestamp or JS Date
        const date = dobValue.toDate ? dobValue.toDate() : new Date(dobValue);
        return !isNaN(date.getTime()) ? date.toLocaleDateString('en-GB') : String(dobValue);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header Section */}
            <View style={styles.header}>
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarLetter}>
                        {userData?.name?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                </View>
                <Text style={styles.usernameText}>
                    Username: <Text style={styles.boldText}>{userData?.name || 'User'}</Text>
                </Text>
            </View>

            {/* Information Form Section */}
            <View style={styles.formContainer}>
                {/* ID Field */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>ID</Text>
                    <TextInput
                        style={styles.readOnlyInput}
                        value={userData?.user?.uid || userData?.id || 'N/A'}
                        editable={false}
                    />
                </View>

                {/* Name Field */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Name</Text>
                    <TextInput
                        style={styles.readOnlyInput}
                        value={userData?.name || 'N/A'}
                        editable={false}
                    />
                </View>

                {/* Row: Date of Birth & Role */}
                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                        <Text style={styles.inputLabel}>Date of Birth</Text>
                        <TextInput
                            style={styles.readOnlyInput}
                            value={formatDOB(userData?.dob)}
                            editable={false}
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1.5 }]}>
                        <Text style={styles.inputLabel}>Role</Text>
                        <TextInput
                            style={styles.readOnlyInput}
                            value={userData?.role || 'Staff'}
                            editable={false}
                        />
                    </View>
                </View>

                {/* Email Field */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput
                        style={styles.readOnlyInput}
                        value={userData?.user?.email || 'N/A'}
                        editable={false}
                    />
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    content: {
        padding: 20
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10
    },
    avatarCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    avatarLetter: {
        fontSize: 90,
        color: '#000',
        fontWeight: '400'
    },
    usernameText: {
        fontSize: 16,
        color: '#333'
    },
    boldText: {
        fontWeight: '600'
    },
    formContainer: {
        width: '100%',
        marginTop: 10
    },
    inputGroup: {
        marginBottom: 20
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8
    },
    readOnlyInput: {
        height: 55,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#D1D1D1',
        color: '#555'
    },
    row: {
        flexDirection: 'row'
    }
});