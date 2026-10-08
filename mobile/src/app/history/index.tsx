import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getHistory } from "@/repositories/history.repository";
import { useInfiniteQuery } from "@tanstack/react-query";
import { RotateCcwClock } from "lucide-react-native";
import { useMemo } from "react";

import HistoryItem from "@/components/history/HistoryItem";
import Header from "@/components/shared/Header";

const PAGE_SIZE = 20;

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();

  const {
    data,
    error,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    
  } = useInfiniteQuery({
    queryKey: ["history"],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getHistory(PAGE_SIZE, pageParam),
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return lastPageParam + PAGE_SIZE;
    },
  });
  
  const historyItems = useMemo(() => 
    data?.pages.flat() ?? [], [data],
  );

  return (
    <View
      className="flex-1 bg-white dark:bg-neutral-900"
      style={{ paddingBottom: insets.bottom }}
    >
      <Header title="Quiz History" back={true} />

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="small" color="#4b5563" />
        </View>

      ) : error ? (
        <View className="flex-1 justify-center items-center">
          <Text>Failed to load history</Text>
        </View>

      ) : (
        <FlatList
          className='p-4'
          data={historyItems}
          onEndReachedThreshold={0.5}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: insets.bottom
          }}
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
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-16">
              <RotateCcwClock size={32} color="#d1d5db" />
              <Text className='text-gray-300 font-semibold'>
                No history yet
              </Text>
            </View>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-4">
                <ActivityIndicator size="small" color="#4b5563" />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}