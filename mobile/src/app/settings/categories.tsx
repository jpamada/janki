import { createCategory, deleteCategory, getCategories, swapCategoryPosition, updateCategory } from '@/repositories/category.repository';
import { ActivityIndicator, Animated, FlatList, Modal, Pressable, Text, View } from 'react-native';
import { ListOrdered, PenLine, Plus, SearchX, Trash2 } from 'lucide-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryFormData } from '@/schemas/category.schema';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { useBottomSheet } from '@/hooks/UseBottomSheet';
import { useState } from 'react';

import CategoryForm from '@/components/categories/CategoryForm';
import CategoryItem from '@/components/categories/CategoryItem';
import Header from '@/components/shared/Header';

export default function CategoryScreen() {
  const { showSnackbar } = useSnackbar();

  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const categorySheet = useBottomSheet();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [positionModalVisible, setPositionModalVisible] = useState(false);
  
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
      showSnackbar({ message: "Category successfully created" });
      setModalVisible(false);
    },

    onError: (error) => {
      console.error(error.message);
      showSnackbar({ message: "Something went wrong. Please try again." });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormData }) =>
      updateCategory(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['categories'],
      });
      showSnackbar({ message: "Category successfully updated" })
      setIsEditing(false);
      setModalVisible(false);
      setSelectedCategoryId(null);
    },

    onError: (error) => {
      console.error(error.message);
      showSnackbar({ message: "Something went wrong. Please try again." });
    },
  });

  const swapCategoryPositionMutation = useMutation({
    mutationFn: ({
      categoryId,
      targetCategoryId,
    }: {
      categoryId: string;
      targetCategoryId: string;
    }) => swapCategoryPosition(categoryId, targetCategoryId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['categories'],
      });
      showSnackbar({
        message: 'Category position changed',
      });
      setPositionModalVisible(false);
      setSelectedCategoryId(null);
    },

    onError: (error) => {
      console.error(error.message);
      showSnackbar({
        message: 'Something went wrong. Please try again.',
      });
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
      await queryClient.invalidateQueries({
        queryKey: ["hasDefaultSubjects"]
      });
      showSnackbar({ message: "Category successfully deleted" });
      setIsDeleting(false);
      setModalVisible(false);
      setSelectedCategoryId(null);
    },

    onError: (error) => {
      console.error(error.message);
      showSnackbar({ message: "Something went wrong. Please try again." });
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

  const handleCategoryLongPress = (id: string) => {
    setSelectedCategoryId(id);
    categorySheet.open();
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
          contentContainerStyle={{
            paddingBottom: 100,
          }}
          renderItem={({ item }) => (
            <CategoryItem
              id={item.id}
              name={item.name}
              onLongPress={handleCategoryLongPress}
            />
          )}
          contentContainerClassName="gap-2 p-4"
          showsVerticalScrollIndicator={false}
        />

      ) : (
        <View className="flex-1 items-center justify-center">
          <SearchX size={64} color="#9ca3af" />
          <Text className="text-gray-400">No category yet</Text>
        </View>
      )}

      <View
        className="absolute right-6 items-end"
        style={{ bottom: insets.bottom + 24 }}
      >
        <Pressable
          onPress={() => setModalVisible((prev) => !prev)}
          className="h-16 w-16 items-center justify-center rounded-full bg-white active:bg-gray-50"
          style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)' }}
        >
          <Plus size={24} color="#4b5563" strokeWidth={2.5} />
        </Pressable>
      </View>

      <Modal
        transparent
        animationType="none"
        visible={categorySheet.visible}
        onRequestClose={() => categorySheet.close()}
      >
        <View className="flex-1 justify-end">
          <Animated.View
            className="absolute inset-0 bg-black/40"
            style={{ opacity: categorySheet.backdropOpacity }}
          >
            <Pressable
              className="flex-1"
              onPress={() => {
                setIsDeleting(false);
                setIsEditing(false);
                setSelectedCategoryId(null);
                categorySheet.close();
              }}
            />
          </Animated.View>

          <Animated.View
            style={{ transform: [{ translateY: categorySheet.translateY }] }}
            className="rounded-t-3xl bg-gray-50 px-4 py-8"
          >
            <View className="rounded-3xl bg-white">
              <Pressable
                onPress={() => {
                  categorySheet.close(() => {
                    setPositionModalVisible(true);
                  });
                }}
                className="flex-row items-center gap-2 p-4 active:bg-gray-100"
              >
                <ListOrdered size={16} />
                <Text className="text-xl">Change Position</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setIsEditing(true);
                  categorySheet.close(() => setModalVisible(true));
                }}
                className="flex-row items-center gap-2 p-4 active:bg-gray-100"
              >
                <PenLine size={16} />
                <Text className="text-xl">Update</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setIsDeleting(true);
                  categorySheet.close(() => setModalVisible(true));
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
              <View>
                <View className="self-center w-32 h-32 items-center justify-center rounded-full bg-gray-100 mb-4">
                  <Trash2 size={72} color="#ef4444" />
                </View>

                <Text className="text-center text-xl font-bold">
                  Delete Category
                </Text>

                <Text className="text-center text-gray-500">
                  Are you sure you want to delete {selectedCategory?.name || "this category"}?
                </Text>

                <View className="mt-6 flex-col justify-end gap-2">
                  <Pressable
                    onPress={handleConfirmDelete}
                    disabled={deleteCategoryMutation.isPending}
                    className="rounded-full bg-red-500 px-6 py-4 active:bg-red-400"
                  >
                    <Text className="font-semibold text-center text-white">
                      {deleteCategoryMutation.isPending
                        ? 'Deleting...'
                        : 'Delete'}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setIsEditing(false);
                      setIsDeleting(false);
                      setModalVisible(false);
                      setSelectedCategoryId(null);
                    }}
                    className="rounded-full px-6 py-4 active:bg-gray-100"
                  >
                    <Text className="font-semibold text-center text-gray-600">
                      Cancel
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

      <Modal
        transparent
        animationType="fade"
        visible={positionModalVisible}
        onRequestClose={() => {
          setPositionModalVisible(false);
          setSelectedCategoryId(null);
        }}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/40"
          onPress={() => {
            setPositionModalVisible(false);
            setSelectedCategoryId(null);
          }}
        >
          <Pressable
            className="w-[90%] max-h-[80%] rounded-2xl bg-white p-6"
            onPress={(event) => event.stopPropagation()}
          >
            <Text className="mb-4 text-xl font-bold">
              Categories
            </Text>

            <FlatList
              data={categories.filter(
                (category) => category.id !== selectedCategoryId,
              )}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerClassName="gap-2"
              renderItem={({ item }) => (
                <Pressable
                  disabled={swapCategoryPositionMutation.isPending}
                  onPress={() => {
                    if (!selectedCategoryId) return;

                    swapCategoryPositionMutation.mutate({
                      categoryId: selectedCategoryId,
                      targetCategoryId: item.id,
                    });
                  }}
                  className="flex-row items-center rounded-xl p-4 active:bg-gray-100"
                >
                  <Text className="flex-1 text-lg">
                    {item.name}
                  </Text>
                </Pressable>
              )}
              ListEmptyComponent={
                <View className="flex flex-col gap-4">
                  <View className='flex-1 justify-center items-center bg-gray-50 rounded-xl py-4'>
                    <SearchX size={32} color="#9ca3af" />
                    <Text className='text-gray-400 font-semibold'>
                      No other categories yet
                    </Text>
                  </View>
                </View>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
