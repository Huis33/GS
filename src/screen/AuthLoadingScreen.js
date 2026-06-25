// src/screen/AuthLoadingScreen.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';

export default function AuthLoadingScreen() {
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            // 🚀 Fetch preference. Default to 'false' if null
            const rememberMe = await AsyncStorage.getItem('rememberMe');

            if (user && rememberMe === 'true') {
                try {
                    // Fetch role to determine route
                    const userDoc = await getDoc(doc(db, 'user', user.uid));
                    const role = userDoc.exists() ? userDoc.data().role : null;

                    if (role === 'Jurutera') router.replace('/jurutera-main');
                    else if (role === 'Penyelaras') router.replace('/penyelaras-main');
                    else if (role === 'Pengurus') router.replace('/pengurus-main');
                    else router.replace('/login');
                } catch (e) {
                    router.replace('/login');
                }
            } else {
                // Not remembered or no user — go to login
                if (user) {
                    await signOut(auth);
                }
                router.replace('/login');
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#1A3668" />
        </View>
    );
}