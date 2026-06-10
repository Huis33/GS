// app/_layout.tsx
import { Href, Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { UserProvider, useUser } from '../src/context/UserContext';
import { AlertsProvider } from '../src/context/AlertsContext';
import { configureNotifications, requestNotificationPermissions } from '../src/service/NotificationService';
import NotificationModalWrapper from '../components/NotificationModalWrapper';
import { StatusBar } from 'expo-status-bar';

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

  // 🚀 CRITICAL FIX: Always return Stack here unconditionally. No wrappers inside this function!
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <UserProvider>
      {/* 🚀 Move the wrappers to the absolute top of the app tree */}
      <AlertsProvider>
        <NotificationModalWrapper>
          <StatusBar style="dark" translucent={false} backgroundColor="#F8FAFF" />
          <RootLayoutNav />
        </NotificationModalWrapper>
      </AlertsProvider>
    </UserProvider>
  );
}