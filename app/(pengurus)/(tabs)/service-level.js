import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SectionList,
    TouchableOpacity,
    SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ServiceLevelScreen() {
    // Fake Data structured for SectionList
    // This can be easily replaced by Firebase data mapped into this format
    const router = useRouter();
    const SERVICE_CATEGORIES = [
        {
            title: 'Critical',
            color: '#FDECEC', // Light Red
            icon: 'alert-circle',
            data: [
                'Emergency Equipment Failure',
                'Safety Hazard Incident',
                'Critical System Outage'
            ]
        },
        {
            title: 'High',
            color: '#FEF0E6', // Light Orange
            icon: 'arrow-up',
            data: [
                'Equipment Calibration',
                'System Performance Issue',
                'Urgent Technical Support',
                'Pre-Scheduled Critical Operation Support'
            ]
        },
        {
            title: 'Medium',
            color: '#FFF9E6', // Light Yellow
            icon: 'remove',
            data: [
                'User Testing Session',
                'System Validation and Verification'
            ]
        },
        {
            title: 'Low',
            color: '#F1F9F1', // Light Green
            icon: 'arrow-down',
            data: [
                'Small Failure'
            ] // Empty for now as per image
        }
    ];

    const renderHeader = ({ section: { title, color, icon } }) => (
        <View style={[styles.sectionHeader, { backgroundColor: color }]}>
            <Ionicons name={icon} size={24} color="#333" style={styles.sectionIcon} />
            <Text style={styles.sectionHeaderText}>{title}</Text>
        </View>
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.itemContainer}>
            <Text style={styles.itemText}>{item}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.totalText}>Total 10 Categories</Text>

                <SectionList
                    sections={SERVICE_CATEGORIES}
                    keyExtractor={(item, index) => item + index}
                    renderItem={renderItem}
                    renderSectionHeader={renderHeader}
                    stickySectionHeadersEnabled={false}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            {/* Floating Action Button */}
            <TouchableOpacity 
                style={styles.fab}
                onPress={() => router.push('/add-category')}>
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
    },
    totalText: {
        fontSize: 14,
        color: '#666',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    sectionIcon: {
        marginRight: 10,
    },
    sectionHeaderText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
    },
    itemContainer: {
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    itemText: {
        fontSize: 16,
        color: '#333',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#2F80ED',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    }
});