import { Href, Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { UserProvider, useUser } from '../src/context/UserContext';
import { configureNotifications, requestNotificationPermissions } from '../src/service/NotificationService';

function RootLayoutNav() {
  const { userData, isLoading } = useUser();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  const rootSegment = segments[0] ? String(segments[0]) : '';

  // 1. Request notifications permission once on mount
  useEffect(() => {
    const setupNotifications = async () => {
      await configureNotifications();
      const granted = await requestNotificationPermissions();
      if (!granted) {
        console.log('Notifications permission not granted');
      }
    };
    setupNotifications();
  }, []);

  // 2. Redirection logic
  useEffect(() => {
    if (!navigationState?.key || isLoading) {
      console.log('Layout waiting: Navigation ready:', !!navigationState?.key, 'Auth Loading:', isLoading);
      return;
    }

    const isGuestArea = rootSegment === '' || rootSegment === 'index' || rootSegment === 'forgot-password';

    // SCENARIO A: NOT LOGGED IN
    if (!userData) {
      console.log('No user data found. Guest Area:', isGuestArea);
      if (!isGuestArea) router.replace('/');
      return;
    }

    // SCENARIO B: LOGGED IN - Role Detection
    const rawRole = userData?.role || '';
    const role = rawRole.trim().toLowerCase();
    console.log('Logged in user role detected:', role);

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
      console.log('User is in guest area, redirecting to dashboard...');
      if (isJurutera) {
        router.replace('/(jurutera)' as Href);
      } else if (isPengurus) {
        router.replace('/(pengurus)' as Href);
      } else if (isPenyelaras) {
        router.replace('/(penyelaras)' as Href);
      }
    } else {
      console.log('User is already in their respective dashboard area.');
    }
  }, [userData, isLoading, rootSegment, navigationState?.key]);

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
