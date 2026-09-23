import { deleteQuestion, getQuestionsByLessonId } from "@/repositories/question.repository";
import { ActivityIndicator, Animated, FlatList, Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PenLine, Plus, SearchX, Trash2 } from "lucide-react-native";

import QuestionItem from "@/components/questions/QuestionItem";
import Header from "@/components/shared/Header";
import { useMemo, useState } from "react";
import { useBottomSheet } from "@/hooks/UseBottomSheet";
import { useSnackbar } from "@/providers/SnackbarContext";

export default function BrowseQuestionScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
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
  }, [selectedQuestionId]);

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

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingBottom: insets.bottom }}
    >
      <Header title="Questions" back={true} />

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
            contentContainerStyle={{
              paddingBottom: 100,
            }}
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
          <View className='flex-1 justify-center items-center'>
            <SearchX size={64} color="#9ca3af" />
            <Text className='text-gray-400 font-semibold'>No questions found</Text>
          </View>
        )}

        <Pressable
          onPress={() => router.push({
            pathname: `/questions/create`,
            params: { lessonId: lessonId}
          })}
          className="absolute bottom-6 right-6 h-16 w-16 items-center justify-center rounded-full bg-white active:bg-gray-50"
          style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)' }}
        >
          <Plus size={24} color="#4b5563" />
        </Pressable>

        <Modal
          transparent
          animationType="none"
          visible={questionSheet.visible}
          onRequestClose={() => questionSheet.close()}
        >
          <View className="flex-1 justify-end">
            <Animated.View
              className="absolute inset-0 bg-black/40"
              style={{ opacity: questionSheet.backdropOpacity }}
            >
              <Pressable
                className="flex-1"
                onPress={() => {
                  questionSheet.close(() => {
                    setSelectedQuestionId(null);
                  });
                }}
              />
            </Animated.View>

            <Animated.View
              style={{ transform: [{ translateY: questionSheet.translateY }] }}
              className="rounded-t-3xl bg-gray-50 px-4 py-8"
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
                  className="flex-row items-center gap-2 rounded-t-3xl p-4 active:bg-gray-100"
                >
                  <PenLine size={16} />
                  <Text className="text-xl">Update</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    questionSheet.close(() => setModalVisible(true));
                  }}
                  className="flex-row items-center gap-2 rounded-b-3xl p-4 active:bg-gray-100"
                >
                  <Trash2 color="#f87171" size={16} />
                  <Text className="text-xl text-red-400">Delete</Text>
                </Pressable>
              </View>

              <View style={{ height: insets.bottom }} />
            </Animated.View>
          </View>
        </Modal>

        <Modal
          transparent
          animationType="fade"
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <Pressable
            className="flex-1 items-center justify-center bg-black/40"
            onPress={() => {
              setSelectedQuestionId(null);
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
                  onPress={handleDelete}
                  disabled={deleteQuestionMutation.isPending}
                  className="rounded-full bg-red-500 px-6 py-4 active:bg-red-400"
                >
                  <Text className="font-semibold text-center text-white">
                    {deleteQuestionMutation.isPending ? 'Deleting...' : 'Delete'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setSelectedQuestionId(null);
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
      </View>
    </View>
  )
}