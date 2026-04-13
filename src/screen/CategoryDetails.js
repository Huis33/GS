import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
// Firebase imports
import { db } from '../../firebaseConfig';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function CategoryDetailScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const { id } = useLocalSearchParams(); // Retrieve the document ID from the route params

    const [loading, setLoading] = useState(true);
    const [categoryName, setCategoryName] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [isEditing, setIsEditing] = useState(false);
    const [initialData, setInitialData] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const priorityOptions = ['Critical', 'High', 'Medium', 'Low'];
    const PRIORITY_STYLES = {
        'Critical': { bg: '#FDECEC', border: '#F8D7DA' }, // Light Red
        'High': { bg: '#FEF0E6', border: '#FADDCB' }, // Light Orange
        'Medium': { bg: '#FFF9E6', border: '#FEF3C7' }, // Light Yellow (Default)
        'Low': { bg: '#F1F9F1', border: '#D4EDDA' }, // Light Green
    };
    const currentStyle = PRIORITY_STYLES[priority] || PRIORITY_STYLES['Medium'];
    const hasUnsavedChanges = () => {
        if (!initialData) return false;
        return (
            categoryName !== initialData.categoryName ||
            description !== initialData.description ||
            priority !== initialData.priority
        );
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            // Only show alert if we are in editing mode
            if (!isEditing || !hasUnsavedChanges()) {
                return;
            }

            // Prevent default behavior (leaving)
            e.preventDefault();

            Alert.alert(
                'Unsaved Changes',
                'Discard changes and leave?',
                [
                    { text: "Stay", style: 'cancel', onPress: () => { } },
                    {
                        text: 'Discard',
                        style: 'destructive',
                        // Dispatch the action to actually leave
                        onPress: () => navigation.dispatch(e.data.action),
                    },
                ]
            );
        });

        return unsubscribe;
    }, [navigation, isEditing, categoryName, description, priority, initialData]);

    useEffect(() => {
        fetchCategoryDetails();
    }, [id]);

    const fetchCategoryDetails = async () => {
        try {
            const docRef = doc(db, 'priority', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const fetchedName = data.categoryName || '';
                const fetchedDesc = data.description || '';
                const fetchedPriority = data.category || 'Medium';

                setCategoryName(fetchedName);
                setDescription(fetchedDesc);
                setPriority(fetchedPriority);

                // 4. Store the original data for comparison later
                setInitialData({
                    categoryName: fetchedName,
                    description: fetchedDesc,
                    priority: fetchedPriority
                });
            } else {
                Alert.alert("Error", "Category not found");
                router.back();
            }
        } catch (error) {
            console.error("Error fetching details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const docRef = doc(db, 'priority', id);
            await updateDoc(docRef, {
                categoryName: categoryName,
                description: description,
                category: priority
            });
            setInitialData({ categoryName, description, priority });
            Alert.alert("Success", "Category updated successfully!");
            setIsEditing(false);
        } catch (error) {
            console.error("Update Error:", error);
            Alert.alert("Error", "Could not update category.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Category",
            "Are you sure you want to delete this category? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await deleteDoc(doc(db, 'priority', id));
                            Alert.alert("Deleted", "Category has been removed.");
                            setIsEditing(false); // Clear editing flag to avoid alert
                            router.replace('/service-level'); // Navigate back
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete.");
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2F80ED" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Category Details</Text>
                <TouchableOpacity onPress={() => isEditing ? handleUpdate() : setIsEditing(true)}>
                    <Ionicons
                        name={isEditing ? "checkmark-sharp" : "pencil"}
                        size={24}
                        color={isEditing ? "#27AE60" : "black"}
                    />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    {/* START OF SINGLE DYNAMIC CARD */}
                    <View style={[
                        styles.detailCard,
                        {
                            backgroundColor: currentStyle.bg,
                            borderColor: currentStyle.border
                        }
                    ]}>
                        {/* Category Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Category Name</Text>
                            <TextInput
                                style={styles.whiteInput}
                                value={categoryName}
                                onChangeText={setCategoryName}
                                editable={isEditing}
                            />
                        </View>

                        {/* Description */}
                        <View style={styles.inputGroup}>
                            <div style={styles.labelRow}>
                                <Text style={styles.label}>Description</Text>
                                <Text style={styles.charCount}>{description.length}/500</Text>
                            </div>
                            <TextInput
                                style={[styles.whiteInput, styles.textArea]}
                                value={description}
                                onChangeText={setDescription}
                                editable={isEditing}
                                multiline
                            />
                        </View>

                        {/* Priority Selection */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Priority</Text>
                            <View style={styles.dropdownContainer}>
                                <TouchableOpacity
                                    style={[styles.dropdown, isDropdownOpen && styles.dropdownActive]}
                                    onPress={() => isEditing && setIsDropdownOpen(!isDropdownOpen)}
                                    activeOpacity={0.8}
                                    disabled={!isEditing}
                                >
                                    <Text style={[styles.dropdownText, !priority && { color: '#9CA3AF' }]}>
                                        {priority || "Select Priority Level"}
                                    </Text>
                                    <Ionicons
                                        name={isDropdownOpen ? "chevron-up" : "chevron-down"}
                                        size={20}
                                        color="#333"
                                    />
                                </TouchableOpacity>

                                {isDropdownOpen && isEditing && (
                                    <View style={styles.dropdownMenu}>
                                        {priorityOptions.map((option) => (
                                            <TouchableOpacity
                                                key={option}
                                                style={styles.dropdownItem}
                                                onPress={() => {
                                                    setPriority(option);
                                                    setIsDropdownOpen(false);
                                                }}
                                            >
                                                <Text style={styles.itemText}>{option}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Delete Button (Only visible during editing) */}
                        {isEditing && (
                            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                                <Ionicons name="trash-outline" size={20} color="#EB5757" />
                                <Text style={styles.deleteButtonText}>Delete Category</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    scrollContent: { padding: 20 },
    detailCard: { borderRadius: 15, padding: 20, borderWidth: 2 },
    inputGroup: { marginBottom: 20 },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', // Ensures they stay vertically centered with each other
        marginBottom: 8,      // Space between the label row and the text input
    },
    charCount: {
        fontSize: 12,
        color: '#999',
        marginLeft: 10,       // ADD THIS: Creates a minimum gap even if they squeeze
    },
    label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
    whiteInput: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 12,
        fontSize: 15,
        color: '#333',
        borderWidth: 1,
        borderColor: '#E5E7EB'
    },
    textArea: { height: 120, textAlignVertical: 'top' },
    dropdownContainer: { zIndex: 1000 },
    dropdown: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB'
    },
    dropdownActive: { borderColor: '#2F80ED', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
    dropdownText: { fontSize: 15, color: '#333' },
    dropdownMenu: {
        backgroundColor: '#fff',
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E5E7EB',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        elevation: 5,
        zIndex: 2000
    },
    dropdownItem: { padding: 15, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
    itemText: { fontSize: 15, color: '#333' },

    // Delete Button Styles
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#EB5757',
        borderRadius: 10,
        backgroundColor: '#fff'
    },
    deleteButtonText: {
        color: '#EB5757',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 15
    }
});