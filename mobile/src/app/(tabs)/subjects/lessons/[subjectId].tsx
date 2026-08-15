import { deleteLesson, getLessonsBySubjectId } from "@/repositories/lesson.repository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FlatList, Pressable, Text, View } from "react-native";
import { LessonItem } from "@/components/lessons/LessonItem";
import { router, useLocalSearchParams } from "expo-router";

export default function LessonScreen() {
  const { subjectId } = useLocalSearchParams<{ subjectId: string }>();
  const queryClient = useQueryClient();

  const { data: lessons = [], isLoading, error } = useQuery({
    queryKey: ["lessons"],
    queryFn: () => getLessonsBySubjectId(subjectId),
    enabled: !!subjectId
  });

  const deleteNoteMutation = useMutation({
    mutationFn: deleteLesson,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["lessons"],
      });
    },

    onError: (error) => {
      console.error(error);
    },
  });

  function handleDelete(id: string) {
    deleteNoteMutation.mutate(id);
  }

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <Text className="text-gray-400 text-sm font-semibold mb-2">
        Lessons
      </Text>
      
      {isLoading ? (
        <Text>Loading...</Text>
        
      ): error ? (
        <Text>Failed to load lesson</Text>

      ): lessons?.length > 0 ? (
        <FlatList
          data={lessons}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-2"
          renderItem={({ item }) => (
            <LessonItem
              id={item.id}
              title={item.title}
              subjectId={subjectId}
              onDelete={handleDelete}
            />
          )}
        />

      ): (<Text>No lesson found.</Text>)}

      <Pressable
        onPress={() => router.push('/subjects/lessons/create')}
        className="absolute bottom-6 right-6 items-center justify-center bg-white rounded-full h-14 w-14"
        style={{
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
        }}
      >
        <Text className="text-3xl text-blue-500">+</Text>
      </Pressable>
    </View>
  )
}