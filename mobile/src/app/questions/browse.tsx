import { ActivityIndicator, Animated, FlatList, Modal, Pressable, Text, View } from "react-native";
import { deleteQuestion, getQuestionsByLessonId } from "@/repositories/question.repository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PenLine, Plus, SearchX, Trash2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useBottomSheet } from "@/hooks/UseBottomSheet";
import { useMemo, useState } from "react";

import QuestionItem from "@/components/questions/QuestionItem";
import Header from "@/components/shared/Header";
import BottomSheet from "@/components/shared/BottomSheet";
import DeleteModal from "@/components/shared/modals/DeleteModal";
import EmptyList from "@/components/EmptyList";
import Fab from "@/components/shared/fabs/Fab";
import { useColorScheme } from "nativewind";

export default function BrowseQuestionScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { colorScheme } = useColorScheme();
  const { showSnackbar } = useSnackbar();
  
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const questionSheet = useBottomSheet();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  const { data: questions = [], isLoading, error } = useQuery({
    queryKey: ["questions", lessonId],
    queryFn: () => getQuestionsByLessonId(lessonId),
    enabled: !!lessonId,
  });

  const selectedQuestion = useMemo(() => {
    return questions.find(
      (question) => question.id === selectedQuestionId
    );
  }, [selectedQuestionId, questions]);

  const deleteQuestionMutation = useMutation({
    mutationFn: deleteQuestion,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["questions", lessonId]
      });
      await queryClient.invalidateQueries({
        queryKey: ["quizData", lessonId]
      });
      setModalVisible(false);
      setSelectedQuestionId(null);
      showSnackbar({ message: "Question deleted successfully" });
    },

    onError: (error) => {
      console.error(error);
      showSnackbar({ message: "Something went wrong. Please try again." });
    }
  })
  
  const handleQuestionLongPress = (id: string) => {
    setSelectedQuestionId(id);
    questionSheet.open();
  };

  const handleDelete = async () => {
    if (!selectedQuestionId) return;
    await deleteQuestionMutation.mutateAsync(selectedQuestionId);
  }

  const resetState = () => {
    questionSheet.close();
    setModalVisible(false);
    setSelectedQuestionId(null);
  }

  return (
    <View
      className="flex-1 bg-white dark:bg-neutral-900"
      style={{ paddingBottom: insets.bottom }}
    >
      <Header title="Questions" back />

      <View className="flex-1">
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
            className="px-6 py-2"
            keyExtractor={(item) => item.id}
            contentContainerClassName="gap-2 pb-6"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <QuestionItem
                key={item.id}
                id={item.id}
                lessonId={item.lessonId}
                question={item.question}
                onLongPress={handleQuestionLongPress}
              />
            )}
          />

        ): (
          <EmptyList message="No questions yet" />
        )}

        <Fab setVisible={() => router.push({
          pathname: `/questions/create`,
          params: { lessonId: lessonId}
        })} />

        <BottomSheet
          sheet={questionSheet}
          onRequestClose={resetState}
          className="px-4 py-8"
        >
          <View className="rounded-3xl bg-white">
            <Pressable
              onPress={() => {
                if (!selectedQuestionId) return;
                questionSheet.close(() => {
                  router.push({
                    pathname: `/questions/[id]`,
                    params: { 
                      id: selectedQuestionId, 
                      lessonId: selectedQuestion?.lessonId 
                    }
                  })
                });
              }}
              className="
              flex-row items-center gap-2 
              rounded-t-3xl p-4 
              bg-white active:bg-gray-100
              dark:bg-neutral-700 dark:active:bg-neutral-600
            "
            >
              <PenLine size={16} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
              <Text className="text-xl dark:text-neutral-300">
                Update
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                questionSheet.close(() => setModalVisible(true));
              }}
              className="
              flex-row items-center gap-2 
              rounded-b-3xl p-4 
              bg-white active:bg-gray-100
              dark:bg-neutral-700 dark:active:bg-neutral-600
            "
            >
              <Trash2 color="#f87171" size={16} />
              <Text className="text-xl text-red-400">Delete</Text>
            </Pressable>
          </View>
        </BottomSheet>

        <DeleteModal
          icon={Trash2}
          onClose={resetState}
          header="Delete Question"
          onConfirm={handleDelete}
          isVisible={modalVisible}
          onConfirmLabel={deleteQuestionMutation.isPending ? 'Deleting...' : 'Delete'}
          description={`Are you sure you want to this question?`}
        />
      </View>
    </View>
  )
}