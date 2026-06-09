// app/_layout.tsx
import { Href, Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { UserProvider, useUser } from '../src/context/UserContext';
import { AlertsProvider } from '../src/context/AlertsContext';

// Centralize initialization rules via your local service parameters
import { configureNotifications, requestNotificationPermissions } from '../src/service/NotificationService';

// 🗑️ REMOVE: import * as Notifications from 'expo-notifications';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { userData, isLoading } = useUser();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const rootSegment = segments[0] ? String(segments[0]) : '';

  useEffect(() => {
    // Initialize notification parameters safely via the dynamic shield service
    configureNotifications();
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    if (!navigationState?.key || isLoading) return;

    const isGuestArea = rootSegment === '' || rootSegment === 'index' || rootSegment === 'forgot-password';

    if (!userData) {
      if (!isGuestArea) router.replace('/');
      return;
    }

    const role = (userData?.role || '').trim().toLowerCase();
    const isJurutera = role === 'engineer' || role === 'jurutera';
    const isPengurus = role === 'operationmanager' || role === 'pengurus';
    const isPenyelaras = role === 'servicecoordinator' || role === 'penyelaras';

    if (!isJurutera && !isPengurus && !isPenyelaras) {
      if (!isGuestArea) router.replace('/');
      return;
    }

    if (isGuestArea) {
      if (isJurutera) router.replace('/(jurutera)' as Href);
      else if (isPengurus) router.replace('/(pengurus)' as Href);
      else if (isPenyelaras) router.replace('/(penyelaras)' as Href);
    }
  }, [userData, isLoading, rootSegment, navigationState?.key]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <UserProvider>
      <AlertsProvider>
        <StatusBar style="auto" />
        <RootLayoutNav />
      </AlertsProvider>
    </UserProvider>
  );
}