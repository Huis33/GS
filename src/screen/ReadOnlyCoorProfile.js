import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../firebaseConfig'; // <-- Verify this path is correct based on where your file is!
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function ReadOnlyCoordProfile() {
    const { name } = useLocalSearchParams();
    const router = useRouter();

    // 👇 THESE TWO LINES MUST BE EXACTLY HERE (Inside the function) 👇
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!name) return;
            try {
                // Find the user document where name matches
                const q = query(collection(db, 'user'), where('name', '==', name));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    // Update state with the found data
                    setProfileData(querySnapshot.docs[0].data());
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [name]);

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6389DA" />
            </SafeAreaView>
        );
    }

    if (!profileData) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Profile Not Found</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.center}>
                    <Text style={styles.errorText}>We couldn't find a profile for {name}.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Coordinator Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.avatarSection}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarInitial}>{profileData.name?.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.nameText}>{profileData.name}</Text>
                    <Text style={styles.roleText}>{profileData.role || 'Service Coordinator'}</Text>
                </View>

                <View style={styles.infoCard}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>

                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}>
                            <Ionicons name="mail" size={20} color="#6389DA" />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>Email</Text>
                            <Text style={styles.infoValue}>{profileData.email || 'N/A'}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}>
                            <Ionicons name="call" size={20} color="#6389DA" />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>Phone Number</Text>
                            <Text style={styles.infoValue}>{profileData.phoneNo || profileData.phone || 'N/A'}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}>
                            <Ionicons name="person" size={20} color="#6389DA" />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>Username</Text>
                            <Text style={styles.infoValue}>@{profileData.username || 'N/A'}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F7FB' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F7FB' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { fontSize: 16, color: '#666', textAlign: 'center' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFF' },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#333' },
    content: { padding: 20 },

    avatarSection: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
    avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#6389DA', justifyContent: 'center', alignItems: 'center', marginBottom: 15, elevation: 5, shadowColor: '#6389DA', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
    avatarInitial: { fontSize: 40, fontWeight: 'bold', color: '#FFF' },
    nameText: { fontSize: 24, fontWeight: '700', color: '#1E293B', marginBottom: 5 },
    roleText: { fontSize: 16, color: '#64748B', fontWeight: '500' },

    infoCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 20 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    infoTextContainer: { flex: 1 },
    infoLabel: { fontSize: 13, color: '#94A3B8', marginBottom: 3, fontWeight: '600' },
    infoValue: { fontSize: 16, color: '#1E293B', fontWeight: '500' },
});