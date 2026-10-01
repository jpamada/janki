import { initializeSettings } from '@/repositories/settings.repository';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { SnackbarProvider } from '@/contexts/SnackbarContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/providers/query-provider';
import { SfxProvider } from '@/contexts/SfxContext';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { db } from '@/db/client';

import AppLoadingScreen from '@/components/shared/AppLoadingScreen';
import AppErrorScreen from '@/components/shared/AppErrorScreen';
import migrations from '@/db/migrations/migrations';

import "@/providers/registerCodeLanguages";
import "react-native-code-highlighter";
import "react-syntax-highlighter";
import '../../global.css';

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    if (!success) return;
    initializeSettings();
  }, [success])

  if (error) {
    return <AppErrorScreen errorMessage={error.message} />
  }

  if (!success) {
    return <AppLoadingScreen />;
  }

  return (
    <SafeAreaProvider> 
      <KeyboardProvider>
        <GestureHandlerRootView
          style={{ flex: 1 }}>
          <SnackbarProvider>
            <QueryClientProvider 
              client={queryClient}>
              <SettingsProvider>
                <SfxProvider>
                  <Stack>
                    <Stack.Screen
                      name="(tabs)"
                      options={{
                        headerShown: false,
                        animation: "slide_from_right",
                      }}
                    />
                    <Stack.Screen
                      name="questions"
                      options={{ 
                        headerShown: false,
                        animation: "slide_from_right",
                      }}
                    />
                    <Stack.Screen
                      name="quiz"
                      options={{ 
                        headerShown: false,
                        animation: "slide_from_right",
                      }}
                    />
                    <Stack.Screen
                      name="history"
                      options={{ 
                        headerShown: false,
                        animation: "slide_from_right",
                      }}
                    />
                    <Stack.Screen
                      name="statistics"
                      options={{ 
                        headerShown: false,
                        animation: "slide_from_right",
                      }}
                    />
                    <Stack.Screen
                      name="settings"
                      options={{ 
                        headerShown: false,
                        animation: "slide_from_right",
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
  );
}
