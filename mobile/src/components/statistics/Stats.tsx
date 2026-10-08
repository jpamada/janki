import { ChevronRight } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { router } from 'expo-router';

import DebouncedPressable from '../shared/pressables/DebouncedPressable';

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
        <Text className='text-gray-600 text-lg font-bold dark:text-neutral-300'>
          Daily Progress
        </Text>

        <DebouncedPressable
          onPress={() => router.push("/statistics")}
          className='
            flex flex-row items-center gap-1 
            py-2 px-2 rounded-xl 
            active:bg-gray-50 dark:active:bg-neutral-800
          '
        >
          <Text className='text-gray-400 font-semibold dark:text-neutral-300'>
            Show More
          </Text>
          
          <ChevronRight 
            size={16} 
            color="#9ca3af" 
          />
        </DebouncedPressable>
      </View>

      <View className="flex-row gap-2">
        <View className="flex-1 items-center gap-1 p-4 bg-gray-50 rounded-xl dark:bg-neutral-800">
          <Text className="text-gray-800 text-xl font-bold dark:text-neutral-300">
            {correctReviews}
          </Text>

          <Text className="text-xs text-center text-gray-500 dark:text-neutral-400">
            Correct{"\n"} Reviews
          </Text>
        </View>

        <View className="flex-1 items-center gap-1 p-4 bg-gray-50 rounded-xl dark:bg-neutral-800">
          <Text className="text-gray-800 text-xl font-bold dark:text-neutral-300">
            {totalReviews}
          </Text>

          <Text className="text-gray-500 text-xs text-center dark:text-neutral-400">
            Total{"\n"} Reviews
          </Text>
        </View>

        <View className="flex-1 items-center gap-1 p-4 bg-gray-50 rounded-xl dark:bg-neutral-800">
          <Text className="text-gray-800 text-xl font-bold dark:text-neutral-300">
            {accuracy}%
          </Text>

          <Text className="text-gray-500 text-xs text-center dark:text-neutral-400">
            Review{"\n"} Accuracy
          </Text>
        </View>
      </View>
    </View>
  );
}