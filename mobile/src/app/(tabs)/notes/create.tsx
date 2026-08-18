import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createNote } from "@/repositories/note.repository";
import { NoteForm } from "@/components/notes/NoteForm";
import { NoteFormData } from "@/schemas/note.schema";
import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";

export default function CreateNoteScreen() {
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const createNoteMutation = useMutation({
    mutationFn: createNote,

    onSuccess: async (noteId) => {
      await queryClient.invalidateQueries({
        queryKey: ["notes"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["noteSections", noteId]
      })
      router.replace(`/notes/${noteId}`)
    },

    onError: (error) => {
      console.error(error);
    }
  })

  const handleNoteSubmit = async (data: NoteFormData) => {
    await createNoteMutation.mutateAsync({
      title: data.title,
      folderId: data.folderId,
      noteSections: data.noteSections
    });
  }

  return (
    <View 
        className='flex-1 bg-white p-4'
        style={{ paddingBottom: insets.bottom }}
      >
        <NoteForm onSubmit={handleNoteSubmit} />
    </View>
  )
}