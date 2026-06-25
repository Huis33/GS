import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { auth, db } from '../../firebaseConfig';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // Track whether the first onAuthStateChanged callback is the initial app-load check
    const isInitialAuthCheck = useRef(true);

    useEffect(() => {
        let unsubscribe = null;
        let isMounted = true;

        const setup = async () => {
            // 1. Check rememberMe BEFORE subscribing to auth changes
            const rememberMe = await AsyncStorage.getItem('rememberMe');
            console.log('[UserProvider] rememberMe =', rememberMe, '| auth.currentUser =', auth.currentUser?.uid || null);

            // If auth.currentUser is already available and rememberMe is off, sign out early
            if (auth.currentUser && rememberMe !== 'true') {
                console.log('[UserProvider] Signing out early — rememberMe is not true');
                await signOut(auth);
            }

            if (!isMounted) return;

            // 2. Subscribe to auth state changes
            unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                if (!isMounted) return;
                setIsLoading(true);
                console.log('[UserProvider] onAuthStateChanged fired. user =', firebaseUser?.uid || null, '| isInitialCheck =', isInitialAuthCheck.current);

                if (firebaseUser) {
                    // Only check rememberMe on initial app load (restored session).
                    // Live logins from LoginScreen should NOT be blocked — the user
                    // intentionally logged in, they just don't want to be remembered next time.
                    if (isInitialAuthCheck.current) {
                        isInitialAuthCheck.current = false;
                        const rememberMeNow = await AsyncStorage.getItem('rememberMe');
                        console.log('[UserProvider] Initial auth check — rememberMe =', rememberMeNow);

                        if (rememberMeNow !== 'true') {
                            console.log('[UserProvider] Not remembered — signing out restored session');
                            await signOut(auth);
                            // signOut triggers this listener again with null user
                            return;
                        }
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
                    // Mark initial check as done (if it was a null-user first callback)
                    isInitialAuthCheck.current = false;
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