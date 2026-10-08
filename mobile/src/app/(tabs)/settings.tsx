import { LayoutGrid, CloudUpload, CloudDownload, Trash2, Palette, Star } from 'lucide-react-native';
import { View, ScrollView, Pressable, Text } from 'react-native';
import { deleteProgress } from '@/repositories/progress.repository';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { exportData, importData } from '@/db/backup';
import { router } from 'expo-router';
import { useState } from 'react';

import DebouncedPressable from '@/components/shared/pressables/DebouncedPressable';
import DeleteModal from '@/components/shared/modals/DeleteModal';
import Header from '../../components/shared/Header';

export default function SettingsScreen() {
  const { showSnackbar } = useSnackbar();

  const queryClient = useQueryClient();

  const [resetModalVisible, setResetModalVisible] = useState(false);

  const deleteProgressMutation = useMutation({
    mutationFn: deleteProgress,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["heatmap"],
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['statistics'] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['dailyStatistics'] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['history'] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['latestHistory'] 
      });
      await queryClient.invalidateQueries({
        queryKey: ["subjects"],
      });
      await queryClient.invalidateQueries({ 
        queryKey: ["defaultSubjects"] 
      });
      showSnackbar({
        message: "Review data successfully reset",
      });
      setResetModalVisible(false);
    },

    onError: (error) => {
      showSnackbar({
        message: "Something went wrong. Please try again.",
      });
    },
  });

  const handleBackup = async () => {
    try {
      await exportData();

    } catch {
      showSnackbar({ 
        message: "There is an error trying to backup data" 
      });
    }
  };

  const handleRestore = async () => {
    try {
      const result = await importData();
      if (result.imported) {
        await queryClient.invalidateQueries();
        showSnackbar({ 
          message: "Data restored sucessfully" 
        });
      }

    } catch {
      showSnackbar({ 
        message: "There is an error restoring backup" 
      });
    }
  };

  const handleDeleteProgress = () => {
    deleteProgressMutation.mutate();
  };

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900">
      <Header title="Settings" />

      <ScrollView
        className="flex-1"
        contentContainerClassName='px-6 py-4'
        showsVerticalScrollIndicator={false}
      >
        <View className="flex flex-col">
          <Text className="text-gray-400 text-sm font-semibold mb-2">
            Interface
          </Text>

          <Pressable
            onPress={() => router.push(`/settings/appearance`)}
            className='
              flex flex-row items-center gap-4 
              bg-gray-50 active:bg-gray-100 rounded-xl p-4 mb-4 
              dark:bg-neutral-800 dark:active:bg-zinc-800
            '
          >
            <View className='bg-white rounded-xl p-4 dark:bg-neutral-700'>
              <Palette color="#9ca3af" />
            </View>

            <Text className='text-gray-600 text-lg font-bold dark:text-neutral-300'>
              User Interface
            </Text>
          </Pressable>

          <Text className="text-gray-400 text-sm font-semibold mb-2">
            Filter
          </Text>

          <DebouncedPressable
            onPress={() => router.push(`/settings/categories`)}
            className='
              flex flex-row items-center gap-4 
              bg-gray-50 active:bg-gray-100 rounded-xl p-4 mb-4 
              dark:bg-neutral-800 dark:active:bg-zinc-800
            '
          >
            <View className='bg-white rounded-xl p-4 dark:bg-neutral-700'>
              <LayoutGrid color="#9ca3af" />
            </View>

            <Text className='text-gray-600 text-lg font-bold dark:text-neutral-300'>
              Categories
            </Text>
          </DebouncedPressable>

          <DebouncedPressable
            onPress={() => router.push(`/settings/favorites`)}
            className='
              flex flex-row items-center gap-4 
              bg-gray-50 active:bg-gray-100 rounded-xl p-4 mb-4 
              dark:bg-neutral-800 dark:active:bg-zinc-800
            '
          >
            <View className='bg-white rounded-xl p-4 dark:bg-neutral-700'>
              <Star color="#9ca3af" />
            </View>

            <Text className='text-gray-600 text-lg font-bold dark:text-neutral-300'>
              Favorites
            </Text>
          </DebouncedPressable>

          <Text className="text-gray-400 text-sm font-semibold mb-2">
            Data
          </Text>

          <Pressable
            onPress={handleBackup}
            className='
              flex flex-row items-center gap-4 
              bg-gray-50 active:bg-gray-100 rounded-xl p-4 mb-4 
              dark:bg-neutral-800 dark:active:bg-zinc-800
            '
          >
            <View className='bg-white rounded-xl p-4 dark:bg-neutral-700'>
              <CloudUpload color="#9ca3af" />
            </View>

            <Text className='text-gray-600 text-lg font-bold dark:text-neutral-300'>
              Backup
            </Text>
          </Pressable>

          <Pressable
            onPress={handleRestore}
            className='
              flex flex-row items-center gap-4 
              bg-gray-50 active:bg-gray-100 rounded-xl p-4 mb-4 
              dark:bg-neutral-800 dark:active:bg-zinc-800
            '
          >
            <View className='bg-white rounded-xl p-4 dark:bg-neutral-700'>
              <CloudDownload color="#9ca3af" />
            </View>

            <Text className='text-gray-600 text-lg font-bold dark:text-neutral-300'>
              Restore
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setResetModalVisible(true)}
            className='
              flex flex-row items-center gap-4 
              bg-gray-50 active:bg-gray-100 rounded-xl p-4 mb-4 
              dark:bg-neutral-800 dark:active:bg-zinc-800
            '
          >
            <View className='bg-white rounded-xl p-4 dark:bg-neutral-700'>
              <Trash2 color="#9ca3af" />
            </View>

            <Text className='text-gray-600 text-lg font-bold dark:text-neutral-300'>
              Delete Progress
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <DeleteModal
        icon={Trash2}
        header='Reset Progress'
        isVisible={resetModalVisible}
        onConfirm={handleDeleteProgress}
        onConfirmLabel='Reset Progress'
        onClose={() => setResetModalVisible(false)}
        description='This will permanently delete your quiz progress and review history.'
      />
    </View>
  );
}