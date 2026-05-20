import { Stack } from 'expo-router';
import React from 'react';

// ✅ FIX: Remove the curly braces and use the actual default exported name
import ReadOnlyCoordProfile from '../src/screen/ReadOnlyCoorProfile';

export default function Page() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            {/* ✅ FIX: Use the component you just imported */}
            <ReadOnlyCoordProfile />
        </>
    );
}