import { getNoteSectionsByNoteId } from '@/repositories/note-section.repository';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getNoteById, updateNote } from '@/repositories/note.repository';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { type NoteFormData } from '@/schemas/note.schema';
import { SearchX } from 'lucide-react-native';

import NoteForm from '@/components/notes/NoteForm';

export default function NoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    data: note,
    isLoading: notesIsLoading,
    error,
  } = useQuery({
    queryKey: ['note', id],
    queryFn: () => getNoteById(id),
    enabled: !!id,
  });

  const { data: noteSections, isLoading: noteSectionsIsLoading } = useQuery({
    queryKey: ['noteSections', id],
    queryFn: () => getNoteSectionsByNoteId(id),
    enabled: !!id,
  });

  const updateNoteMutation = useMutation({
    mutationFn: (data: NoteFormData) => updateNote(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['folders'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['notes'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['note', id],
      });
      await queryClient.invalidateQueries({
        queryKey: ['noteSections', id],
      });
      router.back();
    },

    onError: (error) => {
      console.error(error.message);
    },
  });

  const handleSubmit = async (data: NoteFormData) => {
    await updateNoteMutation.mutateAsync(data);
  };

  return (
    <View
      className="flex-1 bg-white"
      style={{
        paddingBottom: insets.bottom,
      }}
    >
      {notesIsLoading || noteSectionsIsLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="small" color="#4b5563" />
        </View>

      ) : error ? (
        <View className="flex-1 items-center justify-center">
          <Text>Failed to load note.</Text>
        </View>

      ) : !note ? (
        <View className="flex-1 items-center justify-center">
          <SearchX size={64} color="#9ca3af" />
          <Text className="text-gray-400 font-semibold">Note not found</Text>
        </View>
        
      ) : (
        <View className="flex-1">
          <NoteForm
            defaultValues={{
              title: note.title,
              folderId: note.folderId ?? undefined,

              noteSections: (noteSections ?? []).map((section) => ({
                id: section.id,
                title: section.title,
                position: section.position ?? undefined,

                noteContents: section.noteContents.map((content) => ({
                  id: content.id,
                  title: content.title ?? undefined,
                  content: content.content,
                  type: content.type as 'text' | 'code',
                  url: content.url ?? undefined,
                  remarks: content.remarks ?? undefined,
                  position: content.position ?? undefined,
                })),
              })),
            }}
            onSubmit={handleSubmit}
          />
        </View>
      )}
    </View>
  );
}
