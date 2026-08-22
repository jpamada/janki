import { deleteSubject, getSubjects } from "@/repositories/subject.repository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SubjectItem } from "@/components/subjects/SubjectItem";
import { FlatList, Pressable, Text, View } from "react-native";
import Header from "@/components/shared/Header";
import { SearchX } from "lucide-react-native";
import { router } from "expo-router";

export default function SubjectsScreen() {
  const queryClient = useQueryClient();
  
  const { data: subjects = [], isLoading, error } = useQuery({
    queryKey: ["subjects"],
    queryFn: getSubjects
  });

  const deleteNoteMutation = useMutation({
    mutationFn: deleteSubject,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["subjects"],
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
    <View className="flex-1 bg-white">
      <Header title="Subjects" />

      <View className="flex-1 px-6 py-4">
        <Text className="text-gray-400 text-sm font-semibold mb-2">
          All Subjects
        </Text>
        
        {isLoading ? (
          <Text>Loading...</Text>
          
        ): error ? (
          <Text>Failed to load subjects</Text>

        ): subjects?.length > 0 ? (
          <FlatList
            data={subjects}
            keyExtractor={(item) => item.id}
            contentContainerClassName="gap-2"
            renderItem={({ item }) => (
              <SubjectItem
                id={item.id}
                title={item.title}
                onDelete={handleDelete}
              />
            )}
          />

        ): (
          <View className='flex-1 justify-center items-center'>
            <SearchX size={64} color="#9ca3af" />
            <Text className='text-gray-400'>No subjects found.</Text>
          </View>
        )}

        <Pressable
          onPress={() => router.push('/subjects/create')}
          className="absolute bottom-6 right-6 items-center justify-center bg-white rounded-full h-14 w-14"
          style={{
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
          }}
        >
          <Text className="text-3xl text-gray-600">+</Text>
        </Pressable>
      </View>
    </View>
  )
}