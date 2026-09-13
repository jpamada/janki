import { getReviewActivityDays, computeReviewStats } from '@/repositories/logs.repository';
import { useQuery } from '@tanstack/react-query';
import { View, Text } from 'react-native';

export default function ReviewStats() {
  const { data: rows = [] } = useQuery({
    queryKey: ['reviewStats'],
    queryFn: getReviewActivityDays,
  });

  const stats = computeReviewStats(rows);

  return (
    <View className="flex-row justify-around gap-2">
      <View className="flex-1 items-center gap-1 p-4 bg-gray-50 rounded-xl">
        <Text className="text-xl font-bold text-gray-800">{stats.currentStreak}</Text>
        <Text className="text-xs text-gray-500">Current streak</Text>
      </View>

      <View className="flex-1 items-center gap-1 p-4 bg-gray-50 rounded-xl">
        <Text className="text-xl font-bold text-gray-800">{stats.longestStreak}</Text>
        <Text className="text-xs text-gray-500">Longest streak</Text>
      </View>

      <View className="flex-1 items-center gap-1 p-4 bg-gray-50 rounded-xl">
        <Text className="text-xl font-bold text-gray-800">{stats.dailyAverage.toFixed(1)}</Text>
        <Text className="text-xs text-gray-500">Daily average</Text>
      </View>
    </View>
  );
}