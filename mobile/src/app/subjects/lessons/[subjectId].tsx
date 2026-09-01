import { createLesson, deleteLesson, getLessonsBySubjectId, updateLesson } from '@/repositories/lesson.repository';
import { ActivityIndicator, FlatList, Modal, Pressable, Text, View } from 'react-native';
import { ArrowLeft, Lightbulb, PenLine, SearchX, Trash2 } from 'lucide-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { LessonFormData } from '@/schemas/lesson.schema';
import { useState } from 'react';

import LessonItem from '@/components/lessons/LessonItem';
import LessonForm from '@/components/lessons/LessonForm';
import Header from '@/components/shared/Header';

export default function LessonScreen() {
  const { subjectId, subjectName } = useLocalSearchParams<{
    subjectId: string;
    subjectName: string;
  }>();

  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const {
    data: lessons = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['lessons'],
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
        queryKey: ["lessons"],
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
        queryKey: ["lessons"],
      });
      setIsEditing(false);
      setModalVisible(false);
      setModalVisible(false);
    },

    onError: (error) => {
      console.error(error.message);
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: deleteLesson,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['lessons'],
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
    setBottomSheetVisible(true);
  };

  return (
    <View
      className="flex-1 bg-white"
      style={{
        paddingBottom: insets.bottom,
      }}
    >
      <Header
        title={subjectName}
        back={true}
      />

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
            <Text>Failed to load notes.</Text>
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
            <Text className="text-gray-400 font-semibold">No lessons found</Text>
          </View>
        )}
      </View>

      <Pressable
        onPress={() => setModalVisible(true)}
        className="absolute bottom-6 right-6 items-center justify-center bg-white rounded-full h-14 w-14 mt-auto active:bg-gray-50"
        style={{
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
        }}
      >
        <Text className="text-3xl text-gray-600">+</Text>
      </Pressable>

      <Modal
        transparent
        animationType="none"
        visible={bottomSheetVisible}
        onRequestClose={() => setBottomSheetVisible(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/30"
          onPress={() => {
            setSelectedLessonId(null);
            setBottomSheetVisible(false);
          }}
        >
          <View className="bg-gray-50 rounded-t-3xl px-4 py-8 h-auto">
            <View className="bg-white rounded-3xl">
              <Pressable
                onPress={() => {
                  setBottomSheetVisible(false);
                  router.push({
                    pathname: `/subjects/lessons/questions/create`,
                    params: { lessonId: selectedLessonId },
                  })}
                }
                className="flex flex-row items-center gap-2 p-4 rounded-t-3xl active:bg-gray-100"
              >
                <Lightbulb size={16} />
                <Text className="text-center text-xl">Add Question</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setBottomSheetVisible(false);
                  router.push({
                    pathname: `/subjects/lessons/questions/browse`,
                    params: { lessonId: selectedLessonId },
                  })}
                }
                className="flex flex-row items-center gap-2 p-4 active:bg-gray-100"
              >
                <Lightbulb size={16} />
                <Text className="text-center text-xl">Browse Questions</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setIsEditing(true);
                  setBottomSheetVisible(false);
                  setModalVisible(true);
                }}
                className="flex flex-row items-center gap-2 p-4 active:bg-gray-100"
              >
                <PenLine size={16} />
                <Text className="text-center text-xl">Rename</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setIsDeleting(true);
                  setModalVisible(true);
                  setBottomSheetVisible(false);
                }}
                className="flex flex-row items-center gap-2 p-4 rounded-b-3xl active:bg-gray-100"
              >
                <Trash2 color="#f87171" size={16} />
                <Text className="text-red-400 text-center text-xl">
                  Delete
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
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
            setModalVisible(false);
          }}
        >
          <Pressable
            className="w-[90%] rounded-2xl bg-white p-6"
            onPress={(event) => event.stopPropagation()}
          >
            {isDeleting ? (
              <View>
                <Text className="text-xl font-bold">Delete Lesson</Text>

                <Text className="mt-2 text-gray-500">
                  Are you sure you want to delete this lesson. This action cannot
                  be undone.
                </Text>

                <View className="mt-6 flex-row justify-end gap-2">
                  <Pressable
                    onPress={() => {
                      setIsDeleting(false);
                      setSelectedLessonId(null);
                      setModalVisible(false);
                    }}
                    className="rounded-full px-5 py-2 active:bg-gray-100"
                  >
                    <Text className="font-semibold text-gray-600">Cancel</Text>
                  </Pressable>

                  <Pressable
                    disabled={deleteLessonMutation.isPending}
                    onPress={handleDelete}
                    className="rounded-full bg-red-500 px-5 py-2 active:bg-red-400"
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
