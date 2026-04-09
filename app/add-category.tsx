import { Stack } from 'expo-router';
import React from 'react';
import AddC from '../src/screen/AddCategory';

export default function Page() {
    return (
        <>
            <Stack.Screen options={{ title: '', headerBackTitle: 'Back', headerShadowVisible: false }} />
            <AddC />
        </>
    );
}