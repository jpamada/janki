import { Pressable, ScrollView, Text, View } from 'react-native';
import { Lightbulb, NotepadText } from 'lucide-react-native';
import Header from '@/components/shared/Header';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <View className='flex-1 bg-white'>
      <Header title="Home" />

      <ScrollView 
        overScrollMode="always"
        className="flex-1 px-6 py-4"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-gray-400 text-sm font-semibold mb-2">
          All Features
        </Text>

        <View className='flex justify-between gap-4'>
          <Pressable onPress={() => router.push(`/notes`)}>
            <View className='flex flex-row items-center gap-4 p-4 bg-gray-50 rounded-lg'>
              <View className='bg-white rounded-xl p-4'>
                <NotepadText color="#9ca3af" />
              </View>
              <View>
                <Text className='text-gray-600 font-bold'>Notes</Text>
                <Text className='text-gray-400'>Create new notes to remember</Text>
              </View>
            </View>
          </Pressable>

          <Pressable onPress={() => router.push(`/subjects`)}>
            <View className='flex flex-row items-center gap-4 p-4 bg-gray-50 rounded-lg'>
              <View className='bg-white rounded-xl p-4'>
                <Lightbulb color="#9ca3af" />
              </View>
              <View>
                <Text className='text-gray-600 font-bold'>Quiz</Text>
                <Text className='text-gray-400'>Test and prove your skills</Text>
              </View>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
