import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '../hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* This is your Login Page (no tabs) */}
      <Stack.Screen name="index" />

      {/* This is your Dashboard Group (with tabs) */}
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
