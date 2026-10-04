import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Image, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { lazy, Suspense } from "react";
import { SearchX } from "lucide-react-native";

import { getHistoryById } from "@/repositories/history.repository";
import Header from "@/components/shared/Header";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CodeHighlighter = lazy(
  () => import("react-native-code-highlighter"),
);

export default function HistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const insets = useSafeAreaInsets();

  const { data: history, isLoading, error } = useQuery({
    queryKey: ["history", id],
    queryFn: () => getHistoryById(id),
    enabled: !!id,
  });

  return (
    <View className="flex-1 bg-white">
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
          style={{
            paddingBottom: insets.bottom
          }}
        >
          <View className="flex-1">
            <View className="rounded-lg bg-white">
              <Text className="px-4 text-lg font-semibold text-gray-400">
                Question
              </Text>

              <Text className="px-4 py-2 text-xl font-semibold">
                {history.question.question}
              </Text>
            </View>

            {history.question.image && (
              <Image
                source={{ uri: history.question.image }}
                className="mt-4 h-72 w-full rounded-xl px-4"
                resizeMode="contain"
              />
            )}

            {history.question.code && (
              <View className="bg-white">
                <Suspense
                  fallback={
                    <View className="rounded-xl bg-white" />
                  }
                >
                  <CodeHighlighter
                    hljsStyle={atomOneLight}
                    language={history.question.language ?? "text"}
                    scrollViewProps={{
                      style: {
                        backgroundColor: "transparent",
                      },
                      contentContainerStyle: {
                        backgroundColor: "transparent",
                        padding: 16,
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

              <Text className="text-lg font-semibold text-gray-800">
                {history.answer || "No answer"}
              </Text>
            </View>
          </View>
        </View>

      ) : (
        <View className="flex-1 items-center justify-center">
          <SearchX size={64} color="#9ca3af" />

          <Text className="font-semibold text-gray-400">
            No history found
          </Text>
        </View>
      )}
    </View>
  );
}