import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../../src/context/UserContext'; // Adjust path to your context

export default function EngineerListScreen() {
    const { userData } = useUser();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('Available');

    // Mock data based on image_da9aa0.png
    const engineers = [
        { id: '1', name: 'Alice Tan', status: 'Available' },
        { id: '2', name: 'Clara Montgomery', status: 'Available' },
        { id: '3', name: 'Daisy Holloway', status: 'Available' },
        { id: '4', name: 'Elias Thorne', status: 'Available' },
        { id: '5', name: 'Jaxen Reed', status: 'Available' },
        { id: '6', name: 'Julian Vance', status: 'Available' },
        { id: '7', name: 'Kieran Blackwood', status: 'Available' },
        { id: '8', name: 'Lyra Vane', status: 'Available' },
        { id: '9', name: 'Milo Finch', status: 'Available' },
        { id: '10', name: 'Nova Sterling', status: 'Available' },
        { id: '11', name: 'Ruby Chen', status: 'Available' },
        { id: '12', name: 'Sienna Brooks', status: 'Available' },
    ];

    const renderEngineerItem = ({ item }) => (
        <TouchableOpacity style={styles.engineerItem}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
            <Text style={styles.engineerName}>{item.name}</Text>
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

            {/* List of Engineers */}
            <FlatList
                data={engineers.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()))}
                keyExtractor={(item) => item.id}
                renderItem={renderEngineerItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
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
    searchContainer: { paddingHorizontal: 20, marginBottom: 15 },
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
    engineerName: { fontSize: 16, color: '#333', fontWeight: '500' }
});