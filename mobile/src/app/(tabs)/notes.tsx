import { FlatList, Pressable, Text, View } from 'react-native';
import { deleteNote, getNotes } from '@/repositories/note.repository';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { NoteItem } from '@/components/notes/NoteItem';

export default function NotesScreen() {
  const {
    data: notes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['notes'],
    queryFn: getNotes,
  });

  const queryClient = useQueryClient();
  const deleteNoteMutation = useMutation({
    mutationFn: deleteNote,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["notes"],
      });
    },

    onError: (error) => {
      console.error(error);
    },
  });

  function handleDelete(id: string) {
    deleteNoteMutation.mutate(id);
  }

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Failed to load notes.</Text>;
  }

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <Text className="text-gray-400 text-sm font-semibold mb-2">
        All Notes
      </Text>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-2"
        renderItem={({ item }) => (
          <NoteItem
            id={item.id}
            title={item.title}
            content={item.content}
            createdAt={item.createdAt}
            onDelete={handleDelete}
          />
        )}
      />

      <Pressable
        onPress={() => router.push('/notes/create')}
        className="absolute bottom-6 right-6 items-center justify-center bg-white rounded-full h-14 w-14"
        style={{
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
        }}
      >
        <Text className="text-3xl text-blue-500">+</Text>
      </Pressable>
    </View>
  );
}
