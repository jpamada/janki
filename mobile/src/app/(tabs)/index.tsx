import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Lightbulb, NotepadText } from 'lucide-react-native';
import { router } from 'expo-router';

import Header from '@/components/shared/Header';

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  
  return (
    <View 
      className='flex-1 bg-white'
      style={{ paddingBottom: insets.bottom }}
    >
      <Header title="Home" />

      <ScrollView 
        overScrollMode="always"
        className="flex-1 px-6 py-4"
        showsVerticalScrollIndicator={false}
      >
        <View className='flex justify-between gap-4'>
          <Text className="text-gray-400 text-sm font-semibold">
            Make a second brain
          </Text>

          <View className='flex flex-col gap-4 p-6 bg-gray-50 rounded-xl mb-4'>
            <View className='flex flex-row items-center gap-4'>
              <View className='bg-white rounded-xl p-4'>
                <NotepadText color="#9ca3af" />
              </View>
              <View className='flex flex-col'>
                <Text className='text-gray-600 text-xl font-semibold'>
                  Notes
                </Text>
                <Text className='text-gray-400'>
                  Don't forget what you know
                </Text>
              </View>
            </View>

            <Pressable 
              className='bg-gray-200 rounded-full p-4 active:bg-gray-100'
              onPress={() => router.push(`/(tabs)/notes`)}
            >
              <Text className='text-gray-500 text-center font-semibold'>
                Create new notes
              </Text>
            </Pressable>
          </View>

          <Text className="text-gray-400 text-sm font-semibold">
            Personalize your quiz
          </Text>

          <View className='flex flex-col gap-4 p-6 bg-gray-50 rounded-lg'>
            <View className='flex flex-row items-center gap-4'>
              <View className='bg-white rounded-xl p-4'>
                <Lightbulb color="#9ca3af" />
              </View>

              <View className='flex flex-col'>
                <Text className='text-gray-600 text-xl font-semibold'>
                  Quiz
                </Text>
                <Text className='text-gray-400'>
                  Test and prove your skills
                </Text>
              </View>
            </View>

            <Pressable 
              onPress={() => router.push(`/subjects`)}
              className='bg-gray-200 rounded-full p-4 active:bg-gray-100'
            >
              <Text className='text-gray-500 text-center font-semibold'>
                Create quizzes
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
