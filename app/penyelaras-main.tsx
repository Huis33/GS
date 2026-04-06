import { Redirect, Stack } from 'expo-router';

export default function Page() {
    return (
        <>
            {/* Ensures this 'bridge' page is invisible while it redirects */}
            <Stack.Screen options={{ headerShown: false }} />
            <Redirect href={"/(penyelaras)/(tabs)" as any} />
        </>
    );
}