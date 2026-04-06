import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
//import { auth } from '../../firebaseConfig';
//import { sendPasswordResetEmail } from 'firebase/auth';
import { resetPassword } from '../../src/service/AuthService';

export default function ForgetPasswordScreen() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleBack = () => {
        router.back(); // Use this instead of navigation.goBack()
    };

    const handlePasswordReset = async () => {
        if (!email || !email.includes('@')) {
            Alert.alert("Invalid Email", "Please enter a valid email address.");
            return;
        }

        setLoading(true);
        try {
            // Use the service function here
            await resetPassword(email);

            Alert.alert(
                "Success",
                "Check your inbox for the reset link.",
                [{ text: "OK", onPress: () => router.back() }]
            );
        } catch (error) {
            // Handle specific Firebase error codes
            let msg = "Failed to send reset email.";
            if (error.code === 'auth/user-not-found') msg = "No account exists with this email.";

            Alert.alert("Error", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.inner}>
                {/* Back Button */}
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.title}>Reset Password</Text>
                    <Text style={styles.subtitle}>
                        Enter your email and we'll send you a secure link to reset your password.
                    </Text>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="yourname@example.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.disabledButton]}
                    onPress={handlePasswordReset}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Send Reset Link</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    inner: { padding: 25, flex: 1, justifyContent: 'center' },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        left: 20,
        padding: 10
    },
    header: { marginBottom: 40 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    subtitle: { fontSize: 16, color: '#666', lineHeight: 22 },
    inputContainer: { marginBottom: 30 },
    label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 10 },
    input: {
        height: 55,
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#F9F9F9',
        color: '#333'
    },
    button: {
        backgroundColor: '#4CAF50',
        height: 55,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    disabledButton: { backgroundColor: '#A5D6A7' },
    buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});