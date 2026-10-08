import { useSfx } from "@/contexts/SfxContext";
import { router } from "expo-router";
import { Text } from "react-native";

import DebouncedPressable from "../shared/pressables/DebouncedPressable";

type QuestionItemProps = {
  id: string;
  lessonId: string;
  question: string;
  onLongPress: (id: string) => void;
};

export default function QuestionItem({
  id,
  lessonId,
  question,
  onLongPress
}: QuestionItemProps) {
  const { hapticVibration } = useSfx();

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
        rounded-lg p-4
        bg-gray-50 active:bg-gray-100
        dark:bg-neutral-800 dark:active:bg-neutral-700
      "
    >
      <Text className="
        text-gray-600 text-xl font-semibold line-clamp-2 
        dark:text-neutral-300
      ">
        {question}
      </Text>
    </DebouncedPressable>
  );
}