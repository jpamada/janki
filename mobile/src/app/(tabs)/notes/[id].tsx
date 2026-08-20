import { getNoteSectionsByNoteId } from "@/repositories/note-section.repository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getNoteById, updateNote } from "@/repositories/note.repository";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { NoteFormData } from "@/schemas/note.schema";
import { NoteForm } from "@/components/notes/NoteForm";
import { Text, View } from "react-native";

export default function NoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: note, isLoading: notesIsLoading, error } = useQuery({
    queryKey: ["note", id],
    queryFn: () => getNoteById(id),
    enabled: !!id
  });

  const { data: noteSections, isLoading: noteSectionsIsLoading } = useQuery({
    queryKey: ["noteSections", id],
    queryFn: () => getNoteSectionsByNoteId(id),
    enabled: !!id
  });

  const updateNoteMutation = useMutation({
    mutationFn: (data: NoteFormData) => 
      updateNote(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["notes"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["note", id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["noteSections", id]
      })
      router.back();
    },

    onError: (error) => {
      console.error(error);
    },
  });

  const handleSubmit = async (data: NoteFormData) => {
     await updateNoteMutation.mutateAsync(data);
  };

  return (
    <View 
      className='flex-1 bg-white p-4'
      style={{ paddingBottom: insets.bottom }}
    >
        {notesIsLoading || noteSectionsIsLoading ? (
          <Text>Loading note...</Text>

        ): error ? (
          <Text>Failed to load note.</Text>

        ): !note ? (
          <Text>Note not found.</Text>

        ): (
          <View>
            <Text className='text-gray-400 text-xs'>
              {note.createdAt.toLocaleString()}
            </Text>

            <NoteForm
              defaultValues={{
                title: note.title,
                
                noteSections: (noteSections ?? []).map((section) => ({
                  id: section.id,
                  title: section.title,
                  position: section.position ?? undefined,

                  noteContents: section.noteContents.map((content) => ({
                    id: content.id,
                    title: content.title,
                    content: content.content,
                    type: content.type as "text" | "code",
                    url: content.url ?? undefined,
                    remarks: content.remarks ?? undefined,
                    position: content.position ?? undefined,
                  })),
                }))
              }}
              onSubmit={handleSubmit}
            />
          </View>
        )}
    </View>
  );
}