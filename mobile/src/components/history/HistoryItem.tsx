import { CheckCircle2, CircleX } from "lucide-react-native";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { format } from "date-fns";

import DebouncedPressable from "../shared/pressables/DebouncedPressable";

type HistoryItemProps = {
  id: string;
  questionId: string;
  question: string;
  responseTime: number | null;
  attemptedAt: Date;
  status: "correct" | "incorrect";
};

export default function HistoryItem({
  id,
  question,
  questionId,
  responseTime,
  attemptedAt,
  status,
}: HistoryItemProps) {
  return (
    <DebouncedPressable
      onPress={() => router.push({
        pathname: `/history/[id]`,
        params: { id: id }
      })}
      className="
        flex-row items-center gap-2
        bg-gray-100 rounded-lg p-4
        active:bg-gray-100 dark:bg-neutral-800 dark:active:bg-neutral-700
      "
    >
      <View>
        {status === "correct" ? (
          <CheckCircle2 size={20} color="#9ca3af" />
        ) : (
          <CircleX size={20} color="#9ca3af" />
        )}
      </View>

      <View className="min-w-0 flex-1">
        <View className="flex flex-col">
          <View className="flex flex-row items-end gap-1">
            <Text className="text-xs text-gray-400">
              {format(attemptedAt, "MMMM d yyyy")}
            </Text>

            <Text className="text-xs text-gray-400">
              {format(attemptedAt, "h:mm a")}
            </Text>
          </View> 

          <Text className="text-gray-400 line-clamp-2 dark:text-neutral-300">
            {question}
          </Text>
        </View>
      </View>
    </DebouncedPressable>
  );
}