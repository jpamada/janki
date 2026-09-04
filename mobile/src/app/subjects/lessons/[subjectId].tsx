import { createLesson, deleteLesson, getLessonsBySubjectId, updateLesson } from '@/repositories/lesson.repository';
import { ActivityIndicator, Animated, FlatList, Modal, Pressable, Text, View } from 'react-native';
import { Lightbulb, PenLine, Plus, SearchX, Trash2 } from 'lucide-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { LessonFormData } from '@/schemas/lesson.schema';
import { useBottomSheet } from '@/hooks/UseBottomSheet';
import { useState } from 'react';

import LessonItem from '@/components/lessons/LessonItem';
import LessonForm from '@/components/lessons/LessonForm';
import Header from '@/components/shared/Header';

export default function LessonScreen() {
  const { subjectId, subjectName } = useLocalSearchParams<{
    subjectId: string;
    subjectName: string;
  }>();

  const {
    backdropOpacity,
    open: openBottomSheet,
    close: closeBottomSheet,
    visible: bottomSheetVisible,
    translateY: bottomSheetTranslateY,
  } = useBottomSheet();

  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const { data: lessons = [], isLoading, error } = useQuery({
    queryKey: ["lessons", subjectId],
    queryFn: () => getLessonsBySubjectId(subjectId),
    enabled: !!subjectId,
  });

  const selectedLesson = lessons.find(
    (lesson) => lesson.id === selectedLessonId,
  );

  const createLessonMutation = useMutation({
    mutationFn: createLesson,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["lessons", subjectId],
      });
      setModalVisible(false);
    },

    onError: (error) => {
      console.error(error.message);
    },
  });

  const updateLessonMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: LessonFormData }) =>
      updateLesson(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["lessons", subjectId],
      });
      setIsEditing(false);
      setModalVisible(false);
      setSelectedLessonId(null);
    },

    onError: (error) => {
      console.error(error.message);
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: deleteLesson,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["lessons", subjectId],
      });
      setIsDeleting(false);
      setModalVisible(false);
      setSelectedLessonId(null);
    },

    onError: (error) => {
      console.error(error.message);
    },
  });

  const handleSubjectSubmit = async (data: LessonFormData) => {
    if (isEditing && selectedLessonId) {
      await updateLessonMutation.mutateAsync({
        id: selectedLessonId,
        data: {
          title: data.title,
          subjectId: subjectId
        }
      });

    } else {
      await createLessonMutation.mutateAsync({
        title: data.title,
        subjectId: subjectId
      });
    }
  }

  const handleDelete = async () => {
    if (!selectedLessonId) return
    await deleteLessonMutation.mutateAsync(selectedLessonId);
  }

  const handleLessonLongPress = (id: string) => {
    setSelectedLessonId(id);
    openBottomSheet();
  };

