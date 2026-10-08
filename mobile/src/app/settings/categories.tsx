import { createCategory, deleteCategory, getCategories, swapCategoryPosition, updateCategory } from '@/repositories/category.repository';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ListOrdered, PenLine, Trash2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryFormData } from '@/schemas/category.schema';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { useBottomSheet } from '@/hooks/UseBottomSheet';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';

import CustomModal from '@/components/shared/modals/CustomModal';
import DeleteModal from '@/components/shared/modals/DeleteModal';
import CategoryForm from '@/components/categories/CategoryForm';
import CategoryItem from '@/components/categories/CategoryItem';
import BottomSheet from "@/components/shared/BottomSheet";
import Header from '@/components/shared/Header';
import Fab from '@/components/shared/fabs/Fab';
import EmptyList from '@/components/shared/EmptyList';

export default function CategoryScreen() {
  const { showSnackbar } = useSnackbar();
  const { colorScheme } = useColorScheme();

  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const categorySheet = useBottomSheet();

  const [isEditing, setIsEditing] = useState(false);

  const [categoryFormModalVisible, setCategoryFormModalVisible] = useState(false);
  const [categoryDeleteModalVisible, setCategoryDeleteModalVisible] = useState(false);
  const [categoryPositionModalVisible, setCategoryPositionModalVisible] = useState(false);
  
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
      showSnackbar({ 
        message: "Category successfully created" 
      });
      resetState();
    },

    onError: (error) => {
      showSnackbar({ 
        message: "Something went wrong. Please try again." 
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormData }) =>
      updateCategory(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['categories'],
      });
      showSnackbar({
        message: "Category successfully updated" 
      })
      resetState();
    },

    onError: (error) => {
      showSnackbar({ 
        message: "Something went wrong. Please try again." 
      });
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
      resetState();
    },

    onError: (error) => {
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
      showSnackbar({ 
        message: "Category successfully deleted" 
      });
      resetState();
    },

    onError: (error) => {
      showSnackbar({ 
        message: "Something went wrong. Please try again." 
      });
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

  const handleCategoryPress = (id: string) => {
    setIsEditing(true);
    setSelectedCategoryId(id);
    setCategoryFormModalVisible(true);
  };

  const handleCategoryLongPress = (id: string) => {
    setSelectedCategoryId(id);
    categorySheet.open();
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategoryId) return;
    await deleteCategoryMutation.mutateAsync(selectedCategoryId);
  };

  const resetState = () => {
    categorySheet.close();
    setIsEditing(false);
    setSelectedCategoryId(null);
    setCategoryFormModalVisible(false);
    setCategoryDeleteModalVisible(false);
    setCategoryPositionModalVisible(false);
  }

  return (
    <View
      className="flex-1 bg-white dark:bg-neutral-900"
      style={{ paddingBottom: insets.bottom }}
    >
      <Header title="Edit Categories" back={true} />

      <View className="flex-1">
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
            showsVerticalScrollIndicator={false}
            contentContainerClassName="gap-2 p-4"
            contentContainerStyle={{
              paddingBottom: insets.bottom,
            }}
            renderItem={({ item }) => (
              <CategoryItem
                id={item.id}
                name={item.name}
                onPress={handleCategoryPress}
                onLongPress={handleCategoryLongPress}
              />
            )}
          />

        ) : (<EmptyList message='No categories yet' />)}

        <Fab setVisible={setCategoryFormModalVisible} />

        <BottomSheet 
          sheet={categorySheet} 
          onRequestClose={resetState}
          onBackdropPress={resetState}
          className="px-4 py-8"
        >
          <View className="rounded-3xl bg-white dark:bg-neutral-700">
            <Pressable
              onPress={() => {
                categorySheet.close(() => {
                  setCategoryPositionModalVisible(true);
                });
              }}
              className="
                flex-row items-center gap-2 
                rounded-t-3xl p-4 
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
                setIsEditing(true);
                categorySheet.close(() => setCategoryFormModalVisible(true));
              }}
              className="
                flex-row items-center gap-2 p-4 
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
                categorySheet.close(() => setCategoryDeleteModalVisible(true));
              }}
              className="
                flex-row items-center gap-2 
                rounded-b-3xl p-4 
                bg-white active:bg-gray-100
                dark:bg-neutral-700 dark:active:bg-neutral-600
              "
            >
              <Trash2 color="#f87171" size={16} />
              <Text className="text-center text-xl text-red-400">
                Delete
              </Text>
            </Pressable>
          </View>
        </BottomSheet>

        <CustomModal
          header={isEditing ? 'Rename Category' : 'Create Category'}
          isVisible={categoryFormModalVisible}
          onClose={resetState}
        >
          <CategoryForm
            isEditing={isEditing}
            onSubmit={handleCategoryFormSubmit}
            defaultValues={{
              name: selectedCategory?.name ?? "",
            }}
          />
        </CustomModal>

        <CustomModal
          header="Categories"
          isVisible={categoryPositionModalVisible}
          onClose={resetState}
        >
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
                className="
                  rounded-xl p-4 
                  bg-gray-50 active:bg-gray-100 
                  dark:bg-neutral-800 dark:active:bg-neutral-700
                "
              >
                <Text className="font-semibold dark:text-neutral-300">
                  {item.name}
                </Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <EmptyList message="No other categories yet" />
            }
          />
        </CustomModal>

        <DeleteModal
          icon={Trash2}
          onClose={resetState}
          header="Delete Category"
          onConfirm={handleConfirmDelete}
          isVisible={categoryDeleteModalVisible}
          onConfirmLabel={deleteCategoryMutation.isPending ? 'Deleting...' : 'Delete'}
          description={`Are you sure you want to delete ${selectedCategory?.name || "this category"}?`}
        />
      </View>
    </View>
  );
}
