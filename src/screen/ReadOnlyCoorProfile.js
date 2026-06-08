import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function ReadOnlyCoordProfile() {
    const { name } = useLocalSearchParams();
    const router = useRouter();

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!name) {
                setLoading(false);
                return;
            }

            try {
                const userRef = collection(db, 'user');

                // Search by name first
                const q = query(userRef, where('name', '==', name));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    setProfileData({
                        id: querySnapshot.docs[0].id,
                        ...querySnapshot.docs[0].data()
                    });
                } else {
                    // Fallback search by username
                    const fallbackQuery = query(
                        userRef,
                        where('username', '==', name)
                    );

                    const fallbackSnapshot = await getDocs(fallbackQuery);

                    if (!fallbackSnapshot.empty) {
                        setProfileData({
                            id: fallbackSnapshot.docs[0].id,
                            ...fallbackSnapshot.docs[0].data()
                        });
                    }
                }
            } catch (error) {
                console.error('Firestore Error:', error);
                Alert.alert(
                    'Database Error',
                    "Check if collection name 'user' exists."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [name]);

    const formatDOB = (dobValue) => {
        if (!dobValue) return 'Not Provided';

        const date = dobValue.toDate
            ? dobValue.toDate()
            : new Date(dobValue);

        return !isNaN(date.getTime())
            ? date.toLocaleDateString('en-GB')
            : String(dobValue);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Navigation */}
            <View style={styles.topNav}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Ionicons
                        name="arrow-back"
                        size={26}
                        color="#000"
                    />
                </TouchableOpacity>

                <Text style={styles.navTitle}>
                    Coordinator Profile
                </Text>

                <View style={{ width: 26 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {!profileData ? (
                    <View style={styles.errorState}>
                        <Ionicons
                            name="alert-circle-outline"
                            size={50}
                            color="#CCC"
                        />
                        <Text style={styles.errorText}>
                            Data for "{name}" not found.
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* Header Section */}
                        <View style={styles.header}>
                            <View style={styles.avatarCircle}>
                                <Text style={styles.avatarLetter}>
                                    {profileData?.name
                                        ?.charAt(0)
                                        .toUpperCase() || 'U'}
                                </Text>
                            </View>

                            <Text style={styles.usernameText}>
                                Username:{' '}
                                <Text style={styles.boldText}>
                                    {profileData?.name || 'User'}
                                </Text>
                            </Text>
                        </View>

                        {/* Form Section */}
                        <View style={styles.formContainer}>
                            {/* ID */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>ID</Text>

                                    <TextInput
                                        style={styles.readOnlyInput}
                                        value={profileData?.id || 'N/A'}
                                        editable={false}
                                    />
                            </View>

                            {/* Name */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Name</Text>

                                <TextInput
                                    style={styles.readOnlyInput}
                                    value={profileData?.name || 'N/A'}
                                    editable={false}
                                />
                            </View>

                            {/* DOB + Role */}
                            <View style={styles.row}>
                                <View
                                    style={[
                                        styles.inputGroup,
                                        {
                                            flex: 1,
                                            marginRight: 10
                                        }
                                    ]}
                                >
                                    <Text style={styles.inputLabel}>
                                        Date of Birth
                                    </Text>

                                    <TextInput
                                        style={styles.readOnlyInput}
                                        value={formatDOB(profileData?.dob)}
                                        editable={false}
                                    />
                                </View>

                                <View
                                    style={[
                                        styles.inputGroup,
                                        { flex: 1.5 }
                                    ]}
                                >
                                    <Text style={styles.inputLabel}>
                                        Role
                                    </Text>

                                    <TextInput
                                        style={styles.readOnlyInput}
                                        value={
                                            profileData?.role || 'Staff'
                                        }
                                        editable={false}
                                    />
                                </View>
                            </View>

                            {/* Email */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Email</Text>

                                <TextInput
                                    style={styles.readOnlyInput}
                                    value={profileData?.email || 'N/A'}
                                    editable={false}
                                />
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    topNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
    },

    navTitle: {
        fontSize: 20,
        fontWeight: 'bold'
    },

    backButton: {
        padding: 5
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
    },

    errorState: {
        alignItems: 'center',
        marginTop: 50
    },

    errorText: {
        color: '#AAA',
        marginTop: 10,
        fontSize: 14
    }
});