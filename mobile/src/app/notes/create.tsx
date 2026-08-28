import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { createNote } from "@/repositories/note.repository";
import { NoteFormData } from "@/schemas/note.schema";
import { View } from "react-native";

import NoteForm from "@/components/notes/NoteForm";

export default function CreateNoteScreen() {
  const { folderId, subfolderId } = useLocalSearchParams<{ 
    folderId: string; 
    subfolderId: string 
  }>();
  console.log(subfolderId)
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const createNoteMutation = useMutation({
    mutationFn: createNote,

    onSuccess: async (noteId) => {
      await queryClient.invalidateQueries({
        queryKey: ["folders"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["notes"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["noteSections", noteId]
      })
      router.back();
    },
    
    onError: (error) => {
      console.error(error);
    }
  })

  const handleNoteSubmit = async (data: NoteFormData) => {
    await createNoteMutation.mutateAsync({
      title: data.title,
      folderId: data.folderId,
      subfolderId: data.subfolderId,
      noteSections: data.noteSections
    });
  }

  return (
    <View 
      className='flex-1 bg-white'
      style={{ 
        paddingBottom: insets.bottom 
      }}
    >
      <NoteForm 
        defaultValues={{ 
          title: "Untitled",
          folderId: folderId,
          subfolderId: subfolderId,
        }} 
        onSubmit={handleNoteSubmit} 
      />
    </View>
  )
}