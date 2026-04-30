import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Href, Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

// Import your context and hooks
import { useColorScheme } from '../hooks/use-color-scheme';
import { UserProvider, useUser } from '../src/context/UserContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { userData, isLoading } = useUser();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  const rootSegment = segments[0] ? String(segments[0]) : '';

  useEffect(() => {
    // 1. Wait until Expo Router and Auth are ready
    if (!navigationState?.key || isLoading) {
        console.log("Layout waiting: Navigation ready:", !!navigationState?.key, "Auth Loading:", isLoading);
        return;
    }

    const isGuestArea = rootSegment === '' || rootSegment === 'index' || rootSegment === 'forgot-password';

    // SCENARIO A: NOT LOGGED IN
    if (!userData) {
      console.log("No user data found. Guest Area:", isGuestArea);
      if (!isGuestArea) router.replace('/');
      return;
    }

    // SCENARIO B: LOGGED IN - Role Detection
    const rawRole = userData?.role || '';
    const role = rawRole.trim().toLowerCase(); // Normalize string
    console.log("Logged in user role detected:", role);

    // Map your Database roles (English) to your App logic (Malay)
    const isJurutera = role === 'engineer' || role === 'jurutera';
    const isPengurus = role === 'operationmanager' || role === 'pengurus';
    const isPenyelaras = role === 'servicecoordinator' || role === 'penyelaras';

    // FAILSAFE: If the role is not recognized
    if (!isJurutera && !isPengurus && !isPenyelaras) {
      console.error("CRITICAL: Role not recognized. Check Firestore 'role' field. Value was:", role);
      if (!isGuestArea) router.replace('/');
      return;
    }

    // REDIRECTION LOGIC
    if (isGuestArea) {
      console.log("User is in guest area, redirecting to dashboard...");
      if (isJurutera) {
        router.replace('/(jurutera)' as Href);
    } else if (isPengurus) {
        router.replace('/(pengurus)' as Href);
    } else if (isPenyelaras) {
        router.replace('/(penyelaras)' as Href);
    }
    } else {
      console.log("User is already in their respective dashboard area.");
    }

  }, [userData, isLoading, rootSegment, navigationState?.key]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(jurutera)" />
        <Stack.Screen name="jurutera-main" />
        <Stack.Screen name="(pengurus)" />
        <Stack.Screen name="pengurus-main" />
        <Stack.Screen name="(penyelaras)" />
        <Stack.Screen name="penyelaras-main" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <UserProvider>
      <StatusBar style="auto" />
      <RootLayoutNav />
    </UserProvider>
  );
}