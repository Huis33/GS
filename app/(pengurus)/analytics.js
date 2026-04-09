import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
// For the actual app, you'd use react-native-chart-kit or similar
// For this UI, we will create clean, high-fidelity CSS-based progress rings/bars

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
    const router = useRouter();

    // Dummy Data - To be replaced by Firebase fetch logic later
    const engineerData = [
        { name: 'Alice Tan', percentage: 32, color: '#FFADAD' },
        { name: 'Julian Vance', percentage: 27, color: '#80CAFF' },
        { name: 'Ruby Chen', percentage: 23, color: '#99FFB4' },
        { name: 'Others', percentage: 18, color: '#FDFFB6' },
    ];

    const coordinatorData = [
        { name: 'Evelyn Choo', percentage: 39, color: '#FFADAD' },
        { name: 'Rachel Tam', percentage: 33, color: '#80CAFF' },
        { name: 'Nicholas Ng', percentage: 28, color: '#99FFB4' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Analytics</Text>
                <TouchableOpacity onPress={() => console.log("Refresh from Firebase")}>
                    <Ionicons name="refresh-outline" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Section 1: Engineers */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Most Assigned Engineer</Text>
                    <View style={styles.chartPlaceholder}>
                        {/* Simulating your pie chart design */}
                        <Ionicons name="pie-chart" size={160} color="#6389DA" />
                        <Text style={styles.chartHint}>[Firebase Data Visual]</Text>
                    </View>
                    <View style={styles.legendGrid}>
                        {engineerData.map((item, index) => (
                            <View key={index} style={styles.legendItem}>
                                <View style={[styles.dot, { backgroundColor: item.color }]} />
                                <Text style={styles.legendText}>{item.name}: {item.percentage}%</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Section 2: Coordinators */}
                <View style={[styles.sectionCard, { marginBottom: 40 }]}>
                    <Text style={styles.sectionTitle}>Most Active Coordinator</Text>
                    <View style={styles.chartPlaceholder}>
                        <Ionicons name="stats-chart" size={140} color="#6389DA" />
                        <Text style={styles.chartHint}>[Firebase Data Visual]</Text>
                    </View>
                    <View style={styles.legendGrid}>
                        {coordinatorData.map((item, index) => (
                            <View key={index} style={styles.legendItem}>
                                <View style={[styles.dot, { backgroundColor: item.color }]} />
                                <Text style={styles.legendText}>{item.name}: {item.percentage}%</Text>
                            </View>
                        ))}
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 18,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000'
    },
    backButton: { padding: 4 },
    scrollContent: { padding: 20 },
    sectionCard: {
        backgroundColor: '#fff',
        borderRadius: 25,
        padding: 20,
        marginBottom: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center'
    },
    chartPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        backgroundColor: '#F0F4FF',
        borderRadius: 20,
        marginBottom: 20
    },
    chartHint: { fontSize: 12, color: '#6389DA', marginTop: 10, fontWeight: '600' },
    legendGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        marginBottom: 10
    },
    dot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
    legendText: { fontSize: 13, color: '#555', fontWeight: '500' }
});