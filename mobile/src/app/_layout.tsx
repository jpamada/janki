import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { SnackbarProvider } from '@/providers/SnackbarContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/providers/query-provider';
import { Stack } from 'expo-router';
import { db } from '@/db/client';

import AppLoadingScreen from '@/components/shared/AppLoadingScreen';
import AppErrorScreen from '@/components/shared/AppErrorScreen';
import migrations from '@/db/migrations/migrations';

import "@/providers/registerCodeLanguages";
import '../../global.css';

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);

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
                <Stack>
                  <Stack.Screen
                    name="(tabs)"
                    options={{
                      headerShown: false,
                      animation: "slide_from_right",
                    }}
                  />
                  <Stack.Screen
                    name="categories"
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
                </Stack>
            </QueryClientProvider>
          </SnackbarProvider>
        </GestureHandlerRootView>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
