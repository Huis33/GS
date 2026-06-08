import { Href, Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { UserProvider, useUser } from '../src/context/UserContext';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { userData, isLoading } = useUser();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  // Request notifications permission once
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notifications permission not granted');
      }
    };
    requestPermissions();
  }, []);

  // Redirection Logic
  useEffect(() => {
    if (!navigationState?.key || isLoading) return;

    const rootSegment = segments[0] ? String(segments[0]) : '';
    const isGuestArea = rootSegment === '' || rootSegment === 'index' || rootSegment === 'forgot-password';

    // SCENARIO A: NOT LOGGED IN
    if (!userData) {
      if (!isGuestArea) router.replace('/');
      return;
    }

    // SCENARIO B: LOGGED IN - Role Detection
    const role = (userData?.role || '').trim().toLowerCase();

    const isJurutera = role === 'engineer' || role === 'jurutera';
    const isPengurus = role === 'operationmanager' || role === 'pengurus';
    const isPenyelaras = role === 'servicecoordinator' || role === 'penyelaras';

    // REDIRECTION LOGIC
    if (isGuestArea) {
      if (isJurutera) {
        router.replace('/(jurutera)' as Href);
      } else if (isPengurus) {
        router.replace('/(pengurus)' as Href);
      } else if (isPenyelaras) {
        router.replace('/(penyelaras)' as Href);
      }
    }
  }, [userData, isLoading, segments, navigationState?.key]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <UserProvider>
      <StatusBar style="auto" />
      <RootLayoutNav />
    </UserProvider>
  );
}