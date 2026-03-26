import { Stack } from 'expo-router';
import React from 'react';
import PengurusMainPage from '../src/screen/PengurusMainPage.js';

export default function Page() {
    return (
        <>
            <Stack.Screen options={{ title: 'Pengurus Main Page', headerBackTitle: 'Back', headerShown: false }} />
            <PengurusMainPage />
        </>
    );
}