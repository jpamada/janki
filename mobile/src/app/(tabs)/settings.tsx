import { LayoutGrid, CloudUpload, CloudDownload, Trash2 } from 'lucide-react-native';
import { View, ScrollView, Pressable, Text, Modal } from 'react-native';
import { useSnackbar } from '@/providers/SnackbarContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { exportData, importData } from '@/db/backup';
import { router } from 'expo-router';

import Header from '../../components/shared/Header';
import { useState } from 'react';
import { deleteProgress } from '@/repositories/progress.repository';

export default function SettingsScreen() {
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [resetModalVisible, setResetModalVisible] = useState(false);

  const deleteProgressMutation = useMutation({
    mutationFn: deleteProgress,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["reviewHeatmap"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["logsStats"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["subjects"],
      });

      setResetModalVisible(false);

      showSnackbar({
        message: "Review data successfully reset",
      });
    },
    onError: (error) => {
      console.error(error);
      showSnackbar({
        message: "Something went wrong. Please try again.",
      });
    },
  });

  const handleBackup = async () => {
    try {
      await exportData();
      showSnackbar({ message: "Backup successful" });

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
        overScrollMode="always"
        className="flex-1 px-6 py-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex flex-col gap-4">
          <Pressable
            onPress={() => router.push(`/categories`)}
            className='flex flex-row items-center gap-4 p-4 bg-gray-50 rounded-lg active:bg-gray-100'
          >
            <View className='bg-white rounded-xl p-4'>
              <LayoutGrid color="#9ca3af" />
            </View>

            <Text className='text-gray-600 text-lg font-bold'>
              Categories
            </Text>
          </Pressable>

          <Pressable
            onPress={handleBackup}
            className='flex flex-row items-center gap-4 p-4 bg-gray-50 rounded-lg active:bg-gray-100'
          >
            <View className='bg-white rounded-xl p-4'>
              <CloudUpload color="#9ca3af" />
            </View>
            <Text className='text-gray-600 text-lg font-bold'>Backup</Text>
          </Pressable>

          <Pressable
            onPress={handleRestore}
            className='flex flex-row items-center gap-4 p-4 bg-gray-50 rounded-lg active:bg-gray-100'
          >
            <View className='bg-white rounded-xl p-4'>
              <CloudDownload color="#9ca3af" />
            </View>
            <Text className='text-gray-600 text-lg font-bold'>Restore</Text>
          </Pressable>

          <Pressable
            onPress={() => setResetModalVisible(true)}
            className='flex flex-row items-center gap-4 p-4 bg-gray-50 rounded-lg active:bg-gray-100'
          >
            <View className='bg-white rounded-xl p-4'>
              <Trash2 color="#9ca3af" />
            </View>
            <Text className='text-gray-600 text-lg font-bold'>Delete Progress</Text>
          </Pressable>
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