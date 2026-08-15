import { createQuestionWithAnswers } from "@/repositories/question.repository";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QuestionForm } from "@/components/questions/QuestionForm";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { QuestionFormData } from "@/schemas/question.schema";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function CreateQuestionScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const createQuestionMutation = useMutation({
  mutationFn: createQuestionWithAnswers,

  onSuccess: async () => {
    await queryClient.invalidateQueries({
      queryKey: ['questions'],
    });
  },

  onError: (error) => {
    console.error(error);
  },
});

  const handleQuestionSubmit = async (data: QuestionFormData) => {
    await createQuestionMutation.mutateAsync({
      question: data.question,
      lessonId: data.lessonId,
      answers: data.answers,
    });
  };

  return (
    <View
      className="mb-4 flex-1 bg-white p-4"
      style={{ paddingBottom: insets.bottom }}
    >
      <QuestionForm 
        onSubmit={handleQuestionSubmit} 
        defaultValues={{
          question: "",
          lessonId,
         answers: [
            { answer: '', isCorrect: false },
            { answer: '', isCorrect: false },
          ],
        }}
      />
    </View>
  )
}