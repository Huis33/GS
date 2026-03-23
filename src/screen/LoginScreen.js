import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig'
import { router } from 'expo-router';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.replace('/(tabs)');
        } catch (error) {
            // Removed ': any' type annotation
            Alert.alert('Login Failed', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            router.replace('/(tabs)');
        } catch (error) {
            // Removed ': any' type annotation
            Alert.alert('Sign Up Failed', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.formContainer}>
                <Text style={styles.title}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
                <Text style={styles.subtitle}>
                    {isSignUp ? 'Sign up to get started' : 'Sign in to continue'}
                </Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={isSignUp ? handleSignUp : handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>{isSignUp ? 'Sign Up' : 'Login'}</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.switchButton}
                    onPress={() => setIsSignUp(!isSignUp)}
                >
                    <Text style={styles.switchText}>
                        {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                        <Text style={styles.switchTextBold}>{isSignUp ? 'Login' : 'Sign Up'}</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 32,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#333',
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 12,
    },
    buttonDisabled: {
        backgroundColor: '#999',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    switchButton: {
        marginTop: 24,
        alignItems: 'center',
    },
    switchText: {
        fontSize: 14,
        color: '#666',
    },
    switchTextBold: {
        color: '#007AFF',
        fontWeight: '600',
    },
});