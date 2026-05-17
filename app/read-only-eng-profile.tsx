import { Stack } from 'expo-router';
import React from 'react';
// Add curly braces here to match the named export from your screen file
import { ROEP } from '../src/screen/ReadOnlyEngProfile';

export default function Page() {
    return (
        <>
            <Stack.Screen
                options={{
                    title: '',
                    headerBackTitle: 'Back',
                    headerShadowVisible: false
                }}
            />
            <ROEP />
        </>
    );
}