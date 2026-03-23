import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebaseConfig';

// Define what our context will provide
type AuthContextType = {
    user: User | null;        // The current user (or null if not logged in)
    isLoading: boolean;       // True while checking auth state
};

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps your app
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // onAuthStateChanged listens for login/logout events
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);          // Update user state
            setIsLoading(false);    // Done loading
        });

        // Cleanup subscription on unmount
        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}