import { Pressable, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';

type LogsStatsProps = {
  accuracy: number;
  totalReviews: number;
  correctReviews: number;
};

export default function Stats({
  accuracy,
  totalReviews,
  correctReviews,
}: LogsStatsProps) {
  return (
    <View className="gap-2 rounded-xl">
      <View className='flex flex-row items-center justify-between'>
        <Text className='text-gray-600 text-lg font-bold'>Daily Progress</Text>
        <Pressable
          onPress={() => router.push("/statistics-details")}
          className='flex flex-row items-center gap-1 py-2 px-2 rounded-xl active:bg-gray-50'
        >
          <Text className='text-gray-400 font-semibold'>
            Show More
          </Text>
          <ChevronRight size={16} color="#9ca3af" />
        </Pressable>
      </View>

      <View className="flex-row gap-2">
        <View className="flex-1 items-center gap-1 p-4 bg-gray-50 rounded-xl">
          <Text className="text-xl font-bold text-gray-800">{correctReviews}</Text>
          <Text className="text-xs text-center text-gray-500">Correct{"\n"} Reviews</Text>
        </View>

        <View className="flex-1 items-center gap-1 p-4 bg-gray-50 rounded-xl">
          <Text className="text-xl font-bold text-gray-800">{totalReviews}</Text>
          <Text className="text-xs text-center text-gray-500">Total{"\n"} Reviews</Text>
        </View>

        <View className="flex-1 items-center gap-1 p-4 bg-gray-50 rounded-xl">
          <Text className="text-xl font-bold text-gray-800">{accuracy}%</Text>
          <Text className="text-xs text-center text-gray-500">Review{"\n"} Accuracy</Text>
        </View>
      </View>
    </View>
  );
}