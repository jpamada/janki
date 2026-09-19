import { createSubject, deleteSubject, getSubjectsByCategory, updateSubject } from "@/repositories/subject.repository";
import { FolderClosed, Lightbulb, PenLine, Plus, SearchX, StarMinus, StarPlus, Trash2, X } from "lucide-react-native";
import { createLesson, deleteLesson, toggleLessonFavorite, updateLesson } from "@/repositories/lesson.repository";
import { ActivityIndicator, Animated, FlatList, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategories } from "@/repositories/category.repository";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SubjectFormData } from "@/schemas/subject.schema";
import { useSnackbar } from "@/providers/SnackbarContext";
import { LessonFormData } from "@/schemas/lesson.schema";
import { useBottomSheet } from "@/hooks/UseBottomSheet";
import { useCallback, useMemo, useState } from "react";
import { router, useFocusEffect } from "expo-router";

import SubjectItem from "@/components/subjects/SubjectItem";
import SubjectForm from "@/components/subjects/SubjectForm";
import LessonForm from "@/components/lessons/LessonForm";
import Header from "@/components/shared/Header";

export default function HomeScreen() {
  const { showSnackbar } = useSnackbar();

  const subjectSheet = useBottomSheet();
  const lessonSheet = useBottomSheet();

  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fabVisible, setFabVisible] = useState(false);
  const [subjectModalVisible, setSubjectModalVisible] = useState(false);
  const [lessonModalVisible, setLessonModalVisible] = useState(false);

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const { data: subjects = [], isLoading, error } = useQuery({
    queryKey: ["subjects", selectedCategoryId],
    queryFn: () => getSubjectsByCategory(selectedCategoryId)
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const selectedSubject = useMemo(() => {
    return subjects.find(
      (subject) => subject.id === selectedSubjectId
    )
  }, [subjects, selectedSubjectId]);

  const selectedLesson = useMemo(() => {
    return subjects.flatMap(
      (subject) => subject.lessons.find(
      (lesson) => lesson.id === selectedLessonId)
    ).find(Boolean);
  }, [subjects, selectedLessonId])

  const createSubjectMutation = useMutation({
    mutationFn: createSubject,

    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ["subjects"] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ["subjects", selectedCategoryId] 
      });
      resetForm();
    },

    onError: (error) => {
      console.error(error.message);
    }
  });

  const updateSubjectMutation = useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: SubjectFormData 
    }) => updateSubject(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ["subjects", selectedCategoryId] 
      });
      resetForm();
    },

    onError: (error) => {
      console.error(error.message);
    }
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: deleteSubject,

    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ["subjects", selectedCategoryId] 
      });
      resetForm();
    },
    onError: (error) => {
      console.error(error.message);
    }
  });

  const createLessonMutation = useMutation({
    mutationFn: createLesson,

    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ["subjects", selectedCategoryId] 
      });
      resetForm();
    },

    onError: (error) => {
      console.error(error.message);
    }
  });

  const updateLessonMutation = useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: LessonFormData 
    }) => updateLesson(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ["subjects", selectedCategoryId] 
      });
      resetForm();
    },
    
    onError: (error) => {
      console.error(error.message);
    }
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, favorite }: { 
      id: string; 
      favorite: boolean 
    }) => toggleLessonFavorite(id, favorite),

    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ 
        queryKey: ["subjects", selectedCategoryId] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ["favorites"] 
      });
      
      if (variables.favorite) {
        showSnackbar({ message: "Added to favorites" });

      } else {
        showSnackbar({ message: "Removed from favorites" });
      }
      resetForm();
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: deleteLesson,

    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ["subjects", selectedCategoryId] 
      });
      await queryClient.invalidateQueries({
        queryKey: ["favorites"]
      });
      resetForm();
    },

    onError: (error) => {
      console.error(error.message);
    }
  });

  const handleSubjectSubmit = async (data: SubjectFormData) => {
    if (isEditing && selectedSubjectId) {
      await updateSubjectMutation.mutateAsync({
        id: selectedSubjectId,
        data: { name: data.name, categoryId: data.categoryId }
      });

    } else {
      await createSubjectMutation.mutateAsync({
        name: data.name,
        categoryId: data.categoryId
      });
    }
  }

  const handleLessonSubmit = async (data: LessonFormData) => {
    if (isEditing && selectedLessonId) {
      await updateLessonMutation.mutateAsync({
        id: selectedLessonId,
        data: data
      });

    } else {
      await createLessonMutation.mutateAsync({
        name: data.name,
        subjectId: data.subjectId
      });
    }
  }

  const handleDelete = async () => {
    if (selectedSubjectId) {
      await deleteSubjectMutation.mutateAsync(selectedSubjectId);

    } else if (selectedLessonId) {
      await deleteLessonMutation.mutateAsync(selectedLessonId);
    }
  }

  const handleToggleFavorite = (id: string, favorite: boolean) => {
    toggleFavoriteMutation.mutate({
      id,
      favorite,
    });
  };

  const handleSubjectLongPress = (id: string) => {
    setSelectedSubjectId(id);
    subjectSheet.open();
  };

  const handleLessonLongPress = (id: string) => {
    setSelectedLessonId(id);
    lessonSheet.open();
  };

  const resetForm = () => {
    lessonSheet.close();
    subjectSheet.close();
    setIsEditing(false);
    setFabVisible(false);
    setIsDeleting(false);
    setSelectedLessonId(null);
    setSelectedSubjectId(null);
    setLessonModalVisible(false);
    setSubjectModalVisible(false);
  }

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    }, [queryClient])
  );

  return (
    <View className="flex-1 bg-white">
      <Header title="Quiz" />

      <ScrollView
        horizontal
        className="max-h-12"
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="flex-row items-center gap-2 px-6"
      >
        <Pressable
          onPress={() => setSelectedCategoryId(null)}
          className={`rounded-full px-4 py-2 ${
            selectedCategoryId == null ? "bg-gray-600" : "bg-gray-50 active:bg-gray-100"
          }`}
        >
          <Text
            className={`text-gray-600 text-sm ${
              selectedCategoryId == null ? 'text-white font-bold' : 'font-semibold'
            }`}
          >
            Default
          </Text>
        </Pressable>

        {categories.map((category) => (
          <Pressable
            key={category.id}
            onPress={() => setSelectedCategoryId(category.id)}
            className={`rounded-full px-4 py-2 ${
              selectedCategoryId === category.id ? "bg-gray-600" : "bg-gray-50 active:bg-gray-100"
            }`}
          >
            <Text
              className={`text-gray-600 text-sm ${
                selectedCategoryId === category.id ? 'text-white font-bold' : 'font-semibold'
              }`}
            >
              {category.name}
            </Text>
          </Pressable>
        ))}

        <Pressable
          onPress={() => router.push('/categories')}
          className="flex flex-row items-center gap-1 bg-gray-50 rounded-full px-4 py-2 active:bg-gray-100"
        >
          <Plus color="#4b5563" strokeWidth={2} size={16} />
          <Text className='text-gray-600 text-sm font-semibold'>
            New Category
          </Text>
        </Pressable>
      </ScrollView>

      <View className="flex-1 px-6 py-4">
        <Text className="text-gray-400 text-sm font-semibold mb-2">
          Subjects
        </Text>

        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="small" color="#4b5563" />
          </View>

        ) : error ? (
          <View className="flex-1 justify-center items-center">
            <Text>Failed to load subject</Text>
          </View>

        ) : subjects?.length > 0 ? (
          <FlatList
            data={subjects}
            keyExtractor={(item) => item.id}
            contentContainerClassName="gap-2"
            renderItem={({ item }) => (
              <SubjectItem
                subject={item}
                onToggleFavorite={handleToggleFavorite}
                onLessonLongPress={handleLessonLongPress}
                onSubjectLongPress={handleSubjectLongPress}
              />
            )}
          />

        ) : (
          <View className='flex-1 justify-center items-center'>
            <SearchX size={64} color="#9ca3af" />
            <Text className='text-gray-400 font-semibold'>
              No subjects found
            </Text>
          </View>
        )}
      </View>


      {fabVisible && (
        <Pressable
          className="absolute inset-0"
          onPress={() => setFabVisible(false)}
        />
      )}

      <View className="absolute bottom-6 right-6 items-end">
        {fabVisible && (
          <View className="mb-3 items-end gap-3">
            <Pressable
              onPress={() => {
                setFabVisible(false);
                setSubjectModalVisible(true);
              }}
              className="flex-row items-center gap-2 rounded-full bg-white px-4 py-3 active:bg-gray-50"
              style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)' }}
            >
              <FolderClosed size={20} color="#4b5563" />
              <Text className="font-semibold text-gray-700">New Subject</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                if (subjects.length === 0) {
                  showSnackbar({ message: "Create a subject first." });
                  return;
                }
                setFabVisible(false);
                setLessonModalVisible(true);
              }}
              className="flex-row items-center gap-2 rounded-full bg-white px-4 py-3 active:bg-gray-50"
              style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)' }}
            >
              <Lightbulb size={20} color="#4b5563" />
              <Text className="font-semibold text-gray-700">New Lesson</Text>
            </Pressable>
          </View>
        )}

        <Pressable
          onPress={() => setFabVisible((prev) => !prev)}
          className="h-16 w-16 items-center justify-center rounded-full bg-white active:bg-gray-50"
          style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)' }}
        >
          {fabVisible ? (
            <X size={24} color="#4b5563" />
          ) : (
            <Plus size={24} color="#4b5563" />
          )}
        </Pressable>
      </View>

      <Modal
        transparent
        animationType="none"
        visible={subjectSheet.visible}
        onRequestClose={() => subjectSheet.close()}
      >
        <View className="flex-1 justify-end">
          <Animated.View
            className="absolute inset-0 bg-black/40"
            style={{ opacity: subjectSheet.backdropOpacity }}
          >
            <Pressable
              className="flex-1"
              onPress={resetForm}
            />
          </Animated.View>

          <Animated.View
            style={{ transform: [{ translateY: subjectSheet.translateY }] }}
            className="rounded-t-3xl bg-gray-50 px-4 py-8"
          >
            <View className="rounded-3xl bg-white">
              <Pressable
                onPress={() => {
                  setLessonModalVisible(true);
                  subjectSheet.close();
                }}
                className="flex-row items-center gap-2 rounded-t-3xl p-4 active:bg-gray-100"
              >
                <Lightbulb size={16} />
                <Text className="text-xl">Add Lesson</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setIsEditing(true);
                  subjectSheet.close(() => setSubjectModalVisible(true));
                }}
                className="flex-row items-center gap-2 rounded-t-3xl p-4 active:bg-gray-100"
              >
                <PenLine size={16} />
                <Text className="text-xl">Update</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setIsDeleting(true);
                  subjectSheet.close(() => setSubjectModalVisible(true));
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
        animationType="none"
        visible={lessonSheet.visible}
        onRequestClose={() => lessonSheet.close()}
      >
        <View className="flex-1 justify-end">
          <Animated.View
            className="absolute inset-0 bg-black/40"
            style={{ opacity: lessonSheet.backdropOpacity }}
          >
            <Pressable
              className="flex-1"
              onPress={resetForm}
            />
          </Animated.View>

          <Animated.View
            style={{ transform: [{ translateY: lessonSheet.translateY }] }}
            className="rounded-t-3xl bg-gray-50 px-4 py-8"
          >
            <View className="rounded-3xl bg-white">
              <Pressable
                onPress={() => {
                  const lessonId = selectedLessonId;
                  lessonSheet.close();
                  setSelectedLessonId(null);
                  router.push({
                    pathname: "/questions/create",
                    params: { lessonId },
                  });
                }}
                className="flex-row items-center gap-2 rounded-t-3xl p-4 active:bg-gray-100"
              >
                <Lightbulb size={16} />
                <Text className="text-xl">Add Question</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  const lessonId = selectedLessonId;
                  setSelectedLessonId(null);
                  lessonSheet.close(() => {
                    router.push({
                      pathname: "/questions/browse",
                      params: { lessonId }
                    });
                  });
                }}
                className="flex-row items-center gap-2 p-4 active:bg-gray-100"
              >
                <Lightbulb size={16} />
                <Text className="text-xl">Browse Questions</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  if (!selectedLesson) return;
                  toggleFavoriteMutation.mutate({
                    id: selectedLesson.id,
                    favorite: !selectedLesson.favorite,
                  });
                  lessonSheet.close();
                }}
                className="flex-row items-center gap-2 p-4 active:bg-gray-100"
              >
                {selectedLesson?.favorite ? (
                  <>
                    <StarMinus size={16} />
                    <Text className="text-xl">Remove From Favorites</Text>
                  </>
                ) : (
                  <>
                    <StarPlus size={16} />
                    <Text className="text-xl">Add to Favorites</Text>
                  </>
                )}
              </Pressable>

              <Pressable
                onPress={() => {
                  setIsEditing(true);
                  lessonSheet.close(() => setLessonModalVisible(true));
                }}
                className="flex-row items-center gap-2 p-4 active:bg-gray-100"
              >
                <PenLine size={16} />
                <Text className="text-xl">Update</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setIsDeleting(true);
                  lessonSheet.close(() => setLessonModalVisible(true));
                }}
                className="flex-row items-center gap-2 rounded-b-3xl p-4 active:bg-gray-100"
              >
                <Trash2 color="#f87171" size={16} />
                <Text className="text-center text-xl text-red-400">Delete</Text>
              </Pressable>
            </View>

            <View style={{ height: insets.bottom }} />
          </Animated.View>
        </View>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={subjectModalVisible}
        onRequestClose={() => setSubjectModalVisible(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/40"
          onPress={resetForm}
        >
          <Pressable
            className="w-[90%] rounded-2xl bg-white p-6"
            onPress={(event) => event.stopPropagation()}
          >
            {isDeleting ? (
              <View>
                <Text className="text-xl font-bold">Delete Subject</Text>
                <Text className="mt-2 text-gray-500">
                  Are you sure you want to delete this Subject. This action cannot be undone.
                </Text>
                <View className="mt-6 flex-row justify-end gap-2">
                  <Pressable
                    onPress={resetForm}
                    className="rounded-full px-6 py-3 active:bg-gray-100"
                  >
                    <Text className="font-semibold text-gray-600">Cancel</Text>
                  </Pressable>

                  <Pressable
                    onPress={handleDelete}
                    disabled={deleteSubjectMutation.isPending}
                    className="rounded-full bg-red-500 px-6 py-3 active:bg-red-400"
                  >
                    <Text className="font-semibold text-white">
                      {deleteSubjectMutation.isPending ? 'Deleting...' : 'Delete'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <SubjectForm
                isEditing={isEditing}
                onSubmit={handleSubjectSubmit}
                defaultValues={{
                  name: selectedSubject?.name ?? "",
                  categoryId: selectedSubject?.categoryId ?? selectedCategoryId ?? null
                }}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={lessonModalVisible}
        onRequestClose={() => setLessonModalVisible(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/40"
          onPress={resetForm}
        >
          <Pressable
            className="w-[90%] rounded-2xl bg-white p-6"
            onPress={(event) => event.stopPropagation()}
          >
            {isDeleting ? (
              <View>
                <Text className="text-xl font-bold">Delete Lesson</Text>
                <Text className="mt-2 text-gray-500">
                  Are you sure you want to delete this lesson. This action cannot be undone.
                </Text>
                <View className="mt-6 flex-row justify-end gap-2">
                  <Pressable
                    onPress={resetForm}
                    className="rounded-full px-6 py-3 active:bg-gray-100"
                  >
                    <Text className="font-semibold text-gray-600">Cancel</Text>
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
                onSubmit={handleLessonSubmit}
                isEditing={isEditing}
                defaultValues={{
                  name: selectedLesson?.name ?? "",
                  subjectId: selectedLesson?.subjectId ?? selectedSubjectId ?? "",
                  favorite: selectedLesson?.favorite ?? false,
                }}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}