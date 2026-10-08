import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useInitializeSettings } from '@/hooks/useInitializeSettings';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { SnackbarProvider } from '@/contexts/SnackbarContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/providers/query-provider';
import { SfxProvider } from '@/contexts/SfxContext';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { db } from '@/db/client';

import AppLoadingScreen from '@/components/shared/screens/AppLoadingScreen';
import AppErrorScreen from '@/components/shared/screens/AppErrorScreen';
import migrations from '@/db/migrations/migrations';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';

import '@/providers/registerCodeLanguages';
import 'react-native-code-highlighter';
import 'react-syntax-highlighter';
import '../../global.css';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { success, error: databaseError } = useMigrations(db, migrations);
  const { settings, error: settingsError } = useInitializeSettings();
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(
      colorScheme === 'light' ? '#ffffff' : '#171717',
    );
  }, [colorScheme]);

  useEffect(() => {
    if (success && settings) {
      SplashScreen.hide();
    }
  }, [success, settings]);

  if (databaseError) {
    return <AppErrorScreen errorMessage={databaseError.message} />;
  }

  if (settingsError) {
    return <AppErrorScreen errorMessage={settingsError.message} />;
  }

  if (!success || !settings) {
    return <AppLoadingScreen />;
  }

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'}/>

      <SafeAreaProvider>
        <KeyboardProvider>
          <GestureHandlerRootView 
            style={{ flex: 1 }}>
            <SnackbarProvider>
              <QueryClientProvider 
                client={queryClient}>
                <SettingsProvider 
                  initialSettings={settings}>
                  <SfxProvider>
                    <ThemeProvider
                      value={colorScheme === "dark" 
                      ? DarkTheme
                      : DefaultTheme
                    }>
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
                    </ThemeProvider>
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