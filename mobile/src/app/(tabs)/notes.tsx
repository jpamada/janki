import { FlatList, Pressable, Text, View } from 'react-native';
import { getNotes } from '@/repositories/note.repository';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';

export default function NotesScreen() {
  const {
    data: notes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['notes'],
    queryFn: getNotes,
  });

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
          <Pressable
            onPress={() => router.push(`/notes/${item.id}`)}
            className="bg-white rounded-lg p-4"
          >
            <Text className="text-gray-400 text-xs mb-2">
              {item.createdAt.toLocaleString()}
            </Text>

            <Text className="font-semibold">
              {item.title}
            </Text>

            <Text>
              {item.content}
            </Text>
          </Pressable>
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
