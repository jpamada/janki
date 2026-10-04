import { ActivityIndicator, Pressable, Text, View, FlatList, LayoutChangeEvent } from 'react-native';
import { getDailyStatistics, getHeatmapData } from '@/repositories/statistics.repository';
import { getLatestHistory } from '@/repositories/history.repository';
import { ChevronRight, RotateCcwClock } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';

import HistoryItem from '@/components/history/HistoryItem';
import Heatmap from '@/components/statistics/Heatmap';
import Stats from '@/components/statistics/Stats';
import Header from '@/components/shared/Header';
import { useTodayKey } from '@/hooks/useTodayKey';
import { useCallback, useMemo, useState } from 'react';
import { endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from 'date-fns';

export default function StatisticsScreen() {
  const insets = useSafeAreaInsets();
  const todayKey = useTodayKey();

  const [viewDate, setViewDate] = useState(() => new Date());
  const [containerWidth, setContainerWidth] = useState(0);

  const monthStart = useMemo(() => startOfMonth(viewDate), [viewDate]);
  const monthEnd = useMemo(() => endOfMonth(viewDate), [viewDate]);

  const gridStart = useMemo(() => startOfWeek(monthStart), [monthStart]);
  const gridEnd = useMemo(() => endOfWeek(monthEnd), [monthEnd]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);

  const { data: statistic, isPending: statsPending } = useQuery({
    queryKey: ["dailyStatistics", todayKey],
    queryFn: getDailyStatistics,
  });

  const { data: heatmapData = [], isPending } = useQuery({
    queryKey: ['heatmap', todayKey, format(monthStart, 'yyyy-MM')],
    queryFn: () => getHeatmapData(gridStart, gridEnd),
    placeholderData: keepPreviousData,
  });

  const { data: history, isPending: historyPending } = useQuery({
    queryKey: ['latestHistory'],
    queryFn: getLatestHistory
  })

  return (
    <View 
      className='flex-1 bg-white'
    >
      <Header title="Stats" />

      {historyPending || statsPending ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="small" color="#4b5563" />
        </View>

      ) : (
        <View className="flex-1">
          <FlatList
            data={history}
            className='px-6 py-4'
            keyExtractor={(item) => item.id}
            contentContainerClassName="gap-2"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: insets.bottom
            }}
            ListHeaderComponent={
              <>
                <View className='flex flex-col gap-8'>
                  <Stats
                    accuracy={statistic?.accuracy ?? 0}
                    totalReviews={statistic?.totalReviews ?? 0}
                    correctReviews={statistic?.correctReviews ?? 0}
                  />
                  
                  <Heatmap
                      rows={heatmapData}
                      isPending={isPending}
                      viewDate={viewDate}
                      gridStart={gridStart}
                      gridEnd={gridEnd}
                      monthStart={monthStart}
                      onLayout={handleLayout}
                      onViewDateChange={setViewDate}
                      containerWidth={containerWidth}
                    />
                </View>

                <View className='flex flex-row items-center justify-between mt-8'>
                  <Text className='text-gray-600 text-lg font-bold'>History</Text>
                  <Pressable
                    onPress={() => {
                      router.push("/history")
                    }}
                    className='flex flex-row items-center gap-1 py-2 px-2 rounded-xl active:bg-gray-50'
                  >
                    <Text className='text-gray-400 font-semibold'>
                      Show More
                    </Text>
                    <ChevronRight size={16} color="#9ca3af" />
                  </Pressable>
                </View>
              </>
            }
            renderItem={({ item }) => (
              <HistoryItem
                id={item.id}
                questionId={item.questionId}
                responseTime={item.responseTime}
                attemptedAt={item.attemptedAt}
                status={item.status}
              />
            )}
            ListEmptyComponent={
              <View className='flex-1 justify-center items-center bg-gray-50 rounded-xl py-6'>
                <RotateCcwClock size={32} color="#d1d5db" />
                <Text className='text-gray-300 font-semibold'>
                  No history yet
                </Text>
              </View>
            }
          />
        </View>
      )}
    </View>
  );
}
