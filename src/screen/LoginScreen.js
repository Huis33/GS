// src/screen/LoginScreen.js
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient'; // 🚀 IMPORT LINEAR GRADIENT
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import { useUser } from '../context/UserContext';
import { loginUser } from '../service/AuthService';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
    const { setUserData } = useUser();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter both email and password.");
            return;
        }

        setLoading(true);

        try {
            const result = await loginUser(email, password);
            await AsyncStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');
            setUserData(result);
            setLoading(false);
        } catch (error) {
            console.error("Login Screen Catch Error:", error);
            let errorMessage = "Something went wrong. Please try again.";
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
                errorMessage = "Invalid email or password.";
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = "Too many attempts. Try again later.";
            }
            Alert.alert("Login Failed", errorMessage);
            setLoading(false);
        }
    };

    return (
        <ScreenContainer style={{ flex: 1 }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    bounces={false} // Prevents white space showing at top on iOS drag
                >
                    {/* 🚀 GRADIENT HEADER SECTION */}
                    <LinearGradient
                        colors={['#102142', '#1A3668', '#5D82C8', '#FFFFFF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.headerGradient}
                    >
                        {/* 🚀 Logo and Text are now direct children, which allows flexbox to center them perfectly */}
                        <Image
                            source={require('../../assets/images/GS-logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.welcomeText}>Welcome</Text>
                    </LinearGradient>

                    {/* LOWER WHITE SECTION (Input Fields) */}
                    <View style={styles.formContainer}>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter your email"
                                placeholderTextColor="#888888"
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!isPasswordVisible}
                                    placeholder="Enter your password"
                                    placeholderTextColor="#888888"
                                />
                                <TouchableOpacity onPress={() => setPasswordVisible(!isPasswordVisible)}>
                                    <Ionicons
                                        name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
                                        size={22}
                                        color="#888888"
                                    />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                style={styles.forgotBtn}
                                onPress={() => router.push('/forgot-password')}
                            >
                                <Text style={styles.forgotText}>Forgot password?</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.rememberContainer}
                            onPress={() => setRememberMe(!rememberMe)}
                        >
                            <Ionicons
                                name={rememberMe ? "checkbox" : "square-outline"}
                                size={24}
                                color="#1A3668"
                            />
                            <Text style={styles.rememberText}>Remember Me</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.loginButton, loading && styles.disabledBtn]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.loginButtonText}>Log In</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    scrollContent: {
        flexGrow: 1,
    },

    /* 🚀 Gradient Header Styles */
    headerGradient: {
        height: height * 0.45,
        justifyContent: 'center', // 🚀 Vertically centers children
        alignItems: 'center',     // 🚀 Horizontally centers children
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        paddingTop: 40,
    },
    logo: {
        width: 250,
        height: 250,
        marginBottom: -15,      // Adjust this to control how close it sticks to the text
        alignSelf: 'center',    // Ensures the image stays in the center axis
    },
    welcomeText: {
        fontSize: 34,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',    // Ensures text is centered
        letterSpacing: 1
    },

    /* Lower Form Styles */
    formContainer: {
        paddingHorizontal: 30,
        paddingTop: 20,
        paddingBottom: 40,
    },
    inputWrapper: { marginBottom: 20 },
    label: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 8 },
    input: {
        height: 58, backgroundColor: '#fff', borderRadius: 12,
        paddingHorizontal: 15, fontSize: 16, borderWidth: 1, borderColor: '#E8E8E8',
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 5, color: '#000'
    },
    passwordContainer: {
        flexDirection: 'row', alignItems: 'center', height: 55,
        backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 15,
        borderWidth: 1, borderColor: '#E8E8E8', elevation: 2,
    },
    passwordInput: { flex: 1, fontSize: 16, color: '#000' },
    forgotBtn: { alignSelf: 'flex-end', marginTop: 10 },
    forgotText: { color: '#274B8C', fontWeight: '700' }, // Matched to gradient bottom color
    loginButton: {
        backgroundColor: '#1A3668', // Matched to gradient middle color
        height: 60, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center', marginTop: 20,
        elevation: 4, shadowColor: '#1A3668', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8,
    },
    disabledBtn: { backgroundColor: '#a5b9e8' },
    loginButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    rememberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        marginBottom: 5,
    },
    rememberText: {
        fontSize: 14,
        color: '#1A3668', // Matches your corporate blue
        fontWeight: '500',
        marginLeft: 8,    // Adds space between the checkbox icon and the text
    },
});