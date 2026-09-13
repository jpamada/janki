import { LayoutGrid, CloudUpload, CloudDownload } from 'lucide-react-native';
import { View, ScrollView, Pressable, Text } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { exportData, importData } from '@/db/backup';
import { router } from 'expo-router';

import Header from '../../components/shared/Header';
import Toast from 'react-native-toast-message';

export default function ProfileScreen() {
  const queryClient = useQueryClient();

  const handleBackup = async () => {
    try {
      await exportData();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Backup failed', text2: (error as Error).message });
    }
  };

  const handleRestore = async () => {
    try {
      const result = await importData();
      if (result.imported) {
        await queryClient.invalidateQueries();
        Toast.show({ type: 'success', text1: 'Restore complete' });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Restore failed', text2: (error as Error).message });
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