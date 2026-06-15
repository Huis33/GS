import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert
} from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

export function ROEP() {
    const { name } = useLocalSearchParams();
    const router = useRouter();
    const [engineerData, setEngineerData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEngineer = async () => {
            if (!name) {
                setLoading(false);
                return;
            }

            try {
                // MATCHING SCREENSHOT: Collection is 'user' (singular)
                const userRef = collection(db, 'user');

                // MATCHING SCREENSHOT: Field is 'name'
                const q = query(userRef, where('name', '==', name));

                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const data = querySnapshot.docs[0].data();
                    setEngineerData(data);
                } else {
                    console.warn(`No document found in 'user' collection with name: ${name}`);
                    // Fallback: If your chart passes a username instead of name
                    const qFallback = query(userRef, where('username', '==', name));
                    const fallbackSnapshot = await getDocs(qFallback);

                    if (!fallbackSnapshot.empty) {
                        setEngineerData(fallbackSnapshot.docs[0].data());
                    }
                }
            } catch (error) {
                console.error("Firestore Error:", error);
                Alert.alert("Database Error", "Check if collection name 'user' exists.");
            } finally {
                setLoading(false);
            }
        };

        fetchEngineer();
    }, [name]);

    // Format DOB based on your screenshot format
    const formatDOB = (dobValue) => {
        if (!dobValue) return 'Not Provided';
        if (dobValue?.toDate) return dobValue.toDate().toLocaleDateString('en-GB');
        return String(dobValue);
    };

    if (loading) return (
        <View style={styles.center}><ActivityIndicator size="large" color="#6389DA" /></View>
    );

    return (
        <ScreenContainer style={styles.container}>
            {/* Header with Back Button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={26} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Engineer Profile</Text>
                <View style={{ width: 26 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {!engineerData ? (
                    <View style={styles.errorState}>
                        <Ionicons name="alert-circle-outline" size={50} color="#CCC" />
                        <Text style={styles.errorText}>Data for "{name}" not found in 'user' collection.</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatarCircle}>
                                <Text style={styles.avatarLetter}>
                                    {engineerData.name?.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <Text style={styles.usernameLabel}>{engineerData.name}</Text>
                            <Text style={styles.roleSub}>{engineerData.role}</Text>
                        </View>

                        <View style={styles.statusSection}>
                            <Text style={styles.label}>Availability Status:</Text>
                            <View style={styles.readOnlyPickerContainer}>
                                <Text style={styles.statusText}>
                                    {engineerData.availabilityStatus}
                                </Text>
                                <Ionicons name="lock-closed" size={18} color="#BDBDBD" />
                            </View>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Full Name</Text>
                                <TextInput style={styles.readOnlyInput} value={engineerData.name} editable={false} />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                    <Text style={styles.inputLabel}>Date of Birth</Text>
                                    <TextInput style={styles.readOnlyInput} value={formatDOB(engineerData.dob)} editable={false} />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1.5 }]}>
                                    <Text style={styles.inputLabel}>Skillset</Text>
                                    <TextInput style={styles.readOnlyInput} value={engineerData.skillSet} editable={false} />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Email Address</Text>
                                <TextInput style={styles.readOnlyInput} value={engineerData.email} editable={false} />
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    backButton: { padding: 5 },
    content: { padding: 20 },
    avatarContainer: { alignItems: 'center', marginBottom: 30 },
    avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#6389DA', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    avatarLetter: { fontSize: 45, color: '#FFF', fontWeight: 'bold' },
    usernameLabel: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    roleSub: { fontSize: 14, color: '#888', marginTop: 2 },
    statusSection: { marginBottom: 30 },
    label: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 10 },
    readOnlyPickerContainer: { flexDirection: 'row', height: 50, borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 12, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, backgroundColor: '#F9F9F9' },
    statusText: { fontSize: 16, color: '#333' },
    form: { width: '100%' },
    inputGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 13, fontWeight: '600', color: '#999', marginBottom: 8, marginLeft: 5 },
    readOnlyInput: { height: 50, backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 15, fontSize: 16, borderWidth: 1, borderColor: '#E8E8E8', color: '#555' },
    row: { flexDirection: 'row' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorState: { alignItems: 'center', marginTop: 50 },
    errorText: { color: '#AAA', marginTop: 10, fontSize: 14 }
});