import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SectionList,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { db } from '../../../firebaseConfig';
import { collection, onSnapshot, query } from 'firebase/firestore';

export default function ServiceLevelScreen() {
    // Fake Data structured for SectionList
    // This can be easily replaced by Firebase data mapped into this format
    const router = useRouter();
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCategories, setTotalCategories] = useState(0);

    const PRIORITY_CONFIG = {
        'Critical': { color: '#FDECEC', icon: 'alert-circle' },
        'High': { color: '#FEF0E6', icon: 'arrow-up' },
        'Medium': { color: '#FFF9E6', icon: 'remove' },
        'Low': { color: '#F1F9F1', icon: 'arrow-down' },
    };

    useEffect(() => {
        // 1. Reference the 'priority' collection
        const priorityCollection = collection(db, 'priority');

        // 2. Set up real-time listener
        const unsubscribe = onSnapshot(priorityCollection, (snapshot) => {
            const rawData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setTotalCategories(rawData.length);

            // 3. Transform flat Firebase data into SectionList format
            const grouped = rawData.reduce((acc, item) => {
                const category = item.category || 'Low';
                if (!acc[category]) {
                    acc[category] = {
                        title: category,
                        color: PRIORITY_CONFIG[category]?.color || '#F1F9F1',
                        icon: PRIORITY_CONFIG[category]?.icon || 'help-circle',
                        data: []
                    };
                }
                // Push the categoryName into the data array
                acc[category].data.push({
                    name: item.categoryName,
                    id: item.id,
                    description: item.description
                });
                return acc;
            }, {});

            // 4. Sort sections in a specific order: Critical -> High -> Medium -> Low
            const order = ['Critical', 'High', 'Medium', 'Low'];
            const sortedSections = order
                .filter(level => grouped[level])
                .map(level => {
                    // 3. SORT BY ALPHABET HERE
                    const section = grouped[level];
                    section.data.sort((a, b) => a.name.localeCompare(b.name));
                    return section;
                });
            setSections(sortedSections);
            setLoading(false);
        }, (error) => {
            console.error("Firebase Fetch Error: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const renderHeader = ({ section: { title, color, icon } }) => (
        <View style={[styles.sectionHeader, { backgroundColor: color }]}>
            <Ionicons name={icon} size={24} color="#333" style={styles.sectionIcon} />
            <Text style={styles.sectionHeaderText}>{title}</Text>
        </View>
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => router.push({
                pathname: '/category-details',
                params: { id: item.id, name: item.name, description: item.description }
            })}
        >
            <Text style={styles.itemText}>{item.name}</Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2F80ED" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.totalText}>Total {totalCategories} Categories</Text>

                <SectionList
                    sections={sections}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    renderSectionHeader={renderHeader}
                    stickySectionHeadersEnabled={false}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={<Text style={styles.emptyText}>No categories found.</Text>}
                />
            </View>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/add-category')}>
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    totalText: { fontSize: 14, color: '#666', paddingHorizontal: 20, paddingVertical: 10 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20 },
    sectionIcon: { marginRight: 10 },
    sectionHeaderText: { fontSize: 20, fontWeight: '600', color: '#333' },
    itemContainer: { paddingVertical: 18, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    itemText: { fontSize: 16, color: '#333' },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#999' },
    fab: {
        position: 'absolute', right: 20, bottom: 20, backgroundColor: '#2F80ED',
        width: 56, height: 56, borderRadius: 28, justifyContent: 'center',
        alignItems: 'center', elevation: 5, shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84,
    }
});