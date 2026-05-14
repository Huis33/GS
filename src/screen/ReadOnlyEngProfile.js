import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function ReadOnlyEngProfile() {
    const { id } = useLocalSearchParams();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const ref = doc(db, 'user', id);
                const snap = await getDoc(ref);

                if (snap.exists()) {
                    setUserData({ id: snap.id, ...snap.data() });
                }
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchUser();
    }, [id]);

    const parseDate = (val) => {
        if (!val) return null;
        if (val?.toDate) return val.toDate();
        const d = new Date(val);
        return isNaN(d) ? null : d;
    };

    const formatDate = (val) => {
        const d = parseDate(val);
        return d ? d.toLocaleDateString('en-GB') : 'Not provided';
    };

    const formatTime = (val) => {
        const d = parseDate(val);
        return d
            ? d.toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
            : 'Never';
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>

                {/* Avatar */}
                <View style={styles.card}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <Text style={styles.name}>{userData?.name}</Text>
                    <Text style={styles.sub}>{userData?.role}</Text>
                </View>

                {/* Status */}
                <View style={styles.section}>
                    <Text style={styles.label}>Availability Status</Text>
                    <View style={styles.box}>
                        <Text style={styles.value}>{userData?.availabilityStatus}</Text>
                    </View>
                    <Text style={styles.small}>
                        Last updated: {formatTime(userData?.lastUpdated)}
                    </Text>
                </View>

                {/* Details */}
                <View style={styles.section}>
                    <Text style={styles.label}>User ID</Text>
                    <Text style={styles.field}>{userData?.id}</Text>

                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.field}>{userData?.email}</Text>

                    <Text style={styles.label}>Date of Birth</Text>
                    <Text style={styles.field}>{formatDate(userData?.dob)}</Text>

                    <Text style={styles.label}>Role & Skills</Text>
                    <Text style={styles.field}>
                        {userData?.skillSet
                            ? `${userData.role} (${userData.skillSet})`
                            : userData?.role}
                    </Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F6F8FC' },

    content: {
        padding: 20,
        paddingBottom: 40,
    },

    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 20,
        elevation: 3
    },

    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#E8ECF7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10
    },

    avatarText: { fontSize: 36, fontWeight: 'bold', color: '#2F80ED' },

    name: { fontSize: 18, fontWeight: '700' },
    sub: { fontSize: 13, color: '#666', marginTop: 2 },

    section: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 15
    },

    label: {
        fontSize: 12,
        color: '#888',
        marginTop: 10
    },

    box: {
        marginTop: 5,
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#F3F6FF'
    },

    value: { fontSize: 14, fontWeight: '600' },

    field: {
        fontSize: 14,
        paddingVertical: 8,
        color: '#333'
    },

    small: {
        fontSize: 11,
        color: '#999',
        marginTop: 6,
        textAlign: 'center'
    }
});