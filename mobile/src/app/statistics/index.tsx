import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { getDailyStatistics, getStatistics } from "@/repositories/statistics.repository";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";

import { BookCheck, BookText, BookX, Lightbulb } from "lucide-react-native";
import Header from "@/components/shared/Header";

export default function BrowseStatistics() {
  const insets = useSafeAreaInsets();

  const { data: statistic, isPending: statsPending } = useQuery({
    queryKey: ["statistics"],
    queryFn: getStatistics,
  })

  const { data: dailyStatistic, isPending: dailyStatsPending } = useQuery({
    queryKey: ["dailyStatistics"],
    queryFn: getDailyStatistics,
  });

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingBottom: insets.bottom }}
    >
      <Header title="Statistics" back={true} />

      <ScrollView
        className="flex-1 px-6 py-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom,
        }}
      >
        {statsPending || dailyStatsPending ? (
          <View className="justify-center items-center">
            <ActivityIndicator size="small" color="#4b5563" />
          </View>

        ) : (
          <View className="gap-2 rounded-xl">
            <Text className="text-gray-400 text-sm font-bold">
              Daily Progress
            </Text>

            <View className="flex-row border-2 border-gray-300 rounded-lg">
              <View className="justify-center items-center border-r-2 border-gray-300 w-[60%]">
                <Text className="text-xl text-gray-500">Accuracy</Text>
                <Text className="text-4xl font-bold text-gray-800">{dailyStatistic?.accuracy}%</Text>
              </View>

              <View className="flex-1 flex-col w-[40%]">
                <View className="px-4 py-2 rounded-xl border-b-2 border-gray-300">
                  <Text className="text-gray-500 text-lg">Correct</Text>
                  <Text className="text-gray-800 text-lg font-bold">{dailyStatistic?.correctReviews}</Text>
                </View>
                <View className="px-4 py-2 rounded-xl">
                  <Text className="text-gray-500 text-lg">Reviews</Text>
                  <Text className="text-gray-800 text-lg font-bold">{dailyStatistic?.totalReviews}</Text>
                </View>
              </View>
            </View>

            <Text className="text-gray-400 text-sm font-bold mt-4">
              Overall Progress
            </Text>

            <View className="flex-col gap-4">
              <View className="flex-row border-2 border-gray-300 rounded-xl">
                <View className="justify-center items-center border-r-2 border-gray-300 p-6">
                  <BookCheck size={32} color="#5e6470" />
                </View>
                <View className="flex-1 justify-center gap-1 px-4 py-2 rounded-xl">
                  <Text className="text-lg text-gray-500">
                    Overall Correct
                  </Text>
                  <Text className="text-xl font-bold text-gray-800">
                    {statistic?.correctReviews}
                  </Text>
                </View>
              </View>

              <View className="flex-row border-2 border-gray-300 rounded-xl">
                <View className="justify-center items-center border-r-2 border-gray-300 p-6">
                  <BookX size={32} color="#5e6470" />
                </View>
                <View className="flex-1 justify-center gap-1 px-4 py-2 rounded-xl">
                  <Text className="text-lg text-gray-500">
                    Overall Incorrect
                  </Text>
                  <Text className="text-xl font-bold text-gray-800">
                    {statistic?.incorrectReviews}
                  </Text>
                </View>
              </View>

              <View className="flex-row border-2 border-gray-300 rounded-xl">
                <View className="justify-center items-center border-r-2 border-gray-300 p-6">
                  <BookText size={32} color="#5e6470" />
                </View>
                <View className="flex-1 justify-center gap-1 px-4 py-2 rounded-xl">
                  <Text className="text-lg text-gray-500">
                    Overall Reviews
                  </Text>
                  <Text className="text-xl font-bold text-gray-800">
                    {statistic?.totalReviews}
                  </Text>
                </View>
              </View>
            </View>

            <Text className="text-gray-400 text-sm font-bold mt-4">
              Total Creation
            </Text>

            <View className="flex-row gap-2 border-2 border-gray-300 rounded-xl">
              <View className="flex-1 items-center gap-1 p-4 rounded-xl border-r-2 border-gray-300">
                <Text className="text-xl font-bold text-gray-800">
                  {statistic?.subjectCount}
                </Text>
                <Text className="text-sm text-center text-gray-500">
                  Subjects
                </Text>
              </View>

              <View className="flex-1 items-center gap-1 p-4 rounded-xl border-r-2 border-gray-300">
                <Text className="text-xl font-bold text-gray-800">
                  {statistic?.lessonCount}
                </Text>
                <Text className="text-sm text-center text-gray-500">
                  Lessons
                </Text>
              </View>

              <View className="flex-1 items-center gap-1 p-4 rounded-xl">
                <Text className="text-xl font-bold text-gray-800">
                  {statistic?.questionCount}
                </Text>
                <Text className="text-sm text-center text-gray-500">
                  Questions
                </Text>
              </View>
            </View>

            <Text className="text-gray-400 text-sm font-bold mt-4">
              Accuracy
            </Text>

            <View className="flex-col gap-6 border-2 border-gray-300 rounded-xl p-4">
              {((statistic?.subjectsAccuracy?.length ?? 0) > 0) ? (
                <>
                  {statistic?.subjectsAccuracy?.map((subject) => (
                    <View key={subject.subjectId} className="flex-row items-center justify-between">
                      <Text className="text-gray-600 font-semibold">{subject.subjectName}</Text>
                      <Text className="font-semibold">{subject.accuracy}%</Text>
                    </View>
                  ))}

                  <View className="flex-row items-center justify-between border-t-2 pt-2 border-gray-100">
                    <Text className="text-gray-600 font-semibold">Overall</Text>
                    <Text className="font-semibold">{statistic?.accuracy}%</Text>
                  </View>
                </>
              ) : (
                <View className='justify-center items-center py-12'>
                  <Lightbulb size={32} color="#d1d5db" />
                  <Text className='text-gray-300 font-semibold'>
                    No subjects yet
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}