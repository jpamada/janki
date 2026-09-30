import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { getStatistics } from "@/repositories/statistics.repository";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";

import Header from "@/components/shared/Header";

export default function BrowseStatistics() {
  const insets = useSafeAreaInsets();

  const { data: statistic, isPending } = useQuery({
    queryKey: ["statistics"],
    queryFn: getStatistics,
  })

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingBottom: insets.bottom }}
    >
      <Header title="Statistics" back={true} />

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{
          paddingBottom: insets.bottom,
        }}
      >
        {isPending ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="small" color="#4b5563" />
          </View>

        ) : (
          <View className="gap-2 rounded-xl">
            <View className="flex flex-row items-center justify-between">
              <Text className="text-gray-600 text-lg font-bold">
                Overall Progress
              </Text>
            </View>

            <View className="flex-row gap-2 bg-gray-50 rounded-xl">
              <View className="flex-1 items-center gap-1 p-4 bg-gray-50 rounded-xl">
                <Text className="text-xs text-center text-gray-500">
                  Correct {"\n"}Reviews
                </Text>
                <Text className="text-xl font-bold text-gray-800">
                  {statistic?.correctReviews}
                </Text>
              </View>

              <View className="flex-1 items-center gap-1 p-4 bg-gray-50 rounded-xl">
                <Text className="text-xs text-center text-gray-500">
                  Incorrect {"\n"}Reviews
                </Text>
                <Text className="text-xl font-bold text-gray-800">
                  {statistic?.incorrectReviews}
                </Text>
              </View>

              <View className="flex-1 items-center gap-1 p-4 bg-gray-50 rounded-xl">
                <Text className="text-xs text-center text-gray-500">
                  Total {"\n"}Reviews
                </Text>
                <Text className="text-xl font-bold text-gray-800">
                  {statistic?.totalReviews}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}