import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';

export default function SchedulePage() {
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        const now = new Date();
        setCurrentDate(now.toISOString().split('T')[0]);
    }, []);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            {/* Calendar */}
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

            {/* Heading */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                    Schedule for {new Date().getDate()} {new Date().toLocaleString('en-MY', { month: 'long' })}
                </Text>
            </View>

            {/* Highlighted Task Card */}
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
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    scrollContent: { paddingTop: 10, paddingBottom: 30 },
    calendarCard: { marginHorizontal: 10, marginBottom: 20 },
    sectionHeader: { paddingHorizontal: 20, marginBottom: 15 },
    sectionTitle: { fontSize: 24, fontWeight: '800' },
    taskCard: {
        backgroundColor: '#D1E0FF',
        marginHorizontal: 20,
        borderRadius: 25,
        padding: 20,
        elevation: 3,
    },
    taskTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
    taskSub: { fontSize: 14, color: '#444', marginBottom: 20 },
    progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    progressText: { fontSize: 12, fontWeight: '600' },
    progressBar: { height: 6, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 3 },
    progressFill: { height: 6, backgroundColor: '#10B981', borderRadius: 3 }
});