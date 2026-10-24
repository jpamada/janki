import { getDailyStatistics, getHeatmapData } from '@/repositories/statistics.repository';
import { Text, View, FlatList, LayoutChangeEvent, ActivityIndicator } from 'react-native';
import { endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from 'date-fns';
import { getLatestHistory } from '@/repositories/history.repository';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react-native';
import { useTodayKey } from '@/hooks/useTodayKey';
import { router } from 'expo-router';

import DebouncedPressable from '@/components/shared/pressables/DebouncedPressable';
import HistoryItem from '@/components/history/HistoryItem';
import Heatmap from '@/components/statistics/Heatmap';
import EmptyList from '@/components/shared/EmptyList';
import Stats from '@/components/statistics/Stats';
import Header from '@/components/shared/Header';

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

  const { data: statistic, isPending: dailyStatsPending } = useQuery({
    queryKey: ["dailyStatistics", todayKey],
    queryFn: getDailyStatistics,
  });

  const { data: heatmapData = [], isPending: heatmapPending } = useQuery({
    queryKey: ['heatmap', todayKey, format(monthStart, 'yyyy-MM')],
    queryFn: () => getHeatmapData(gridStart, gridEnd),
    placeholderData: keepPreviousData,
  });

  const { data: history, isPending: historyPending } = useQuery({
    queryKey: ['latestHistory'],
    queryFn: getLatestHistory
  })
  
  return (
    <View className='flex-1 bg-white dark:bg-neutral-900'>
      <Header title="Stats" />

      {dailyStatsPending || heatmapPending || historyPending ? (
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
                    isPending={heatmapPending}
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
                  <Text className='text-gray-600 text-lg font-bold dark:text-neutral-300'>
                    History
                  </Text>

                  <DebouncedPressable
                    onPress={() => router.push("/history")}
                    className='
                      flex flex-row items-center gap-1 
                      py-2 px-2 rounded-xl active:bg-gray-50 dark:active:bg-neutral-800
                    '
                  >
                    <Text className='text-gray-400 font-semibold dark:text-neutral-300'>
                      Show More
                    </Text>
                    <ChevronRight size={16} color="#9ca3af" />
                  </DebouncedPressable>
                </View>
              </>
            }
            renderItem={({ item }) => (
              <HistoryItem
                id={item.id}
                status={item.status}
                questionId={item.questionId}
                attemptedAt={item.attemptedAt}
                responseTime={item.responseTime}
                question={item.question.question}
              />
            )}
            ListEmptyComponent={
              <EmptyList message='No history yet' />
            }
          />
        </View>
      )}
    </View>
  );
}
