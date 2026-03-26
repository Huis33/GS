import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { Calendar } from 'react-native-calendars'; // You may need to: npx expo install react-native-calendars
import { Ionicons } from '@expo/vector-icons';

export default function MainDashboard() {
    const [currentDate, setCurrentDate] = useState('');
    const [displayMonth, setDisplayMonth] = useState('');

    useEffect(() => {
        // Get Malaysia Time (UTC+8)
        const now = new Date();
        const malayTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));

        const dateString = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const monthYear = now.toLocaleString('en-MY', { month: 'long', year: 'numeric' });
        const dayOnly = now.toLocaleString('en-MY', { day: 'numeric', month: 'long' });

        setCurrentDate(dateString);
        setDisplayMonth(monthYear);
    }, []);

    // Mock data for the "User Testing Session" card
    const currentTask = {
        title: "User Testing Session",
        description: "Conduct usability testing with 10 participants for the new feature",
        progress: 0.5, // 50%
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity>
                    <Ionicons name="menu-outline" size={28} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Welcome, Alice Tan</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Calendar Section */}
                <View style={styles.calendarCard}>
                    <Calendar
                        current={currentDate}
                        markedDates={{
                            [currentDate]: { selected: true, selectedColor: '#6389DA' }
                        }}
                        theme={{
                            todayTextColor: '#6389DA',
                            arrowColor: '#333',
                            monthTextColor: '#000',
                            textMonthFontSize: 20,
                            textMonthFontWeight: 'bold',
                        }}
                    />
                </View>

                {/* Schedule Heading */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Schedule for {new Date().getDate()} January</Text>
                </View>

                {/* Task Card */}
                <View style={styles.taskCard}>
                    <Text style={styles.taskTitle}>User Testing Session</Text>
                    <Text style={styles.taskSub}>Conduct usability testing with 10 participants for the new feature</Text>

                    <View style={styles.progressRow}>
                        <Text style={styles.progressText}>Progress</Text>
                        <Text style={styles.progressText}>50%</Text>
                    </View>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: '50%' }]} />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 10
    },
    headerTitle: { fontSize: 22, fontWeight: 'bold' },
    calendarCard: { marginHorizontal: 10, marginBottom: 20 },
    sectionHeader: { paddingHorizontal: 20, marginBottom: 15 },
    sectionTitle: { fontSize: 24, fontWeight: '800' },
    taskCard: {
        backgroundColor: '#D1E0FF', // The light blue from your screenshot
        marginHorizontal: 20,
        borderRadius: 25,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    taskTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
    taskSub: { fontSize: 15, color: '#444', marginBottom: 20, lineHeight: 20 },
    progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    progressText: { fontSize: 13, fontWeight: '600', color: '#444' },
    progressBar: { height: 6, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 3 },
    progressFill: { height: 6, backgroundColor: '#10B981', borderRadius: 3 }
});