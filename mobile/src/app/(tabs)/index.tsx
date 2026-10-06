import { createSubject, deleteSubject, getSubjectsByCategory, hasDefaultSubjects, updateSubject } from "@/repositories/subject.repository";
import { createLesson, deleteLesson, swapLessonPosition, toggleLessonFavorite, updateLesson } from "@/repositories/lesson.repository";
import { FolderClosed, Lightbulb, ListOrdered, PenLine, Plus, SearchX, StarMinus, StarPlus, Trash2 } from "lucide-react-native";
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCategories } from "@/repositories/category.repository";
import { SubjectFormData } from "@/schemas/subject.schema";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { LessonFormData } from "@/schemas/lesson.schema";
import { useBottomSheet } from "@/hooks/UseBottomSheet";
import { router, useFocusEffect } from "expo-router";
import { useColorScheme } from "nativewind";

import DebouncedPressable from "@/components/shared/pressables/DebouncedPressable";
import CollapsibleFab from "@/components/shared/fabs/CollapsibleFab";
import CustomModal from "@/components/shared/modals/CustomModal";
import DeleteModal from "@/components/shared/modals/DeleteModal";
import SubjectItem from "@/components/subjects/SubjectItem";
import SubjectForm from "@/components/subjects/SubjectForm";
import BottomSheet from "@/components/shared/BottomSheet";
import LessonForm from "@/components/lessons/LessonForm";
import Header from "@/components/shared/Header";
import EmptyList from "@/components/EmptyList";

