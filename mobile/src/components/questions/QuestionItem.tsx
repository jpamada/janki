import { useSfx } from "@/contexts/SfxContext";
import { router } from "expo-router";
import { Text } from "react-native";

import DebouncedPressable from "../shared/DebouncedPressable";

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
      className="bg-gray-50 rounded-lg p-4 active:bg-gray-100"
    >
      <Text className="text-gray-600 text-xl font-semibold line-clamp-2">
        {question}
      </Text>
    </DebouncedPressable>
  );
}