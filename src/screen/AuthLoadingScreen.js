// src/screen/AuthLoadingScreen.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';

export default function AuthLoadingScreen() {
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            const rememberMe = await AsyncStorage.getItem('rememberMe');

            if (user && rememberMe === 'true') {
                try {
                    const userDoc = await getDoc(doc(db, 'user', user.uid));
                    const role = userDoc.exists() ? userDoc.data().role : null;

                    if (role === 'Jurutera') router.replace('/jurutera-main');
                    else if (role === 'Penyelaras') router.replace('/penyelaras-main');
                    else if (role === 'Pengurus') router.replace('/pengurus-main');
                    else router.replace('/LoginScreen');
                } catch (e) {
                    router.replace('/LoginScreen');
                }
            } else {
                router.replace('/LoginScreen');
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