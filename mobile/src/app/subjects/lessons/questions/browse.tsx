import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { getQuestionsByLessonId } from "@/repositories/question.repository";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, SearchX } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";

import QuestionItem from "@/components/questions/QuestionItem";
import Header from "@/components/shared/Header";

export default function BrowseQuestionScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  
  const insets = useSafeAreaInsets();

  const { data: questions = [], isLoading, error } = useQuery({
    queryKey: ["questions", lessonId],
    queryFn: () => getQuestionsByLessonId(lessonId),
    enabled: !!lessonId,
  });

  const handleQuestionLongPress = (id: string) => {};

  return (
    <View
      className="flex-1 bg-white"
      style={{
        paddingBottom: insets.bottom,
      }}
    >
      <Header 
        title="Questions"
        back={
          <Pressable onPress={() => router.back()}>
            <ArrowLeft />
          </Pressable>
        }
       />

      <View className="flex-1 px-6 py-4">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="small" color="#4b5563" />
          </View>

        ): error ? (
          <View className="flex-1 justify-center items-center">
            <Text>Failed to load questions</Text>
          </View>

        ): questions.length > 0 ? (
          <FlatList
            data={questions}
            keyExtractor={(item) => item.id}
            contentContainerClassName="gap-2"
            renderItem={({ item }) => (
              <QuestionItem
                key={item.id}
                id={item.id}
                question={item.question}
                onLongPress={handleQuestionLongPress}
              />
            )}
          />

        ): (
          <View className='flex-1 justify-center items-center'>
            <SearchX size={64} color="#9ca3af" />
            <Text className='text-gray-400 font-semibold'>No questions found</Text>
          </View>
        )}
      </View>
    </View>
  )
}