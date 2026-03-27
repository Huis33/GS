import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Alert } from 'react-native';
import { UserProvider } from '../src/context/UserContext';
import { useColorScheme } from '../hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* This is your Login Page (no tabs) */}
        <Stack.Screen name="index" />
        <Stack.Screen name="(jurutera)" />
        <Stack.Screen name="jurutera-main" />
      </Stack>
    </UserProvider>
  );
}