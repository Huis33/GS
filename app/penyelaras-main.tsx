import { Stack } from 'expo-router';
import React from 'react';
import PenyelarasMainPage from '../src/screen/PenyelarasMainPage';

export default function Page() {
    return (
        <>
            <Stack.Screen options={{ title: 'Penyelaras Main Page', headerBackTitle: 'Back', headerShown: false }} />
            <PenyelarasMainPage />
        </>
    );
}