import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../../firebaseConfig';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // ✅ Track if auth is still checking

    useEffect(() => {
        let unsubscribe = null;
        let isMounted = true;

        const setup = async () => {
            // 1. Check rememberMe BEFORE subscribing to auth changes
            const rememberMe = await AsyncStorage.getItem('rememberMe');
            console.log('[UserProvider] rememberMe =', rememberMe, '| auth.currentUser =', auth.currentUser?.uid || null);

            if (auth.currentUser && rememberMe !== 'true') {
                // User didn't ask to be remembered — sign them out first
                console.log('[UserProvider] Signing out — rememberMe is not true');
                await signOut(auth);
            }

            if (!isMounted) return;

            // 2. Now subscribe to auth state changes normally
            unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                if (!isMounted) return;
                setIsLoading(true);
                console.log('[UserProvider] onAuthStateChanged fired. user =', firebaseUser?.uid || null);

                if (firebaseUser) {
                    // Re-check rememberMe here — the setup() check may have missed
                    // because auth.currentUser was null before Firebase restored the session
                    const rememberMeNow = await AsyncStorage.getItem('rememberMe');
                    console.log('[UserProvider] rememberMe (in listener) =', rememberMeNow);

                    if (rememberMeNow !== 'true') {
                        // User logged out but Firebase restored session from persistence
                        console.log('[UserProvider] rememberMe is not true — signing out restored session');
                        await signOut(auth);
                        // signOut will trigger this listener again with null user
                        return;
                    }

                    try {
                        const docRef = doc(db, "user", firebaseUser.uid);
                        const docSnap = await getDoc(docRef);
                        if (!isMounted) return;
                        if (docSnap.exists()) {
                            console.log('[UserProvider] userData set for role:', docSnap.data().role);
                            setUserData({ ...docSnap.data(), uid: firebaseUser.uid });
                        } else {
                            setUserData(null);
                        }
                    } catch (error) {
                        if (!isMounted) return;
                        console.error("Error fetching user data:", error);
                        setUserData(null);
                    }
                } else {
                    console.log('[UserProvider] No user — setting userData to null');
                    setUserData(null);
                }
                setIsLoading(false);
            });
        };

        setup();

        return () => {
            isMounted = false;
            if (unsubscribe) unsubscribe();
        };
    }, []);

    return (
        <UserContext.Provider value={{ userData, setUserData, isLoading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);