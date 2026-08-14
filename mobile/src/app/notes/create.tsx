import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createNote } from "@/repositories/note.repository";
import { NoteForm } from "@/components/notes/NoteForm";
import { NoteFormData } from "@/schemas/note.schema";
import { View } from "react-native";

import * as Crypto from 'expo-crypto';

export default function CreateNoteScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const createNoteMutation = useMutation({
    mutationFn: createNote,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["notes"]
      });
    },
    onError: (error) => {
      console.error(error);
    }
  })

  const handleNoteSubmit = async (data: NoteFormData) => {
    await createNoteMutation.mutateAsync({
      id: Crypto.randomUUID(),
      title: data.title,
      content: data.content,
    });
  }

  return (
    <View 
        className='flex-1 bg-white p-4 mb-4'
        style={{ paddingBottom: insets.bottom }}
      >
      <NoteForm onSubmit={handleNoteSubmit} />
    </View>
  )
}