import { deleteQuestion, getQuestionById } from "@/repositories/question.repository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateQuizData } from "@/repositories/quiz.repository";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import { QuestionFormData } from "@/schemas/question.schema";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { Trash2 } from "lucide-react-native";
import { useState } from "react";

import DeleteModal from "@/components/shared/modals/DeleteModal";
import QuestionForm from "@/components/questions/QuestionForm";
import EmptyList from "@/components/shared/EmptyList";

export default function QuestionsScreen() {
  const { id, lessonId } = useLocalSearchParams<{ 
    id: string;
    lessonId: string;
  }>();

  const { showSnackbar } = useSnackbar();

  const queryClient = useQueryClient();
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);

  const { data: question, isLoading, error } = useQuery({
    queryKey: ["question", id],
    queryFn: () => getQuestionById(id),
    enabled: !!id,
  });

  const updateQuestionMutation = useMutation({
    mutationFn: (data: QuestionFormData) =>
      updateQuizData(id, data),

      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ["question", id],
        });
        await queryClient.invalidateQueries({
          queryKey: ["questions", lessonId]
        });
        await queryClient.invalidateQueries({
          queryKey: ["quizData", lessonId],
        });
        showSnackbar({ 
          message: "Question updated successfully" 
        })
        router.back();
      },

    onError: (error) => {
      showSnackbar({ 
        message: "Something went wrong. Please try again." 
      });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: deleteQuestion,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["question"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["questions", lessonId]
      });
      await queryClient.invalidateQueries({
        queryKey: ["quizData", lessonId],
      });
      showSnackbar({ 
        message: "Question successfully deleted" 
      })
      router.back();
    },

    onError: (error) => {
      showSnackbar({ 
        message: "Something went wrong. Please try again." 
      });
    },
  })

  const handleSubmit = async (data: QuestionFormData) => {
    await updateQuestionMutation.mutateAsync(data);
  };

  const handleDelete = () => {
    setModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    deleteQuestionMutation.mutateAsync(id)
  };

  const resetState = () => {
    setModalVisible(false);
  }

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900">
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="small" color="#4b5563" />
        </View>

      ): error ? (
        <View className="flex-1 justify-center items-center">
          <Text>Failed to load question</Text>
        </View>

      ): question ? (
        <>
          <QuestionForm
            onSubmit={handleSubmit}
            onDelete={handleDelete}
            defaultValues={{
              code: question?.code ?? "",
              image: question?.image ?? null,
              question: question?.question ?? "",
              lessonId: question?.lessonId ?? "",
              language: question?.language ?? null,
              explanation: question?.explanation ?? null,
              type: question?.type ?? "multiple_choice",

              answers:
                question?.questionAnswers.map((item) => ({
                  answer: item.answer.answer,
                  isCorrect: item.isCorrect,
                })) ?? [],
            }}
          />

          <DeleteModal
            icon={Trash2}
            onClose={resetState}
            header="Delete Subject"
            isVisible={modalVisible}
            onConfirm={handleConfirmDelete}
            description={`Are you sure you want to delete this question?`}
            onConfirmLabel={deleteQuestionMutation.isPending ? 'Deleting...' : 'Delete'}
          />
        </>

      ) : (<EmptyList message="No question yet" />)}
    </View>
  )
}