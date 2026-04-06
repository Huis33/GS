import { Stack } from 'expo-router';
import React from 'react';
import ForgotPasswordScreen from '../src/screen/ForgotPasswordScreen';

export default function Page() {
    return (
        <>
            <Stack.Screen options={{ title: '', headerBackTitle: 'Back', headerShadowVisible: false }} />
            <ForgotPasswordScreen />
        </>
    );
}