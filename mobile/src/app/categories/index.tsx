import { createCategory, deleteCategory, getCategories, updateCategory } from '@/repositories/category.repository';
import { ActivityIndicator, FlatList, Modal, Pressable, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryFormData } from '@/schemas/category.schema';
import { Plus, SearchX } from 'lucide-react-native';
import { useState } from 'react';

import CategoryForm from '@/components/categories/CategoryForm';
import CategoryItem from '@/components/categories/CategoryItem';
import Header from '@/components/shared/Header';

export default function CategoryScreen() {
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId,
  );

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['categories'],
      });
      setModalVisible(false);
    },

    onError: (error) => {
      console.error(error.message);
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormData }) =>
      updateCategory(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['categories'],
      });
      setIsEditing(false);
      setModalVisible(false);
      setSelectedCategoryId(null);
    },

    onError: (error) => {
      console.error(error.message);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['categories'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['folders', selectedCategoryId],
      });
      await queryClient.invalidateQueries({
        queryKey: ['subjects', selectedCategoryId],
      });
      setIsDeleting(false);
      setModalVisible(false);
      setSelectedCategoryId(null);
    },

    onError: (error) => {
      console.error(error.message);
    },
  });

  const handleCategoryFormSubmit = async (data: CategoryFormData) => {
    if (isEditing && selectedCategoryId) {
      await updateCategoryMutation.mutateAsync({
        id: selectedCategoryId,
        data: {
          name: data.name,
        },
      });

    } else {
      await createCategoryMutation.mutateAsync({
        name: data.name,
      });
    }
  };

  const handleEditCategory = (id: string) => {
    setSelectedCategoryId(id);
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleDeleteCategory = async (id: string) => {
    setSelectedCategoryId(id);
    setIsDeleting(true);
    setModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategoryId) return;
    await deleteCategoryMutation.mutateAsync(selectedCategoryId);
  };

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingBottom: insets.bottom }}
    >
      <Header title="Edit Categories" back={true} />

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="small" color="#4b5563" />
        </View>

      ) : error ? (
        <View className="flex-1 justify-center items-center">
          <Text>Failed to load categories</Text>
        </View>

      ) : categories.length > 0 ? (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CategoryItem
              id={item.id}
              name={item.name}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
          )}
          contentContainerClassName="gap-2 p-4"
          showsVerticalScrollIndicator={false}
        />

      ) : (
        <View className="flex-1 items-center justify-center">
          <SearchX size={64} color="#9ca3af" />
          <Text className="text-gray-400">No category found</Text>
        </View>
      )}

      <View
        className="absolute right-6 items-end"
        style={{ bottom: insets.bottom + 24 }}
      >
        <Pressable
          onPress={() => setModalVisible((prev) => !prev)}
          className="h-14 w-14 items-center justify-center rounded-full bg-white active:bg-gray-50"
          style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)' }}
        >
          <Plus size={24} color="#4b5563" strokeWidth={2.5} />
        </Pressable>
      </View>

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
            setModalVisible(false);
            setSelectedCategoryId(null);
          }}
        >
          <Pressable
            className="w-[90%] rounded-2xl bg-white p-6"
            onPress={(event) => event.stopPropagation()}
          >
            {isDeleting && selectedCategoryId ? (
              <View className="flex flex-col gap-4">
                <View className="flex flex-col gap-4">
                  <Text className="text-xl font-bold text-gray-900">
                    Delete Category
                  </Text>

                  <Text className="mt-2 text-base text-gray-500">
                    Are you sure you want to delete this category?
                  </Text>
                </View>

                <View className="mt-6 flex-row justify-end gap-2">
                  <Pressable
                    onPress={() => {
                      setIsEditing(false);
                      setIsDeleting(false);
                      setModalVisible(false);
                      setSelectedCategoryId(null);
                    }}
                    className="rounded-full px-5 py-2 active:bg-gray-100"
                  >
                    <Text className="font-semibold text-gray-600">
                      Cancel
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleConfirmDelete}
                    disabled={deleteCategoryMutation.isPending}
                    className="rounded-full bg-red-500 px-5 py-2 active:bg-red-400"
                  >
                    <Text className="font-semibold text-white">
                      {deleteCategoryMutation.isPending
                        ? 'Deleting...'
                        : 'Delete'}
                    </Text>
                  </Pressable>
                </View>
              </View>
              
            ) : (
              <CategoryForm
                isEditing={isEditing}
                onSubmit={handleCategoryFormSubmit}
                defaultValues={{
                  name: selectedCategory?.name ?? "",
                }}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
