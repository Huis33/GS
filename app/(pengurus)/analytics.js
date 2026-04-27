import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Dimensions,
    StatusBar,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { db } from "../../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { PieChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;
// Your exact colors from the screenshot
const COLORS = ['#FF8A80', '#82B1FF', '#69F0AE', '#FFD740', '#B388FF'];

export default function AnalyticsScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [engineerAnalytics, setEngineerAnalytics] = useState([]);
    const [coordinatorAnalytics, setCoordinatorAnalytics] = useState([]);
    const [stats, setStats] = useState({ total: 0, completed: 0 });

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'task'), (snapshot) => {
            const tasks = [];
            snapshot.forEach(doc => tasks.push(doc.data()));
            calculateAnalytics(tasks);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const calculateAnalytics = (tasks) => {
        const engineerCounts = {};
        const coordinatorCounts = {};
        let completedCount = 0;

        tasks.forEach(task => {
            if (task.assignedTo && Array.isArray(task.assignedTo)) {
                task.assignedTo.forEach(name => {
                    engineerCounts[name] = (engineerCounts[name] || 0) + 1;
                });
            }
            if (task.creatorName) {
                coordinatorCounts[task.creatorName] = (coordinatorCounts[task.creatorName] || 0) + 1;
            }
            if (task.status === 'Done') completedCount++;
        });

        setStats({ total: tasks.length, completed: completedCount });
        setEngineerAnalytics(processToChartData(engineerCounts));
        setCoordinatorAnalytics(processToChartData(coordinatorCounts));
    };

    const processToChartData = (countsMap) => {
        const total = Object.values(countsMap).reduce((a, b) => a + b, 0);
        return Object.keys(countsMap)
            .map((name, index) => ({
                name: name,
                population: countsMap[name],
                percentage: total > 0 ? Math.round((countsMap[name] / total) * 100) : 0,
                color: COLORS[index % COLORS.length],
                legendFontColor: "#7F7F7F",
                legendFontSize: 12
            }))
            .sort((a, b) => b.population - a.population);
    };

    const handleSlicePress = (data) => {
        // We navigate and pass the name as a search parameter
        router.push({
            pathname: '/analytic-detail',
            params: { name: data.name }
        });
    };

    const handleCoordinatorPress = (data) => {
        router.push({
            pathname: '/analytic-detail-2',
            params: { name: data.name }
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6389DA" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Analytics</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Summary Row */}
                <View style={styles.summaryRow}>
                    <View style={[styles.miniCard, { backgroundColor: '#D1E0FF' }]}>
                        <Text style={styles.miniLabel}>Total Tasks</Text>
                        <Text style={styles.miniValue}>{stats.total}</Text>
                    </View>
                    <View style={[styles.miniCard, { backgroundColor: '#99FFB4' }]}>
                        <Text style={styles.miniLabel}>Completed</Text>
                        <Text style={styles.miniValue}>{stats.completed}</Text>
                    </View>
                </View>

                {/* Section: Most Assigned Engineer */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Most Assigned Engineer</Text>

                    <View style={styles.chartWrapper}>
                        <PieChart
                            data={engineerAnalytics}
                            width={screenWidth - 80}
                            height={200}
                            chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
                            accessor={"population"}
                            backgroundColor={"transparent"}
                            paddingLeft={"75"} // Adjusted for visual centering
                            center={[0, 0]}
                            hasLegend={false}
                        />
                    </View>

                    <View style={styles.legendContainer}>
                        {engineerAnalytics.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.legendPill}
                                onPress={() => handleSlicePress(item)} // This enables the interaction
                            >
                                <View style={[styles.dot, { backgroundColor: item.color }]} />
                                <Text style={styles.legendText}>{item.name} - {item.percentage}%</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Section: Most Active Coordinator */}
                <View style={[styles.sectionCard, { marginBottom: 40 }]}>
                    <Text style={styles.sectionTitle}>Most Active Coordinator</Text>
                    <View style={styles.chartWrapper}>
                        <PieChart
                            data={coordinatorAnalytics}
                            width={screenWidth - 80}
                            height={200}
                            chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
                            accessor={"population"}
                            backgroundColor={"transparent"}
                            paddingLeft={"75"}
                            center={[0, 0]}
                            hasLegend={false}
                        />
                    </View>
                    <View style={styles.legendContainer}>
                        {coordinatorAnalytics.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.legendPill}
                                onPress={() => handleCoordinatorPress(item)} // Navigate on click
                            >
                                <View style={[styles.dot, { backgroundColor: item.color }]} />
                                <Text style={styles.legendText}>{item.name} - {item.percentage}%</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#F8FAFC',
    },

    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111'
    },

    backButton: {
        padding: 6,
        borderRadius: 10,
        backgroundColor: '#EDEFF3'
    },

    scrollContent: {
        padding: 16,
    },

    /* SUMMARY CARDS */
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 18
    },

    miniCard: {
        width: '48%',
        paddingVertical: 22,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',

        // shadow
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },

    miniLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#555',
        marginBottom: 6
    },

    miniValue: {
        fontSize: 30,
        fontWeight: '800',
        color: '#111'
    },

    /* SECTION CARD */
    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 18,
        marginBottom: 20,

        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 4,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111',
        marginBottom: 12
    },

    chartWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginTop: 5
    },

    /* LEGEND */
    legendContainer: {
        marginTop: 18,
        width: '100%'
    },

    legendPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9', // softer than grey
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 16,
        marginBottom: 10,

        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },

    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 10
    },

    legendText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500'
    }
});