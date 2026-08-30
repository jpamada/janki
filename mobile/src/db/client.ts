import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';
import * as relations from './relations';

const expoDb = openDatabaseSync('janki.db');
expoDb.execSync('PRAGMA foreign_keys = ON;');

export const db = drizzle(expoDb, {
  schema: {
    ...schema,
    ...relations,
  },
});