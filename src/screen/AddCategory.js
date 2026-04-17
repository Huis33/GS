import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import { addPriorityCategory } from '../service/priorityService';

export default function AddCategoryScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const isDirtyRef = useRef(false);

    // Form States
    const [categoryName, setCategoryName] = useState('');
    const [description, setDescription] = useState(''); 
    const [priority, setPriority] = useState(null); // Default is null
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const priorityOptions = ['Critical', 'High', 'Medium', 'Low'];

    const handleSave = async () => {
        // Validation
        if (!categoryName || !description || !priority) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        try {
            // Show a loading state if you have one, or just proceed
            await addPriorityCategory(categoryName, description, priority);
            Alert.alert("Success", "Category added to database!");
            isDirtyRef.current = false;
            router.back(); // Navigate back to the list
        } catch (error) {
            Alert.alert("Upload Failed", "Could not save to Firebase. Please try again.");
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            // If the ref is false, we just let the user navigate away
            if (!isDirtyRef.current) {
                return;
            }

            // If changes exist, stop the navigation and show the alert
            e.preventDefault();

            Alert.alert(
                'Unsaved Changes',
                'You have unsaved information. Are you sure you want to leave?',
                [
                    { text: "Stay", style: 'cancel', onPress: () => { } },
                    {
                        text: 'Discard',
                        style: 'destructive',
                        // resume the navigation action that was blocked
                        onPress: () => navigation.dispatch(e.data.action),
                    },
                ]
            );
        });

        return unsubscribe;
    }, [navigation]);

    // Monitor changes to form fields
    useEffect(() => {
        if (categoryName.length > 0 || description.length > 0 || priority !== null) {
            isDirtyRef.current = true;
        } else {
            isDirtyRef.current = false;
        }
    }, [categoryName, description, priority]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="arrow-back" size={28} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Category</Text>
                <View style={{ width: 28 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

                    <View style={styles.formCard}>
                        <Text style={styles.label}>Category Name</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter category name"
                                value={categoryName}
                                onChangeText={setCategoryName}
                                maxLength={50}
                            />
                        </View>
                        <Text style={styles.charCount}>{categoryName.length}/50</Text>

                        <Text style={styles.label}>Description</Text>
                        <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Enter description"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                maxLength={500}
                                textAlignVertical="top"
                            />
                        </View>
                        <Text style={styles.charCount}>{description.length}/500</Text>

                        <Text style={styles.label}>Priority</Text>
                        <View style={styles.dropdownContainer}>
                            <TouchableOpacity
                                style={[styles.dropdown, isDropdownOpen && styles.dropdownActive]}
                                onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <Text style={[styles.dropdownText, !priority && { color: '#9CA3AF' }]}>
                                    {priority ? priority : "Select Priority Level"}
                                </Text>
                                <Ionicons name={isDropdownOpen ? "chevron-up" : "chevron-down"} size={20} color="#333" />
                            </TouchableOpacity>

                            {isDropdownOpen && (
                                <View style={styles.dropdownList}>
                                    {priorityOptions.map((option) => (
                                        <TouchableOpacity
                                            key={option}
                                            style={styles.dropdownOption}
                                            onPress={() => {
                                                setPriority(option);
                                                setIsDropdownOpen(false);
                                            }}
                                        >
                                            <Text style={styles.optionText}>{option}</Text>
                                            {priority === option && <Ionicons name="checkmark" size={18} color="#2F80ED" />}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Add Category</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
    },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#000' },
    scrollContent: { padding: 20 },
    formCard: {
        backgroundColor: '#FFFBEB', // Matches card theme
        borderRadius: 15,
        padding: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    inputWrapper: {
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: Platform.OS === 'ios' ? 12 : 5,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    input: { fontSize: 16, color: '#333' },
    charCount: { textAlign: 'right', fontSize: 12, color: '#9CA3AF', marginTop: 5, marginBottom: 15 },
    textAreaWrapper: { height: 120 },
    textArea: { height: '100%' },

    // Dropdown Styles
    dropdownContainer: { zIndex: 1000 },
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    dropdownActive: {
        borderColor: '#2F80ED',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    dropdownText: { fontSize: 16, color: '#333' },
    dropdownList: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderTopWidth: 0,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    dropdownOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    optionText: { fontSize: 16, color: '#4B5563' },

    saveButton: {
        backgroundColor: '#2F80ED',
        borderRadius: 15,
        paddingVertical: 18,
        alignItems: 'center',
    },
    saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});