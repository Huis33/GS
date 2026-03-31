import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../context/UserContext';
import { loginUser } from '../service/AuthService';

export default function LoginScreen() {
    const { setUserData } = useUser();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter both email and password.");
            return;
        }

        setLoading(true);

        try {
            // result contains { user, role, status } from your AuthService
            const result = await loginUser(email, password);
            setUserData(result);
            const userRole = result.role;

            // Role-Based Navigation Logic
            if (userRole === 'Engineer') {
                router.replace('/jurutera-main');
            } else if (userRole === 'OperationManager') {
                router.replace('/pengurus-main');
            } else if (userRole === 'ServiceCoordinator') {
                router.replace('/penyelaras-main');
            } else {
                // Fallback for unexpected roles
                Alert.alert("Access Denied", "Your role is not authorized for this app.");
                setLoading(false);

            }

        } catch (error) {
            console.error("Login Error:", error.code);
            let errorMessage = "Something went wrong. Please try again.";

            // Check if error.code exists (Firebase errors) or use error.message
            if (error.code) {
                switch (error.code) {
                    case 'auth/invalid-credential':
                    case 'auth/user-not-found':
                        errorMessage = "Invalid email or password.";
                        break;
                    case 'auth/too-many-requests':
                        errorMessage = "Too many attempts. Try again later.";
                        break;
                    default:
                        errorMessage = error.message;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            Alert.alert("Login Failed", errorMessage);
            setLoading(false);
        }
}

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.content}
            >
                {/* Branding / Logo Section */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/images/logo.jpg')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.welcomeText}>{'Welcome'}</Text>
                </View>

                {/* Input Fields */}
                <View style={styles.form}>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>{'Email'}</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>{'Password'}</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!isPasswordVisible}
                                placeholder="Enter your password"
                            />
                            <TouchableOpacity onPress={() => setPasswordVisible(!isPasswordVisible)}>
                                <Ionicons
                                    name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
                                    size={22}
                                    color="#BDBDBD"
                                />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={styles.forgotBtn}
                            onPress={() => router.push('/forgot-password')}
                        >
                            <Text style={styles.forgotText}>{'Forgot password?'}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Main Login Button */}
                    <TouchableOpacity
                        style={[styles.loginButton, loading && styles.disabledBtn]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>{'Log In'}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    content: { flex: 1, paddingHorizontal: 30, justifyContent: 'center' },
    logoContainer: { alignItems: 'center', marginBottom: 40 },
    logo: { width: 140, height: 140, marginBottom: 15 },
    welcomeText: { fontSize: 32, fontWeight: '800', color: '#000' },
    form: { width: '100%' },
    inputWrapper: { marginBottom: 20 },
    label: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 8 },
    input: {
        height: 55, backgroundColor: '#fff', borderRadius: 12,
        paddingHorizontal: 15, fontSize: 16, borderWidth: 1, borderColor: '#E8E8E8',
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 5,
    },
    passwordContainer: {
        flexDirection: 'row', alignItems: 'center', height: 55,
        backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 15,
        borderWidth: 1, borderColor: '#E8E8E8', elevation: 2,
    },
    passwordInput: { flex: 1, fontSize: 16 },
    forgotBtn: { alignSelf: 'flex-end', marginTop: 10 },
    forgotText: { color: '#6389DA', fontWeight: '600' },
    loginButton: {
        backgroundColor: '#6389DA', height: 55, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center', marginTop: 20,
        elevation: 4, shadowColor: '#6389DA', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8,
    },
    disabledBtn: { backgroundColor: '#a5b9e8' },
    loginButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});