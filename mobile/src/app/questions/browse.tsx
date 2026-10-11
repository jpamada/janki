import { deleteQuestion, getQuestionsByLessonId } from "@/repositories/question.repository";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useBottomSheet } from "@/hooks/UseBottomSheet";
import { PenLine, Trash2 } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useMemo, useState } from "react";

import DeleteModal from "@/components/shared/modals/DeleteModal";
import QuestionItem from "@/components/questions/QuestionItem";
import BottomSheet from "@/components/shared/BottomSheet";
import Header from "@/components/shared/Header";
import EmptyList from "@/components/shared/EmptyList";
import Fab from "@/components/shared/fabs/Fab";
import { PAGE_SIZE } from "@/constants/pagination";

export default function BrowseQuestionScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { colorScheme } = useColorScheme();
  const { showSnackbar } = useSnackbar();
  
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const questionSheet = useBottomSheet();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  const {
    data,
    error,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["questions", lessonId],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      getQuestionsByLessonId(lessonId, PAGE_SIZE, pageParam),
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage?.length < PAGE_SIZE) return undefined;
      return lastPageParam + PAGE_SIZE;
    },
    enabled: !!lessonId,
  });

  const questions = useMemo(
    () => data?.pages.flat() ?? [],
    [data],
  );

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
      showSnackbar({ 
        message: "Question deleted successfully" 
      });
    },

    onError: (error) => {
      showSnackbar({ 
        message: "Something went wrong. Please try again." 
      });
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
          
        ) : error ? (
        <View className="flex-1 justify-center items-center">
          <Text>Failed to load questions</Text>
        </View>

        ): (
          <FlatList
            data={questions}
            className="px-6 py-2"
            keyExtractor={(item) => item.id}
            contentContainerClassName="gap-2 pb-6"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 120,
            }}
            onEndReachedThreshold={0.5}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            renderItem={({ item }) => (
              <QuestionItem
                id={item.id}
                type={item.type}
                lessonId={item.lessonId}
                question={item.question}
                onLongPress={handleQuestionLongPress}
              />
            )}
            ListEmptyComponent={
              <EmptyList message="No questions yet" />
            }
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="py-4">
                  <ActivityIndicator size="small" color="#4b5563" />
                </View>
              ) : null
            }
          />
        )}

        <Fab setVisible={() => router.push({
          pathname: `/questions/create`,
          params: { lessonId: lessonId}
        })} />

        <BottomSheet
          sheet={questionSheet}
          className="px-4 pb-8"
          onBackdropPress={resetState}
          onRequestClose={resetState}
        >
          <View className="rounded-3xl">
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
              <Text className="text-xl text-red-400">
                Delete
              </Text>
            </Pressable>
          </View>
        </BottomSheet>

        <DeleteModal
          icon={Trash2}
          onClose={resetState}
          header="Delete Question"
          onConfirm={handleDelete}
          isVisible={modalVisible}
          description={`Are you sure you want to this question?`}
          onConfirmLabel={deleteQuestionMutation.isPending ? 'Deleting...' : 'Delete'}
        />
      </View>
    </View>
  )
}