import { Stack } from 'expo-router';
import React from 'react';
import PMainPage from '../app/(pengurus)/PMainPage';

export default function Page() {
    return (
        <>
            <Stack.Screen options={{ title: 'Pengurus Main Page', headerBackTitle: 'Back', headerShown: false }} />
            <PMainPage />
        </>
    );
}