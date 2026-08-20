import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteNote, getNotes } from '@/repositories/note.repository';
import { FlatList, Pressable, Text, View } from 'react-native';
import { NoteItem } from '@/components/notes/NoteItem';
import { router } from 'expo-router';
import { SearchX } from 'lucide-react-native';

export default function NotesScreen() {
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading, error } = useQuery({
    queryKey: ["notes"],
    queryFn: getNotes
  });

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

  const handleDelete = async (id: string) => {
    await deleteNoteMutation.mutateAsync(id);
  }

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <Text className="text-gray-400 text-sm font-semibold mb-2">
        All Notes
      </Text>

      {isLoading ? (
        <Text>Loading...</Text>

      ): error ? (
        <Text>Failed to load notes.</Text>

      ): notes?.length > 0 ? (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-2"
          renderItem={({ item }) => (
            <NoteItem
              id={item.id}
              title={item.title}
              createdAt={item.createdAt}
              onDelete={handleDelete}
            />
          )}
        />
        
      ): (
        <View className='flex-1 justify-center items-center'>
          <SearchX size={64} color="#9ca3af" />
          <Text className='text-gray-400'>No notes found.</Text>
        </View>
      )}

      <Pressable
        onPress={() => router.push('/notes/create')}
        className="absolute bottom-6 right-6 items-center justify-center bg-white rounded-full h-14 w-14"
        style={{
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
        }}
      >
        <Text className="text-3xl text-gray-600">+</Text>
      </Pressable>
    </View>
  );
}
