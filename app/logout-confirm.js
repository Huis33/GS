import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function LogoutConfirm() {
    const confirmLogout = async () => {
        await signOut(auth);
        router.replace('/');
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.text}>
                    Are you sure you want to log out?
                </Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={confirmLogout}
                    >
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F7FB', // softer background
        padding: 20,
    },
    card: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 25, // 👈 bigger radius
        padding: 25,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
    },
    text: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 30,
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'column',
        gap: 15, // 👈 adds spacing between buttons
    },
    cancelButton: {
        backgroundColor: '#E5E7EB', // 👈 softer gray
        paddingVertical: 14,
        borderRadius: 15,
        alignItems: 'center',
    },
    cancelText: {
        color: '#374151',
        fontWeight: '600',
        fontSize: 16,
    },
    logoutButton: {
        backgroundColor: '#F87171', // 👈 softer red (not too sharp)
        paddingVertical: 14,
        borderRadius: 15,
        alignItems: 'center',
    },
    logoutText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
});