import { useInitializeSettings } from '@/providers/useInitializeSettings';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { SnackbarProvider } from '@/contexts/SnackbarContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/providers/query-provider';
import { SfxProvider } from '@/contexts/SfxContext';
import { Stack } from 'expo-router';
import { db } from '@/db/client';

import AppLoadingScreen from '@/components/shared/screens/AppLoadingScreen';
import AppErrorScreen from '@/components/shared/screens/AppErrorScreen';
import migrations from '@/db/migrations/migrations';
import * as SplashScreen from 'expo-splash-screen';

import '@/providers/registerCodeLanguages';
import 'react-native-code-highlighter';
import 'react-syntax-highlighter';
import '../../global.css';

import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);
  const { settingsReady, initError } = useInitializeSettings(success);
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(
      colorScheme === 'dark' ? '#111827' : '#ffffff',
    );
  }, [colorScheme]);

  useEffect(() => {
    if (success && settingsReady) {
      SplashScreen.hide();
    }
  }, [success, settingsReady]);

  if (error) {
    return <AppErrorScreen errorMessage={error.message} />;
  }

  if (initError) {
    return <AppErrorScreen errorMessage={initError.message} />;
  }

  if (!success || !settingsReady) {
    return <AppLoadingScreen />;
  }

  return (
    <>
      <StatusBar
        style={colorScheme === 'dark' ? 'light' : 'dark'}
      />

      <SafeAreaProvider>
        <KeyboardProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SnackbarProvider>
              <QueryClientProvider client={queryClient}>
                <SettingsProvider>
                  <SfxProvider>
                    <Stack>
                      <Stack.Screen
                        name="(tabs)"
                        options={{
                          headerShown: false,
                          animation: 'slide_from_right',
                        }}
                      />

                      <Stack.Screen
                        name="questions"
                        options={{
                          headerShown: false,
                          animation: 'slide_from_right',
                        }}
                      />

                      <Stack.Screen
                        name="quiz"
                        options={{
                          headerShown: false,
                          animation: 'slide_from_right',
                        }}
                      />

                      <Stack.Screen
                        name="history"
                        options={{
                          headerShown: false,
                          animation: 'slide_from_right',
                        }}
                      />

                      <Stack.Screen
                        name="statistics"
                        options={{
                          headerShown: false,
                          animation: 'slide_from_right',
                        }}
                      />

                      <Stack.Screen
                        name="settings"
                        options={{
                          headerShown: false,
                          animation: 'slide_from_right',
                        }}
                      />
                    </Stack>
                  </SfxProvider>
                </SettingsProvider>
              </QueryClientProvider>
            </SnackbarProvider>
          </GestureHandlerRootView>
        </KeyboardProvider>
      </SafeAreaProvider>
    </>
  );
}