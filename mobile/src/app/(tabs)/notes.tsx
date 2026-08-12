import { createNote, getNotes } from '@/repositories/note.repository';
import type { NoteFormData } from '@/schemas/note.schema';
import { NoteForm } from '@/components/notes/NoteForm';
import { FlatList, Text, View } from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import * as Crypto from 'expo-crypto';

export default function NotesScreen() {
  const [notes, setNotes] = useState<Awaited<ReturnType<typeof getNotes>>>([]);

  const loadNotes = useCallback(async () => {
    const result = await getNotes();
    setNotes(result);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [loadNotes]),
  );

  async function handleCreateNote(data: NoteFormData) {
    await createNote({
      id: Crypto.randomUUID(),
      title: data.title,
      content: data.content,
    });

    await loadNotes();
  }

  return (
    <View>
      <Text>Notes</Text>

      <NoteForm onSubmit={handleCreateNote} />

      <Text>Saved Notes</Text>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <Text>{item.title}</Text>
            <Text>{item.content}</Text>
          </View>
        )}
      />
    </View>
  );
}
