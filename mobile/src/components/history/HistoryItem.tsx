import { CheckCircle2, CircleX } from "lucide-react-native";
import { View, Text } from "react-native";
import { format } from "date-fns";

import DebouncedPressable from "../shared/DebouncedPressable";

type HistoryItemProps = {
  id: string;
  questionId: string;
  responseTime: number | null;
  attemptedAt: Date;
  status: "correct" | "incorrect";
};

export default function HistoryItem({
  id,
  questionId,
  responseTime,
  attemptedAt,
  status,
}: HistoryItemProps) {
  return (
    <DebouncedPressable
      className="flex-row items-center gap-3 rounded-xl bg-gray-50 px-4 py-4 active:bg-gray-100"
    >
      <View
        className=""
      >
        {status === "correct" ? (
          <CheckCircle2 size={20} color="#9ca3af" />
        ) : (
          <CircleX size={20} color="#9ca3af" />
        )}
      </View>

      <View className="min-w-0 flex-1">
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-400">
            {status === "correct" ? "Correct" : "Incorrect"}
          </Text>

          <View className="flex flex-col items-end">
            <Text className="text-sm text-gray-400">
              {format(attemptedAt, "MMMM d yyyy")}
            </Text>

            <Text className="text-sm text-gray-400">
              {format(attemptedAt, "h:mm a")}
            </Text>
          </View> 
        </View>
      </View>
    </DebouncedPressable>
  );
}