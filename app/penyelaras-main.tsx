import { Stack } from 'expo-router';
import React from 'react';
import SCMainPage from '../app/(penyelaras)/SCMainPage';

export default function Page() {
    return (
        <>
            <Stack.Screen options={{ title: 'Penyelaras Main Page', headerBackTitle: 'Back', headerShown: false }} />
            <SCMainPage />
        </>
    );
}