export default function HomeScreen() {
  const { showSnackbar } = useSnackbar();
  const { colorScheme } = useColorScheme();

  const categoryScrollRef = useRef<ScrollView>(null);

  const subjectSheet = useBottomSheet();
  const lessonSheet = useBottomSheet();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [fabVisible, setFabVisible] = useState(false);
  
  const [subjectFormModalVisible, setSubjectFormModalVisible] = useState(false);
  const [subjectDeleteModalVisible, setSubjectDeleteModalVisible] = useState(false);

  const [lessonFormModalVisible, setLessonFormModalVisible] = useState(false);
  const [lessonDeleteModalVisible, setLessonDeleteModalVisible] = useState(false);
  const [lessonPositionModalVisible, setLessonPositionModalVisible] = useState(false);

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const { data: subjects = [], isPending: subjectsPending, error } = useQuery({
    queryKey: ["subjects", selectedCategoryId],
    queryFn: () => getSubjectsByCategory(selectedCategoryId)
  });

  const { data: categories = [], isPending: categoriesPending } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: defaultHasSubjects = true } = useQuery({
    queryKey: ['hasDefaultSubjects'],
    queryFn: hasDefaultSubjects,
  });

  const showDefaultTab = defaultHasSubjects || categories.length === 0;

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
  }, [subjects, selectedLessonId]);

  const selectedSubjectLessons = useMemo(() => {
    if (!selectedLesson) return [];

    const subject = subjects.find(
      (subject) => subject.id === selectedLesson.subjectId
    );

    return subject?.lessons ?? [];
  }, [subjects, selectedLesson]);

  const createSubjectMutation = useMutation({
    mutationFn: createSubject,

    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ["subjects"] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ["subjects", selectedCategoryId] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ["hasDefaultSubjects"] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ["favorites"] 
      });
      await queryClient.invalidateQueries({
        queryKey: ["history"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["latestHistory"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["statistics"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["dailyStatistics"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["heatmap"]
      });
      showSnackbar({ 
        message: "Subject successfully created" 
      });
      resetState();
    },

    onError: (error) => {
      showSnackbar({ 
        message: "Something went wrong. Please try again." 
      });
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
      await queryClient.invalidateQueries({ 
        queryKey: ["hasDefaultSubjects"] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ["favorites"] 
      });
      showSnackbar({ 
        message: "Subject successfully updated" 
      });
      resetState();
    },

    onError: (error) => {
      showSnackbar({ 
        message: "Something went wrong. Please try again." 
      });
    }
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: deleteSubject,

    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ["subjects", selectedCategoryId] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ["hasDefaultSubjects"] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ["favorites"] 
      });
      await queryClient.invalidateQueries({
        queryKey: ["history"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["latestHistory"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["statistics"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["dailyStatistics"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["heatmap"]
      });
      showSnackbar({ 
        message: "Subject successfully deleted" 
      });
      resetState();
    },

    onError: (error) => {
      showSnackbar({ 
        message: "Something went wrong. Please try again." 
      });
    }
  });

  const createLessonMutation = useMutation({
    mutationFn: createLesson,

    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ["subjects", selectedCategoryId] 
      });
      await queryClient.invalidateQueries({
        queryKey: ["statistics"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["dailyStatistics"]
      });
      showSnackbar({ 
        message: "Lesson successfully created" 
      });
      resetState();
    },

    onError: (error) => {
      showSnackbar({ 
        message: "Something went wrong. Please try again." 
      });
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
      await queryClient.invalidateQueries({ 
        queryKey: ["favorites"] 
      });
      showSnackbar({ message: "Lesson successfully updated" });
      resetState();
    },
    
    onError: (error) => {
      showSnackbar({ 
        message: "Something went wrong. Please try again." 
      });
    }
  });

  const swapLessonPositionMutation = useMutation({
    mutationFn: ({
      lessonId,
      targetLessonId,
    }: {
      lessonId: string;
      targetLessonId: string;
    }) => swapLessonPosition(lessonId, targetLessonId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["subjects", selectedCategoryId],
      });

      showSnackbar({
        message: "Lesson position changed",
      });
      resetState();
    },

    onError: (error) => {
      showSnackbar({
        message: "Something went wrong. Please try again.",
      });
    },
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
        showSnackbar({ 
          message: "Added to favorites" 
        });

      } else {
        showSnackbar({ 
          message: "Removed from favorites" 
        });
      }
      resetState();
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
      await queryClient.invalidateQueries({
        queryKey: ["history"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["latestHistory"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["statistics"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["dailyStatistics"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["heatmap"]
      });
      showSnackbar({ 
        message: "Lesson successfully deleted" 
      });
      resetState();
    },

    onError: (error) => {
      showSnackbar({ 
        message: "Something went wrong. Please try again." 
      });
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
      id: id,
      favorite: favorite,
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

  const resetState = () => {
    lessonSheet.close();
    subjectSheet.close();

    setIsEditing(false);
    setFabVisible(false);
    
    setSelectedLessonId(null);
    setSelectedSubjectId(null);

    setSubjectFormModalVisible(false);
    setSubjectDeleteModalVisible(false);
    setLessonPositionModalVisible(false);

    setLessonFormModalVisible(false);
    setLessonDeleteModalVisible(false);
  }

  useEffect(() => {
    categoryScrollRef.current?.scrollTo({
      x: 0,
      animated: false,
    });
  }, [categories]);

  useEffect(() => {
    if (!showDefaultTab && selectedCategoryId === null && categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [showDefaultTab, selectedCategoryId, categories]);

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    }, [queryClient])
  );

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900">
      <Header title="Quiz" />

      <ScrollView
        horizontal
        className="max-h-12"
        ref={categoryScrollRef}
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="flex-row items-center gap-2 px-6"
      >
        {showDefaultTab && (
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
        )}

        {categories.map((category) => (
          <Pressable
            key={category.id}
            className={`
              rounded-full px-4 py-2 ${
              selectedCategoryId === category.id 
                ? "bg-gray-600 dark:bg-neutral-800" 
                : "bg-gray-50 active:bg-gray-100 dark:bg-neutral-700 dark:active:bg-neutral-600"
            }`}
            onPress={() => setSelectedCategoryId(category.id)}
          >
            <Text
              className={`text-gray-600 text-sm ${
                selectedCategoryId === category.id 
                  ? 'text-white font-bold dark:text-neutral-200' 
                  : 'font-semibold dark:text-neutral-300'
              }`}
            >
              {category.name}
            </Text>
          </Pressable>
        ))}

        <DebouncedPressable
          className="
            flex flex-row items-center gap-1 
            rounded-full px-4 py-2
            bg-gray-50 active:bg-gray-100 
            dark:bg-neutral-700 dark:active:bg-neutral-600
          "
          onPress={() => router.push('/settings/categories')}
        >
          <Plus 
            size={16} 
            strokeWidth={2} 
            color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} 
          />

          {showDefaultTab && (
            <Text className='text-gray-600 text-sm font-semibold dark:text-neutral-400'>
              New Category
            </Text>
          )}
        </DebouncedPressable>
      </ScrollView>

      <View className="flex-1">
        {subjectsPending || categoriesPending ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="small" color="#4b5563" />
          </View>

        ) : error ? (
          <View className="flex-1 justify-center items-center">
            <Text>Failed to load subject</Text>
          </View>

        ) : (
          <FlatList
            data={subjects}
            className="px-6 py-4"
            keyExtractor={(item) => item.id}
            contentContainerClassName="gap-2"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 100,
            }}
            ListHeaderComponent={
              <Text className="text-gray-400 text-sm font-semibold mb-2">
                Subjects
              </Text>
            }
            renderItem={({ item }) => (
              <SubjectItem
                subject={item}
                onToggleFavorite={handleToggleFavorite}
                onLessonLongPress={handleLessonLongPress}
                onSubjectLongPress={handleSubjectLongPress}
              />
            )}
            ListEmptyComponent={
              <View className='flex-1 justify-center items-center '>
                <SearchX size={64} color="#9ca3af" />
                <Text className='text-gray-400 font-semibold'>
                  No subjects yet
                </Text>
              </View>
            }
          />
        )}
      </View>

      <CollapsibleFab
        visible={fabVisible}
        setVisible={setFabVisible}
      >
        <Pressable
          onPress={() => {
            setFabVisible(false);
            setSubjectFormModalVisible(true);
          }}
          className="
            flex-row items-center gap-2 
            rounded-full px-4 py-3 
            bg-white active:bg-gray-50
            dark:bg-neutral-800 dark:active:bg-neutral-700
          "
          style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)' }}
        >
          <FolderClosed size={20} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
          <Text className="text-gray-700 font-semibold dark:text-neutral-300">
            New Subject
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            if (subjects.length === 0) {
              showSnackbar({ message: "Create a subject first." });
              return;
            }
            setFabVisible(false);
            setLessonFormModalVisible(true);
          }}
          className="
            flex-row items-center gap-2 
            rounded-full px-4 py-3 
            bg-white active:bg-gray-50
            dark:bg-neutral-800 dark:active:bg-neutral-700
          "
          style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)' }}
        >
          <Lightbulb size={20} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
          <Text className="text-gray-700 font-semibold dark:text-neutral-300">
            New Lesson
          </Text>
        </Pressable>
      </CollapsibleFab>
      
      <BottomSheet sheet={subjectSheet} onRequestClose={resetState} className="px-4 py-8">
        <View className="bg-white rounded-3xl dark:bg-neutral-700">
          <Pressable
            onPress={() => {
              subjectSheet.close(() => {
                setLessonFormModalVisible(true);
              });
            }}
            className="
              flex-row items-center gap-2 
              rounded-t-3xl p-4 
              bg-white active:bg-gray-100
              dark:bg-neutral-700 dark:active:bg-neutral-600
            "
          >
            <Lightbulb size={16} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
            <Text className="text-xl dark:text-neutral-300">
              Add Lesson
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setIsEditing(true);
              subjectSheet.close(() => setSubjectFormModalVisible(true));
            }}
            className="
              flex-row items-center gap-2 
              p-4 
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
              subjectSheet.close(() => setSubjectDeleteModalVisible(true));
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

      <BottomSheet sheet={lessonSheet} onRequestClose={resetState} className="px-4 py-8">
        <View className="bg-white rounded-3xl dark:bg-neutral-700">
          <Pressable
            onPress={() => {
              const lessonId = selectedLessonId;
              setSelectedLessonId(null);
              lessonSheet.close();
              router.push({
                pathname: "/questions/create",
                params: { lessonId },
              });
            }}
            className="
              flex-row items-center gap-2 
              rounded-t-3xl p-4 
              bg-white active:bg-gray-100
              dark:bg-neutral-700 dark:active:bg-neutral-600
            "
          >
            <Lightbulb size={16} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
            <Text className="text-xl dark:text-neutral-300">
              Add Question
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              const lessonId = selectedLessonId;
              setSelectedLessonId(null);
              lessonSheet.close();;
              router.push({
                pathname: "/questions/browse",
                params: { lessonId }
              });
            }}
            className="
              flex-row items-center gap-2 
              p-4 
              bg-white active:bg-gray-100
              dark:bg-neutral-700 dark:active:bg-neutral-600
            "
          >
            <Lightbulb size={16} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
            <Text className="text-xl dark:text-neutral-300">
              Browse Questions
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              lessonSheet.close(() => {
                setLessonPositionModalVisible(true);
              });
            }}
            className="
              flex-row items-center gap-2 
              p-4 
              bg-white active:bg-gray-100
              dark:bg-neutral-700 dark:active:bg-neutral-600
            "
          >
            <ListOrdered size={16} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
            <Text className="text-xl dark:text-neutral-300">
              Change Position
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              if (!selectedLesson) return;
              lessonSheet.close(() => {
                toggleFavoriteMutation.mutate({
                  id: selectedLesson.id,
                  favorite: !selectedLesson.favorite,
                });
              });
            }}
            className="
              flex-row items-center gap-2 
              p-4 
              bg-white active:bg-gray-100
              dark:bg-neutral-700 dark:active:bg-neutral-600
            "
          >
            {selectedLesson?.favorite ? (
              <>
                <StarMinus size={16} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
                <Text className="text-xl dark:text-neutral-300">
                  Remove From Favorites
                </Text>
              </>
            ) : (
              <>
                <StarPlus size={16} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
                <Text className="text-xl dark:text-neutral-300">
                  Add to Favorites
                </Text>
              </>
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              setIsEditing(true);
              lessonSheet.close(() => setLessonFormModalVisible(true));
            }}
            className="
              flex-row items-center gap-2 
              p-4 
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
              lessonSheet.close(() => setLessonDeleteModalVisible(true));
            }}
            className="
              flex-row items-center gap-2 
              rounded-b-3xl p-4 
              bg-white active:bg-gray-100
              dark:bg-neutral-700 dark:active:bg-neutral-600
            "
          >
            <Trash2 color="#f87171" size={16} />
            <Text className="text-center text-xl text-red-400">Delete</Text>
          </Pressable>
        </View>
      </BottomSheet>

      <CustomModal
        header={isEditing ? 'Rename Subject' : 'Create Subject'}
        isVisible={subjectFormModalVisible}
        onClose={resetState}
      >
        <SubjectForm
          isEditing={isEditing}
          onSubmit={handleSubjectSubmit}
          defaultValues={{
            name: selectedSubject?.name ?? "",
            categoryId: selectedSubject?.categoryId ?? selectedCategoryId ?? null
          }}
        />
      </CustomModal>

      <CustomModal 
        header={isEditing ? 'Rename Lesson' : 'Create Lesson'}
        isVisible={lessonFormModalVisible} 
        onClose={resetState}
      >
        <LessonForm
          isEditing={isEditing}
          onSubmit={handleLessonSubmit}
          defaultValues={{
            name: selectedLesson?.name ?? "",
            favorite: selectedLesson?.favorite ?? false,
            subjectId: selectedLesson?.subjectId ?? selectedSubjectId ?? "",
          }}
        />
      </CustomModal>

      <CustomModal
        header="Change Position"
        isVisible={lessonPositionModalVisible}
        onClose={resetState}
      >
        <FlatList
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-2"
          showsVerticalScrollIndicator={false}
          data={selectedSubjectLessons.filter(
            (lesson) => lesson.id !== selectedLessonId
          )}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                if (!selectedLessonId) return;
                swapLessonPositionMutation.mutate({
                  lessonId: selectedLessonId,
                  targetLessonId: item.id,
                });
                resetState();
              }}
              className="rounded-xl p-4 active:bg-gray-100 dark:active:bg-neutral-700"
            >
              <Text className="font-semibold dark:text-neutral-300">
                {item.name}
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <EmptyList message="No other lessons yet" />
          }
        />
      </CustomModal>

      <DeleteModal
        icon={Trash2}
        onClose={resetState}
        header="Delete Subject"
        onConfirm={handleDelete}
        isVisible={subjectDeleteModalVisible}
        onConfirmLabel={deleteSubjectMutation.isPending ? 'Deleting...' : 'Delete'}
        description={`Are you sure you want to delete ${selectedSubject?.name || "this subject"}?`}
      />

      <DeleteModal
        icon={Trash2}
        onClose={resetState}
        header="Delete Lesson"
        onConfirm={handleDelete}
        isVisible={lessonDeleteModalVisible}
        onConfirmLabel={deleteLessonMutation.isPending ? 'Deleting...' : 'Delete'}
        description={`Are you sure you want to delete ${selectedLesson?.name || "this lesson"}?`}
      />
    </View>
  )
}