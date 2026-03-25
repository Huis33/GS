import { Stack } from 'expo-router';
import React from 'react';
import JuruteraMainPage from '../src/screen/JuruteraMainPage.js';

export default function Page() {
    return (
        <>
            <Stack.Screen options={{ title: 'Jurutera Main Page', headerBackTitle: 'Back', headerShown: false }} />
            <JuruteraMainPage />
        </>
    );
}