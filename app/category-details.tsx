import { Stack } from 'expo-router';
import React from 'react';
import CDetails from '../src/screen/CategoryDetails';

export default function Page() {
    return (
        <>
            <Stack.Screen options={{ title: '', headerBackTitle: 'Back', headerShadowVisible: false }} />
            <CDetails />
        </>
    );
}