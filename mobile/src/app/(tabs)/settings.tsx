import { LayoutGrid, CloudUpload, CloudDownload, Trash2, Palette, Star } from 'lucide-react-native';
import { View, ScrollView, Pressable, Text, Modal, Image } from 'react-native';
import { deleteProgress } from '@/repositories/progress.repository';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { exportData, importData } from '@/db/backup';
import { router } from 'expo-router';
import { useState } from 'react';

import DebouncedPressable from '@/components/shared/DebouncedPressable';
import Icon from "../../../assets/images/icon-transparent.png"
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
        queryKey: ["subjects"],
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
      console.error(error);
    },
  });

  const handleBackup = async () => {
    try {
      await exportData();

    } catch (error) {
      console.error(error);
      showSnackbar({ message: "There is an error trying to backup data" });
    }
  };

  const handleRestore = async () => {
    try {
      const result = await importData();
      if (result.imported) {
        await queryClient.invalidateQueries();
        showSnackbar({ message: "Data restored sucessfully" });
      }

    } catch (error) {
      console.error(error);
      showSnackbar({ message: "There is an error restoring backup" });
    }
  };

  const handleDeleteProgress = () => {
    deleteProgressMutation.mutate();
  };

  return (
    <View className="flex-1 bg-white">
      <Header title="Settings" />

      <ScrollView
        className="flex-1 px-6 py-4"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-8"
      >
        <View className="flex flex-col">
          <Text className="text-gray-400 text-sm font-semibold mb-2">
            Interface
          </Text>

          <Pressable
            onPress={() => router.push(`/settings/appearance`)}
            className='flex flex-row items-center gap-4 p-4 bg-gray-50 rounded-lg mb-4 active:bg-gray-100'
          >
            <View className='bg-white rounded-xl p-4'>
              <Palette color="#9ca3af" />
            </View>
            <Text className='text-gray-600 text-lg font-bold'>User Interface</Text>
          </Pressable>

          <Text className="text-gray-400 text-sm font-semibold mb-2">
            Filter
          </Text>

          <DebouncedPressable
            onPress={() => router.push(`/settings/categories`)}
            className='flex flex-row items-center gap-4 p-4 bg-gray-50 rounded-lg mb-4 active:bg-gray-100'
          >
            <View className='bg-white rounded-xl p-4'>
              <LayoutGrid color="#9ca3af" />
            </View>

            <Text className='text-gray-600 text-lg font-bold'>
              Categories
            </Text>
          </DebouncedPressable>

          <DebouncedPressable
            onPress={() => router.push(`/settings/favorites`)}
            className='flex flex-row items-center gap-4 p-4 bg-gray-50 rounded-lg mb-4 active:bg-gray-100'
          >
            <View className='bg-white rounded-xl p-4'>
              <Star color="#9ca3af" />
            </View>

            <Text className='text-gray-600 text-lg font-bold'>
              Favorites
            </Text>
          </DebouncedPressable>

          <Text className="text-gray-400 text-sm font-semibold mb-2">
            Data
          </Text>

          <Pressable
            onPress={handleBackup}
            className='flex flex-row items-center gap-4 p-4 bg-gray-50 rounded-lg mb-2 active:bg-gray-100'
          >
            <View className='bg-white rounded-xl p-4'>
              <CloudUpload color="#9ca3af" />
            </View>
            <Text className='text-gray-600 text-lg font-bold'>Backup</Text>
          </Pressable>

          <Pressable
            onPress={handleRestore}
            className='flex flex-row items-center gap-4 p-4 bg-gray-50 rounded-lg mb-2 active:bg-gray-100'
          >
            <View className='bg-white rounded-xl p-4'>
              <CloudDownload color="#9ca3af" />
            </View>
            <Text className='text-gray-600 text-lg font-bold'>Restore</Text>
          </Pressable>

          <Pressable
            onPress={() => setResetModalVisible(true)}
            className='flex flex-row items-center gap-4 p-4 bg-gray-50 rounded-lg mb-2 active:bg-gray-100'
          >
            <View className='bg-white rounded-xl p-4'>
              <Trash2 color="#9ca3af" />
            </View>
            <Text className='text-gray-600 text-lg font-bold'>Delete Progress</Text>
          </Pressable>

          <View className="flex flex-col items-center rounded-3xl p-4">
            <View className="flex flex-row items-center">
              <Image
                source={Icon}
                className="h-8 w-8"
                resizeMode="contain"
              />
              <Text className="text-lg font-bold">Janki</Text>
            </View>

            <Text className="text-gray-400 font-semibold">
              version 1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={resetModalVisible}
        onRequestClose={() => setResetModalVisible(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/40"
          onPress={() => setResetModalVisible(false)}
        >
          <Pressable
            className="w-[90%] rounded-2xl bg-white p-6"
            onPress={(event) => event.stopPropagation()}
          >
            <View className="self-center w-32 h-32 items-center justify-center rounded-full bg-gray-100 mb-4">
              <Trash2 size={72} color="#ef4444" />
            </View>

            <Text className="text-xl font-bold text-center">
              Reset Progress
            </Text>

            <Text className="mt-2 text-center text-gray-500">
              This will permanently delete your quiz progress and review history.
            </Text>

            <View className="mt-6 gap-2">
              <Pressable
                onPress={handleDeleteProgress}
                className="rounded-full bg-red-500 px-6 py-4 active:bg-red-400"
              >
                <Text className="text-center font-semibold text-white">
                  Confirm Reset
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setResetModalVisible(false)}
                className="rounded-full px-6 py-4 active:bg-gray-100"
              >
                <Text className="text-center font-semibold text-gray-600">
                  Cancel
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}