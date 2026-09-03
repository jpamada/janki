import { CloudDownload, CloudUpload, LayoutGrid } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";

import Header from "@/components/shared/Header";
import { exportData, importData } from "@/db/backup";
import { useQueryClient } from "@tanstack/react-query";

export default function ProfileScreen() {
  const queryClient = useQueryClient();

  const handleBackup = async () => {
    try {
      await exportData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRestore = async () => {
    try {
      const result = await importData();
      if (result.imported) {
        await queryClient.invalidateQueries();
      }
    } catch (error) {
      console.error(error);
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

          <Pressable onPress={handleBackup}>
            <View className='flex flex-row items-center gap-4 p-4 bg-gray-50 rounded-lg'>
              <View className='bg-white rounded-xl p-4'>
                <CloudUpload color="#9ca3af" />
              </View>
              <Text className='text-gray-600 text-lg font-bold'>Backup</Text>
            </View>
          </Pressable>

          <Pressable onPress={handleRestore}>
            <View className='flex flex-row items-center gap-4 p-4 bg-gray-50 rounded-lg'>
              <View className='bg-white rounded-xl p-4'>
                <CloudDownload color="#9ca3af" />
              </View>
              <Text className='text-gray-600 text-lg font-bold'>Restore</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  )
}