return (
  <View
    className="flex-1 bg-white"
    style={{ paddingBottom: insets.bottom }}
  >
    <Header title={subjectName} back={true} />

    <View className="flex-1 p-4">
      <Text className="text-gray-400 text-sm font-semibold mb-2">
        {subjectName} lessons
      </Text>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="small" color="#4b5563" />
        </View>

      ) : error ? (
        <View className="flex-1 justify-center items-center">
          <Text>Failed to load notes</Text>
        </View>

      ) : lessons?.length > 0 ? (
        <FlatList
          data={lessons}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-2"
          renderItem={({ item, index }) => (
            <LessonItem
              id={item.id}
              index={index}
              title={item.title}
              onLongPress={handleLessonLongPress}
            />
          )}
        />

      ) : (
        <View className="flex-1 justify-center items-center">
          <SearchX size={64} color="#9ca3af" />
          <Text className="text-gray-400 font-semibold">
            No lessons found
          </Text>
        </View>
      )}
    </View>

    <View
      className="absolute right-6 items-end"
      style={{ bottom: insets.bottom + 24 }}
    >
      <Pressable
        onPress={() => setModalVisible(true)}
        style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)' }}
        className="h-16 w-16 items-center justify-center rounded-full bg-white active:bg-gray-50"
      >
        <Plus size={24} color="#4b5563" strokeWidth={2.5} />
      </Pressable>
    </View>

    <Modal
      transparent
      animationType="none"
      visible={bottomSheetVisible}
      onRequestClose={() => closeBottomSheet()}
    >
      <View className="flex-1 justify-end">
        <Animated.View
          className="absolute inset-0 bg-black/40"
          style={{ opacity: backdropOpacity }}
        >
          <Pressable
            className="flex-1"
            onPress={() => {
              setSelectedLessonId(null);
              setIsDeleting(false);
              setIsEditing(false);
              closeBottomSheet();
            }}
          />
        </Animated.View>

        <Animated.View
          style={{
            transform: [{
              translateY: bottomSheetTranslateY,
            }],
          }}
          className="rounded-t-3xl bg-gray-50 px-4 py-8"
        >
          <View className="rounded-3xl bg-white">
            <Pressable
              onPress={() => {
                setSelectedLessonId(null);
                closeBottomSheet(() => {
                  router.push({
                    pathname: "/subjects/lessons/questions/create",
                    params: { lessonId: selectedLessonId }
                  });
                });
              }}
              className="flex-row items-center gap-2 rounded-t-3xl p-4 active:bg-gray-100"
            >
              <Lightbulb size={16} />
              <Text className="text-xl">
                Add Question
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setSelectedLessonId(null);
                closeBottomSheet(() => {
                  router.push({
                    pathname: "/subjects/lessons/questions/browse",
                    params: { lessonId: selectedLessonId }
                  });
                });
              }}
              className="flex-row items-center gap-2 p-4 active:bg-gray-100"
            >
              <Lightbulb size={16} />
              <Text className="text-xl">
                Browse Questions
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setIsEditing(true);
                closeBottomSheet(() => {
                  setModalVisible(true);
                });
              }}
              className="flex-row items-center gap-2 p-4 active:bg-gray-100"
            >
              <PenLine size={16} />
              <Text className="text-xl">
                Rename
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setIsDeleting(true);
                closeBottomSheet(() => {
                  setModalVisible(true);
                });
              }}
              className="flex-row items-center gap-2 rounded-b-3xl p-4 active:bg-gray-100"
            >
              <Trash2 color="#f87171" size={16} />
              <Text className="text-center text-xl text-red-400">
                Delete
              </Text>
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
            setIsEditing(false);
            setIsDeleting(false);
            setSelectedLessonId(null);
            setModalVisible(false);
          }}
        >
          <Pressable
            className="w-[90%] rounded-2xl bg-white p-6"
            onPress={(event) => event.stopPropagation()}
          >
            {isDeleting ? (
              <View>
                <Text className="text-xl font-bold">
                  Delete Lesson
                </Text>

                <Text className="mt-2 text-gray-500">
                  Are you sure you want to delete this lesson. This action cannot
                  be undone.
                </Text>

                <View className="mt-6 flex-row justify-end gap-2">
                  <Pressable
                    onPress={() => {
                      setIsEditing(false);
                      setIsDeleting(false);
                      setSelectedLessonId(null);
                      setModalVisible(false);
                    }}
                    className="rounded-full px-6 py-3 active:bg-gray-100"
                  >
                    <Text className="font-semibold text-gray-600">
                      Cancel
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleDelete}
                    disabled={deleteLessonMutation.isPending}
                    className="rounded-full bg-red-500 px-6 py-3 active:bg-red-400"
                  >
                    <Text className="font-semibold text-white">
                      {deleteLessonMutation.isPending ? 'Deleting...' : 'Delete'}
                    </Text>
                  </Pressable>
                </View>
              </View>

            ) : (
              <LessonForm
                onSubmit={handleSubjectSubmit}
                isEditing={isEditing}
                defaultValues={{
                  title: selectedLesson?.title ?? "",
                  subjectId: selectedLesson?.subjectId ?? subjectId ?? ""
                }}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
