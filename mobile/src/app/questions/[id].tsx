import { deleteQuestion, getQuestionById } from "@/repositories/question.repository";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateQuizData } from "@/repositories/quiz.repository";
import { useLocalSearchParams, useRouter } from "expo-router";
import { QuestionFormData } from "@/schemas/question.schema";
import { useSnackbar } from "@/providers/SnackbarContext";
import { SearchX, Trash2 } from "lucide-react-native";
import { useState } from "react";

import QuestionForm from "@/components/questions/QuestionForm";

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
        showSnackbar({ message: "Question updated successfully" })
        router.back();
      },

    onError: (error) => {
      console.error(error.message);
      showSnackbar({ message: "Something went wrong. Please try again." });
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
      showSnackbar({ message: "Question successfully deleted" })
      router.back();
    },

    onError: (error) => {
      console.error(error.message);
      showSnackbar({ message: "Something went wrong. Please try again." });
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

  return (
    <View className="flex-1 bg-white">
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

          <Modal
            transparent
            animationType="fade"
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <Pressable
              className="flex-1 items-center justify-center bg-black/40"
              onPress={() => {
                setModalVisible(false);
              }}
            >
              <Pressable
                className="w-[90%] rounded-2xl bg-white p-6"
                onPress={(event) => event.stopPropagation()}
              >
                <View className="self-center w-32 h-32 items-center justify-center rounded-full bg-gray-100 mb-4">
                  <Trash2 size={72} color="#ef4444" />
                </View>

                <Text className="text-center text-xl font-bold">
                  Delete Question
                </Text>

                <Text className="text-center text-gray-500">
                  Are you sure you want to delete this this question?
                </Text>

                <View className="mt-6 flex-col justify-end gap-2">
                  <Pressable
                    onPress={handleConfirmDelete}
                    disabled={deleteQuestionMutation.isPending}
                    className="rounded-full bg-red-500 px-6 py-4 active:bg-red-400"
                  >
                    <Text className="font-semibold text-center text-white">
                      {deleteQuestionMutation.isPending
                        ? "Deleting..."
                        : "Delete"}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setModalVisible(false);
                    }}
                    className="rounded-full px-6 py-4 active:bg-gray-100"
                  >
                    <Text className="font-semibold text-center text-gray-600">
                      Cancel
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            </Pressable>
          </Modal>
        </>

      ) : (
        <View className='flex-1 justify-center items-center'>
          <SearchX size={64} color="#9ca3af" />
          <Text className='text-gray-400 font-semibold'>No question found</Text>
        </View>
      )}
    </View>
  )
}