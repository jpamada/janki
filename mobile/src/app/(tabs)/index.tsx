import { router } from 'expo-router';
import { Lightbulb, NotepadText } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className='flex-1 bg-gray-50'>
      <ScrollView 
        className="flex-1 p-4"
        overScrollMode="always"
        showsVerticalScrollIndicator={false}
      >
        <View className='flex justify-between gap-4'>
          <Pressable onPress={() => router.push(`/notes`)}>
            <View className='flex flex-col justify-center items-center p-6 bg-white rounded-lg'>
              <NotepadText color="#9ca3af" />
              <Text className='text-gray-400'>Notes</Text>
            </View>
          </Pressable>

          <Pressable onPress={() => router.push(`/subjects`)}>
            <View className='flex flex-col justify-center items-center p-6 bg-white rounded-lg'>
              <Lightbulb color="#9ca3af" />
              <Text className='text-gray-400'>Quiz</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
