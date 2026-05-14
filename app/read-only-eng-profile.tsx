import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function ReadOnlyEngProfile({ userData, status }) {

    const formatDate = (val) => {
        if (!val) return 'Not Provided';

        if (val?.toDate) {
            return val.toDate().toLocaleDateString('en-GB');
        }

        const d = new Date(val);
        return isNaN(d.getTime()) ? 'Not Provided' : d.toLocaleDateString('en-GB');
    };

    const formatTimestamp = (val) => {
        if (!val) return 'Never';

        const d = val?.toDate ? val.toDate() : new Date(val);

        return d.toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>

            {/* PROFILE HEADER */}
            <View style={styles.headerCard}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Text>
                </View>

                <Text style={styles.name}>{userData?.name || 'Unknown User'}</Text>
                <Text style={styles.role}>{userData?.role || 'Engineer'}</Text>
            </View>

            {/* STATUS */}
            <View style={styles.card}>
                <Text style={styles.label}>Availability Status</Text>

                <View style={styles.statusBox}>
                    <Text style={styles.statusText}>{status || 'Unknown'}</Text>
                </View>

                <Text style={styles.small}>
                    Last updated: {formatTimestamp(userData?.lastUpdated)}
                </Text>
            </View>

            {/* DETAILS */}
            <View style={styles.card}>
                <Text style={styles.label}>User ID</Text>
                <Text style={styles.value}>{userData?.id}</Text>

                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{userData?.email}</Text>

                <Text style={styles.label}>Date of Birth</Text>
                <Text style={styles.value}>{formatDate(userData?.dob)}</Text>

                <Text style={styles.label}>Role & Skillset</Text>
                <Text style={styles.value}>
                    {userData?.skillSet
                        ? `${userData.role} (${userData.skillSet})`
                        : userData?.role}
                </Text>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 40,
        backgroundColor: '#F6F8FC'
    },

    headerCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 18,
        alignItems: 'center',
        marginBottom: 15,
        elevation: 3
    },

    avatar: {
        width: 85,
        height: 85,
        borderRadius: 42,
        backgroundColor: '#E8ECF7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10
    },

    avatarText: {
        fontSize: 34,
        fontWeight: 'bold',
        color: '#2F80ED'
    },

    name: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111'
    },

    role: {
        fontSize: 13,
        color: '#666',
        marginTop: 2
    },

    card: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12
    },

    label: {
        fontSize: 12,
        color: '#888',
        marginTop: 10
    },

    value: {
        fontSize: 14,
        color: '#222',
        marginTop: 4
    },

    statusBox: {
        marginTop: 8,
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#F3F6FF'
    },

    statusText: {
        fontSize: 14,
        fontWeight: '600'
    },

    small: {
        fontSize: 11,
        color: '#999',
        marginTop: 8,
        textAlign: 'center'
    }
});