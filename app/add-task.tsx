import { Stack } from 'expo-router';
import React from 'react';
import AddT from '../src/screen/AddTask';

export default function Page() {
    return (
        <>
            <Stack.Screen options={{ title: '', headerBackTitle: 'Back', headerShadowVisible: false }} />
            <AddT />
        </>
    );
}