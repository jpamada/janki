import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { openDatabaseAsync } from 'expo-sqlite';

export default function TestSQLite() {
  useEffect(() => {
    async function test() {
      try {
        console.log('Opening database...');

        const db = await openDatabaseAsync('test.db');

        console.log('Database opened.');

        await db.execAsync('PRAGMA foreign_keys = ON;');

        console.log('PRAGMA executed.');

        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS test (
            id INTEGER PRIMARY KEY NOT NULL,
            name TEXT
          );
        `);

        console.log('Table created.');
      } catch (error) {
        console.error('SQLite test failed:', error);
      }
    }

    test();
  }, []);

  return (
    <View>
      <Text>SQLite test</Text>
    </View>
  );
}