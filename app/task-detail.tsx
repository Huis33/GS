import { Stack } from 'expo-router';
import React from 'react';
import TaskDetail from '../src/screen/TaskDetail';

export default function Page() {
    return (
        <>
            <Stack.Screen options={{ title: '', headerBackTitle: 'Back', headerShadowVisible: false }} />
            <TaskDetail />
        </>
    );
}