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

  const {
    data: note,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["note", id],
    queryFn: () => getNoteById(id),
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

      router.back();
    },

    onError: (error) => {
      console.error(error);
    },
  });

  const handleSubmit = async (data: NoteFormData) => {
    await updateNoteMutation.mutateAsync(data);
  };

  if (isLoading) {
    return <Text>Loading note...</Text>;
  }

  if (error) {
    return <Text>Failed to load note.</Text>;
  }

  if (!note) {
    return <Text>Note not found.</Text>;
  }

  return (
      <View 
        className='flex-1 bg-white p-4 mb-4'
        style={{ paddingBottom: insets.bottom }}
      >
        <Text className='text-gray-400 text-xs'>
          {note.createdAt.toLocaleString()}
        </Text>

        <NoteForm
          defaultValues={{
            title: note.title,
            content: note.content
          }}
          onSubmit={handleSubmit}
        />
    </View>
  );
}