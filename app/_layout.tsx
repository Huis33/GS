// app/_layout.tsx
import { Href, Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { UserProvider, useUser } from '../src/context/UserContext';
import { AlertsProvider } from '../src/context/AlertsContext';

// Centralize initialization rules via your local service parameters
import { configureNotifications, requestNotificationPermissions } from '../src/service/NotificationService';
import NotificationModalWrapper from '../components/NotificationModalWrapper';
import { StatusBar } from 'react-native';

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

  if (isLoading) return null;

  if (!userData) {
    return <Stack screenOptions={{ headerShown: false }} />;
  }

  return (
    <AlertsProvider>
      <NotificationModalWrapper>
        <Stack screenOptions={{ headerShown: false }} />
      </NotificationModalWrapper>
    </AlertsProvider>
  );
}

export default function RootLayout() {
  return (
    <UserProvider>
      <AlertsProvider>
        {/* 🚀 Updated: Use style="dark" for light backgrounds */}
        {/* translucent={false} ensures the header content doesn't overlap the status icons */}
        <StatusBar translucent={false} backgroundColor="#F8FAFF" />
        <RootLayoutNav />
      </AlertsProvider>
    </UserProvider>
  );
}