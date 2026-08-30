import { getQuestionById, updateQuestionWithAnswers } from "@/repositories/question.repository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { QuestionFormData } from "@/schemas/question.schema";
import { ActivityIndicator, Text, View } from "react-native";
import { SearchX } from "lucide-react-native";

import QuestionForm from "@/components/questions/QuestionForm";

export default function QuestionsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: question, isLoading, error } = useQuery({
    queryKey: ['question', id],
    queryFn: () => getQuestionById(id),
    enabled: !!id,
  });

  const updateQuestionMutation = useMutation({
    mutationFn: (data: QuestionFormData) =>
      updateQuestionWithAnswers(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['questions'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['question', id],
      });

      await queryClient.invalidateQueries({
        queryKey: ['questions', question?.lessonId],
      });

      router.back();
    },

    onError: (error) => {
      console.error(error.message);
    },
  });

  const handleSubmit = async (data: QuestionFormData) => {
    await updateQuestionMutation.mutateAsync(data);
  };

  return (
    <View
      className="flex-1 bg-white"
      style={{
        paddingBottom: insets.bottom,
      }}
    >
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="small" color="#4b5563" />
        </View>

      ): error ? (
        <View className="flex-1 justify-center items-center">
          <Text>Failed to load question</Text>
        </View>

      ): question ? (
        <QuestionForm
          onSubmit={handleSubmit}
          defaultValues={{
            question: question?.question ?? "",
            lessonId: question?.lessonId ?? "",
            answers: question?.questionAnswers.map((item) => ({
              answer: item.answer.answer,
              isCorrect: item.isCorrect,
            })) ?? []
          }}
        />

      ) : (
        <View className='flex-1 justify-center items-center'>
          <SearchX size={64} color="#9ca3af" />
          <Text className='text-gray-400 font-semibold'>No question found</Text>
        </View>
      )}
    </View>
  )
}