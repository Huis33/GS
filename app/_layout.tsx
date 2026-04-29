import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React, { useEffect } from 'react';

// Import your context and hooks
import { UserProvider, useUser } from '../src/context/UserContext';
import { useColorScheme } from '../hooks/use-color-scheme';

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
    // 1. Wait until Expo Router is completely ready
    if (!navigationState?.key || isLoading) return;

    const isGuestArea = rootSegment === '' || rootSegment === 'index' || rootSegment === 'forgot-password';

    if (!userData) {
      // SCENARIO A: NOT LOGGED IN
      if (!isGuestArea) {
        router.replace('/');
      }
      return;
    }

    // SCENARIO B: LOGGED IN
    // .trim() removes accidental spaces from Firebase like "Jurutera " -> "jurutera"
    const rawRole = userData?.role || '';
    const role = rawRole.trim().toLowerCase();

    // Define valid roles explicitly
    const isJurutera = role === 'jurutera';
    const isPengurus = role === 'pengurus';
    const isPenyelaras = role === 'penyelaras';

    // FAILSAFE: If the user has a weird, missing, or unauthorized role in Firestore,
    // kick them back to login immediately so they don't get stuck in an infinite loop.
    if (!isJurutera && !isPengurus && !isPenyelaras) {
      if (!isGuestArea) {
        router.replace('/');
      }
      return;
    }

    // Rule 1: If they are hanging out on the login page, send them directly to their dashboard
    if (isGuestArea) {
      if (isJurutera) router.replace('/jurutera-main');
      else if (isPengurus) router.replace('/pengurus-main');
      else if (isPenyelaras) router.replace('/penyelaras-main');
      return;
    }

    // Rule 2: Security check. Are they in an area they shouldn't be?
    const inJuruteraArea = rootSegment === '(jurutera)' || rootSegment === 'jurutera-main';
    const inPengurusArea = rootSegment === '(pengurus)' || rootSegment === 'pengurus-main';
    const inPenyelarasArea = rootSegment === '(penyelaras)' || rootSegment === 'penyelaras-main';

    const isInWrongArea =
      (inJuruteraArea && !isJurutera) ||
      (inPengurusArea && !isPengurus) ||
      (inPenyelarasArea && !isPenyelaras);

    // If they are somewhere they shouldn't be, route them EXACTLY to their home. 
    // This stops the infinite bouncing completely.
    if (isInWrongArea) {
      if (isJurutera) router.replace('/jurutera-main');
      else if (isPengurus) router.replace('/pengurus-main');
      else if (isPenyelaras) router.replace('/penyelaras-main');
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