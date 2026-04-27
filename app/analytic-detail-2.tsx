import { Stack } from 'expo-router';
import React from 'react';
import AnalyticD2 from '../src/screen/AnalyticDetails2';

export default function Page() {
    return (
        <>
            <Stack.Screen options={{ title: '', headerBackTitle: 'Back', headerShadowVisible: false }} />
            <AnalyticD2 />
        </>
    );
}