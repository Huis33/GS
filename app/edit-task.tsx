import { Stack } from 'expo-router';
import React from 'react';
import EditT from '../src/screen/EditTask';

export default function Page() {
    return (
        <>
            <Stack.Screen options={{ title: '', headerBackTitle: 'Back', headerShadowVisible: false }} />
            <EditT />
        </>
    );
}