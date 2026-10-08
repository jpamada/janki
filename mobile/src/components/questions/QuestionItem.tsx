import { useSfx } from "@/contexts/SfxContext";
import { router } from "expo-router";
import { Text } from "react-native";

import DebouncedPressable from "../shared/pressables/DebouncedPressable";

type QuestionItemProps = {
  id: string;
  lessonId: string;
  question: string;
  type: "multiple_choice" | "identification";
  onLongPress: (id: string) => void;
};

export default function QuestionItem({
  id,
  type,
  lessonId,
  question,
  onLongPress
}: QuestionItemProps) {
  const { hapticVibration } = useSfx();
  
  const formattedType = type
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <DebouncedPressable
      onLongPress={() => {
        hapticVibration();
        onLongPress(id);
      }}
      onPress={() => {
        router.push({
          pathname: `/questions/[id]`,
          params: { id: id, lessonId: lessonId }
        });
      }}
      className="
        flex-col gap-1
        bg-gray-100 rounded-lg p-4
        active:bg-gray-100 dark:bg-neutral-800 dark:active:bg-neutral-700
      "
    >
      <Text className="text-xs text-gray-400">
        {formattedType}
      </Text>

      <Text className="text-gray-900 line-clamp-2 dark:text-neutral-300">
        {question}
      </Text>
    </DebouncedPressable>
  );
}