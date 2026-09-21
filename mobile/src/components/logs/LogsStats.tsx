import { type ReviewStats } from '@/helpers/logsStats.helper';
import { Text, View } from 'react-native';

export default function LogsStats({
  currentStreak,
  longestStreak,
  dailyAverage,
}: ReviewStats) {
  return (
    <View className="flex-row justify-around gap-2">
      <View className="flex-1 items-center gap-1 p-4 bg-gray-50 rounded-xl">
        <Text className="text-xl font-bold text-gray-800">{currentStreak}</Text>
        <Text className="text-xs text-gray-500">Current streak</Text>
      </View>

      <View className="flex-1 items-center gap-1 p-4 bg-gray-50 rounded-xl">
        <Text className="text-xl font-bold text-gray-800">{longestStreak}</Text>
        <Text className="text-xs text-gray-500">Longest streak</Text>
      </View>

      <View className="flex-1 items-center gap-1 p-4 bg-gray-50 rounded-xl">
        <Text className="text-xl font-bold text-gray-800">{dailyAverage.toFixed(1)}</Text>
        <Text className="text-xs text-gray-500">Daily average</Text>
      </View>
    </View>
  );
}