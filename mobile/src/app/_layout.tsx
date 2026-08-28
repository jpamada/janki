import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/providers/query-provider';
import { Stack } from 'expo-router';
import { db } from '@/db/client';

import migrations from '../../drizzle/migrations';
import '../../global.css';
import { useEffect } from 'react';
import { getNotes } from '@/repositories/note.repository';
import { getFolders } from '@/repositories/folder.repository';
import { getCategories } from '@/repositories/category.repository';

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);

  if (error) return error;
  if (!success) return null;

  return (
      <KeyboardProvider>
        <GestureHandlerRootView>
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
  );
}
