import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { getContentsByNote } from '@/repositories/content.repository';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { updateNote } from '@/repositories/note.repository';
import { type NoteFormData } from '@/schemas/note.schema';
import { FlatList } from 'react-native-gesture-handler';
import { Plus, SearchX } from 'lucide-react-native';

import ContentItem from '@/components/contents/ContentItem';
import Header from '@/components/shared/Header';

export default function NoteScreen() {
  const { id, title } = useLocalSearchParams<{ 
    id: string, 
    title: string 
  }>();

  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: contents = [], isLoading: isLoading, error } = useQuery({
    queryKey: ["contents", id],
    queryFn: () => getContentsByNote(id),
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
      router.back();
    },

    onError: (error) => {
      console.error(error.message);
    },
  });

  const handleNoteSubmit = async (data: NoteFormData) => {
    await updateNoteMutation.mutateAsync(data);
  };

  const handleContentPress = (contentId: string) => {
    router.push({
      pathname: `/notes/contents/edit`,
      params: {
        contentId: contentId,
        noteId: id
      },
    });
  };

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingBottom: insets.bottom }}
    >
      <Header title={title} back={true} />

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="small" color="#4b5563" />
        </View>

      ) : error ? (
        <Text>Failed to load notes</Text>

      ) : contents.length > 0 ? (
        <FlatList
          renderItem={({ item }) => (
            <ContentItem
              id={item.id}
              todo={item.todo}
              title={item.title}
              content={item.content}
              remarks={item.remarks}
              onPress={handleContentPress}
            />
          )}
          data={contents}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="gap-3 p-4"
        />

      ) : (
        <View className='flex-1 justify-center items-center'>
          <SearchX size={64} color="#9ca3af" />
          <Text className='text-gray-400 font-semibold'>
            No contents found
          </Text>
        </View>
      )}
      
      <Pressable
        onPress={() => router.push({
          pathname: `/notes/contents/create`,
          params: { noteId: id, title: title }
        })}
        className="absolute bottom-6 right-6 items-center justify-center bg-white rounded-full h-16 w-16 active:bg-gray-50"
        style={{
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
          bottom: insets.bottom + 24 
        }}
      >
        <Plus size={24} color="#4b5563" strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}
