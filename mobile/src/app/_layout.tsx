import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/providers/query-provider';
import { Stack } from 'expo-router';
import { db } from '@/db/client';

import migrations from '../../drizzle/migrations';
import '../../global.css';

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    console.error(error.message);
  }

  if (!success) {
    return null;
  }

  return (
    <SafeAreaProvider> 
      <KeyboardProvider>
        <GestureHandlerRootView
          style={{ flex: 1 }}>
            <QueryClientProvider 
              client={queryClient}>
              <Stack>
                <Stack.Screen
                  name="(tabs)"
                  options={{
                    headerShown: false
                  }}
                />
                <Stack.Screen
                  name="notes"
                  options={{ 
                    headerShown: false 
                  }}
                />
                <Stack.Screen
                  name="subjects"
                  options={{ 
                    headerShown: false 
                  }}
                />
                <Stack.Screen
                  name="categories"
                  options={{ 
                    headerShown: false 
                  }}
                />
              </Stack>
          </QueryClientProvider>
        </GestureHandlerRootView>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
