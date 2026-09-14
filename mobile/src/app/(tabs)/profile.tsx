import { LayoutGrid, CloudUpload, CloudDownload } from 'lucide-react-native';
import { View, ScrollView, Pressable, Text } from 'react-native';
import { useSnackbar } from '@/providers/SnackbarContext';
import { useQueryClient } from '@tanstack/react-query';
import { exportData, importData } from '@/db/backup';
import { router } from 'expo-router';

import Header from '../../components/shared/Header';

export default function ProfileScreen() {
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

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

  return (
    <View className="flex-1 bg-white">
      <Header title="Profile" />

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
        </View>
      </ScrollView>
    </View>
  );
}