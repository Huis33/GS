import { Stack } from 'expo-router';
import React from 'react';
import AnalyticD from '../src/screen/AnalyticDetails';

export default function Page() {
    return (
        <>
            <Stack.Screen options={{ title: '', headerBackTitle: 'Back', headerShadowVisible: false }} />
            <AnalyticD />
        </>
    );
}