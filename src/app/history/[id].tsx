import { atomOneDark, atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { ActivityIndicator, Image, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getHistoryById } from "@/repositories/history.repository";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useColorScheme } from "nativewind";
import { lazy, Suspense } from "react";

import EmptyList from "@/components/shared/EmptyList";
import Header from "@/components/shared/Header";

const CodeHighlighter = lazy(
  () => import("react-native-code-highlighter"),
);

export default function HistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colorScheme } = useColorScheme();

  const insets = useSafeAreaInsets();

  const { data: history, isLoading, error } = useQuery({
    queryKey: ["history", id],
    queryFn: () => getHistoryById(id),
    enabled: !!id,
  });

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900">
      <Header title="History" back />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#4b5563" />
        </View>

      ) : error ? (
        <View className="flex-1 items-center justify-center">
          <Text>Failed to load history</Text>
        </View>

      ) : history ? (
        <View 
          className="flex-1"
          style={{ paddingBottom: insets.bottom }}
        >
          <View>
            <Text className="px-4 text-lg font-semibold text-gray-400">
              Question
            </Text>

            <Text className="px-4 py-2 text-xl font-semibold dark:text-neutral-300">
              {history.question.question}
            </Text>
          </View>

          {history.question.image && (
            <View className='w-auto bg-white dark:bg-neutral-900 pb-8'>
              <Image
                source={{ uri: history?.question?.image }}
                className="h-72 w-full rounded-xl mt-4 px-4"
                resizeMode="contain"
              />
            </View>
          )}

          {history.question.code && (
            <View className="bg-white w-auto dark:bg-neutral-900">
              <Suspense fallback={
                <View className="rounded-xl bg-white dark:bg-neutral-800" />
              }>
                <CodeHighlighter
                  hljsStyle={colorScheme === "light" ? atomOneLight : atomOneDark }
                  language={history.question.language ?? "text"}
                  scrollViewProps={{
                    contentContainerStyle: {
                      flexGrow: 1,
                      padding: 16,
                      paddingBottom: 64
                    },
                  }}
                  textStyle={{
                    fontSize: 14,
                    fontFamily: "monospace",
                  }}
                >
                  {history.question.code}
                </CodeHighlighter>
              </Suspense>
            </View>
          )}

          <View className="gap-2 p-4">
            <Text className="text-lg font-semibold text-gray-400">
              Your Answer
            </Text>

            <Text className="text-lg font-semibold text-gray-800 dark:text-neutral-300">
              {history.answer || "No answer"}
            </Text>
          </View>
        </View>

      ) : (<EmptyList message="No history found" />)}
    </View>
  );
}