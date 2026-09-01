import { createSubject, deleteSubject, getSubjectsByCategory, updateSubject } from "@/repositories/subject.repository";
import { ActivityIndicator, FlatList, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PenLine, Plus, SearchX, Trash2 } from "lucide-react-native";
import { getCategories } from "@/repositories/category.repository";
import { SubjectFormData } from "@/schemas/subject.schema";
import { router } from "expo-router";
import { useState } from "react";

import SubjectItem from "@/components/subjects/SubjectItem";
import SubjectForm from "@/components/subjects/SubjectForm";
import Header from "@/components/shared/Header";

export default function SubjectsScreen() {
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  
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

  const selectedSubject = subjects.find(
    (subject) => subject.id === selectedSubjectId,
  );

  const createSubjectMutation = useMutation({
    mutationFn: createSubject,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["subjects"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["subjects", selectedCategoryId],
      });
      setModalVisible(false);
    },

    onError: (error) => {
      console.error(error.message);
    },
  });

  const updateSubjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SubjectFormData }) =>
      updateSubject(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["subjects"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["subjects", selectedCategoryId],
      });
      setIsEditing(false);
      setModalVisible(false);
      setSelectedSubjectId(null);
    },

    onError: (error) => {
      console.error(error.message);
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: deleteSubject,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["subjects"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["subjects", selectedCategoryId],
      });
      setIsDeleting(false);
      setModalVisible(false);
      setSelectedSubjectId(null);
    },

    onError: (error) => {
      console.error(error.message);
    },
  });

  const handleSubjectSubmit = async (data: SubjectFormData) => {
    if (isEditing && selectedSubjectId) {
      await updateSubjectMutation.mutateAsync({
        id: selectedSubjectId,
        data: {
          title: data.title,
          categoryId: data.categoryId
        }
      });

    } else {
      await createSubjectMutation.mutateAsync({
        title: data.title,
        categoryId: data.categoryId
      });
    }
  }

  const handleDelete = async () => {
    if (!selectedSubjectId) return
    await deleteSubjectMutation.mutateAsync(selectedSubjectId);
  }

  const handleSubjectLongPress = (id: string) => {
    setSelectedSubjectId(id);
    setBottomSheetVisible(true);
  };

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
          
        ): error ? (
          <View className="flex-1 justify-center items-center">
            <Text>Failed to load subject</Text>
          </View>

        ): subjects?.length > 0 ? (
          <FlatList
            data={subjects}
            keyExtractor={(item) => item.id}
            contentContainerClassName="gap-2"
            renderItem={({ item }) => (
              <SubjectItem
                id={item.id}
                title={item.title}
                onLongPress={handleSubjectLongPress}
              />
            )}
          />

        ): (
          <View className='flex-1 justify-center items-center'>
            <SearchX size={64} color="#9ca3af" />
            <Text className='text-gray-400 font-semibold'>No subjects found</Text>
          </View>
        )}
      </View>

      <Pressable
        onPress={() => setModalVisible(true)}
        className="absolute bottom-6 right-6 items-center justify-center bg-white rounded-full h-14 w-14 active:bg-gray-50"
        style={{
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
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
            setSelectedSubjectId(null);
            setBottomSheetVisible(false);
          }}
        >
          <View className="bg-gray-50 rounded-t-3xl px-4 py-8 h-auto">
            <View className="bg-white rounded-3xl">
              <Pressable
                onPress={() => {
                  setIsEditing(true);
                  setBottomSheetVisible(false);
                  setModalVisible(true);
                }}
                className="flex flex-row items-center gap-2 p-4 rounded-t-3xl active:bg-gray-100"
              >
                <PenLine size={16} />
                <Text className="text-center text-xl">Update</Text>
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
                <Text className="text-xl font-bold">Delete Subject</Text>

                <Text className="mt-2 text-gray-500">
                  Are you sure you want to delete this Subject. This action cannot
                  be undone.
                </Text>

                <View className="mt-6 flex-row justify-end gap-2">
                  <Pressable
                    onPress={() => {
                      setIsDeleting(false);
                      setSelectedSubjectId(null);
                      setModalVisible(false);
                    }}
                    className="rounded-full px-5 py-2 active:bg-gray-100"
                  >
                    <Text className="font-semibold text-gray-600">Cancel</Text>
                  </Pressable>

                  <Pressable
                    disabled={deleteSubjectMutation.isPending}
                    onPress={handleDelete}
                    className="rounded-full bg-red-500 px-5 py-2 active:bg-red-400"
                  >
                    <Text className="font-semibold text-white">
                      {deleteSubjectMutation.isPending ? 'Deleting...' : 'Delete'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <SubjectForm
                onSubmit={handleSubjectSubmit}
                isEditing={isEditing}
                defaultValues={{
                  title: selectedSubject?.title ?? "",
                  categoryId: selectedSubject?.categoryId ?? selectedCategoryId ?? null
                }}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}