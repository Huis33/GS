// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '../../hooks/use-color-scheme';
import { UserProvider, useUser } from '../../src/context/UserContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { userData, isLoading } = useUser();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // 1. Wait until Navigation and Auth are both ready
    if (!navigationState?.key || isLoading) return;

    // FIX TS(2367): Force segment to string to allow comparison with 'index' or ''
    const rootSegment = (segments[0] as string) || '';
    const isGuestArea = rootSegment === '' || rootSegment === 'index' || rootSegment === 'forgot-password';

    // SCENARIO A: NOT LOGGED IN
    if (!userData) {
      if (!isGuestArea) {
        router.replace('/');
      }
      return;
    }

    // SCENARIO B: LOGGED IN
    const role = (userData?.role || '').trim().toLowerCase();

    // Map roles to their target folders
    const rolePaths: Record<string, string> = {
      jurutera: '/(jurutera)/(tabs)',
      pengurus: '/(pengurus)/(tabs)',
      penyelaras: '/(penyelaras)/(tabs)',
    };

    const targetPath = rolePaths[role];

    // If role is invalid or not in our list, kick to login
    if (!targetPath) {
      if (!isGuestArea) router.replace('/');
      return;
    }

    // Redirect logged-in users away from the login/guest screens
    if (isGuestArea) {
      router.replace(targetPath as any);
      return;
    }

    // Role-Based Access Control: Prevent cross-role folder access
    const inJurutera = rootSegment === '(jurutera)' || rootSegment === 'jurutera-main';
    const inPengurus = rootSegment === '(pengurus)' || rootSegment === 'pengurus-main';
    const inPenyelaras = rootSegment === '(penyelaras)' || rootSegment === 'penyelaras-main';

    const isUnauthorized =
      (inJurutera && role !== 'jurutera') ||
      (inPengurus && role !== 'pengurus') ||
      (inPenyelaras && role !== 'penyelaras');

    if (isUnauthorized) {
      router.replace(targetPath as any);
    }

  }, [userData, isLoading, segments, navigationState?.key]);

  // Prevent "flicker" by showing a loader while auth state is being determined
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2F80ED" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(jurutera)" />
        <Stack.Screen name="(pengurus)" />
        <Stack.Screen name="(penyelaras)" />
        {/* Logic now bypasses these, but we keep them in stack for definition */}
        <Stack.Screen name="jurutera-main" />
        <Stack.Screen name="pengurus-main" />
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