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
            if (auth.currentUser && rememberMe !== 'true') {
                // User didn't ask to be remembered — sign them out first
                await signOut(auth);
            }

            if (!isMounted) return;

            // 2. Now subscribe to auth state changes normally
            unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                if (!isMounted) return;
                setIsLoading(true);

                if (firebaseUser) {
                    try {
                        const docRef = doc(db, "user", firebaseUser.uid);
                        const docSnap = await getDoc(docRef);
                        if (!isMounted) return;
                        if (docSnap.exists()) {
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