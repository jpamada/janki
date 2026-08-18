import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
    console.error(error.cause);
    return error;
  }

  if (!success) return null;

  return (
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>
        <Stack>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
