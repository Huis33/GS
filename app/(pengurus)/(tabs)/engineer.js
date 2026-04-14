import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../../firebaseConfig'; // Adjust your firebase config path
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function EngineerListScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('Available');
    const [engineers, setEngineers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Engineers from Firebase
    useEffect(() => {
        // Query users where role is "Engineer"
        const q = query(
            collection(db, 'user'),
            where('role', '==', 'Engineer')
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const engineerData = [];
            querySnapshot.forEach((doc) => {
                engineerData.push({ id: doc.id, ...doc.data() });
            });
            setEngineers(engineerData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching engineers: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Filter logic: Search Query + Tab Status
    const filteredEngineers = engineers.filter(e => {
        const matchesSearch = e.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = e.availabilityStatus === activeTab;
        return matchesSearch && matchesStatus;
    });

    const renderEngineerItem = ({ item }) => (
        <TouchableOpacity style={styles.engineerItem}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                    {item.name ? item.name.charAt(0).toUpperCase() : '?'}
                </Text>
            </View>
            <View>
                <Text style={styles.engineerName}>{item.name}</Text>
                {/* Optional: Show skillset if it exists */}
                {item.skillSet && <Text style={styles.skillText}>{item.skillSet}</Text>}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <TextInput
                        placeholder="Search for..."
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <Ionicons name="search" size={20} color="#666" />
                </View>
            </View>

            {/* Segment Tabs */}
            <View style={styles.tabBar}>
                {['Available', 'Not Available', 'On Duty'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                        style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* List Handling */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#2F80ED" />
                </View>
            ) : (
                <FlatList
                    data={filteredEngineers}
                    keyExtractor={(item) => item.id}
                    renderItem={renderEngineerItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No engineers found in this category.</Text>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15
    },
    welcomeText: { fontSize: 22, color: '#333' },
    boldText: { fontWeight: 'bold' },
    searchContainer: { paddingHorizontal: 20, marginBottom: 15, marginTop: 10 },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F4F9',
        borderRadius: 25,
        paddingHorizontal: 20,
        height: 50,
        borderWidth: 1,
        borderColor: '#E0E0E0'
    },
    searchInput: { flex: 1, fontSize: 16, color: '#333' },
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        marginBottom: 10
    },
    tabItem: { flex: 1, paddingVertical: 12, alignItems: 'center' },
    activeTabItem: { borderBottomWidth: 3, borderBottomColor: '#2F80ED' },
    tabText: { fontSize: 14, color: '#999', fontWeight: '500' },
    activeTabText: { color: '#2F80ED', fontWeight: 'bold' },
    listContent: { paddingHorizontal: 20, paddingBottom: 20 },
    engineerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: '#F0F0F0'
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FDF2E9', // Light peach color from image
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    avatarText: { color: '#D35400', fontWeight: 'bold', fontSize: 16 },
    engineerName: { fontSize: 16, color: '#333', fontWeight: '500' },
    skillText: { fontSize: 12, color: '#777' }, // Added for skillset
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 14 }
});