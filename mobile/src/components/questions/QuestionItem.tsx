import { router } from "expo-router";
import { Text } from "react-native";

import DebouncedPressable from "../shared/DebouncedPressable";
import * as Haptics from "expo-haptics";

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
  
  return (
    <DebouncedPressable
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
      <Text className="text-gray-600 text-xl font-semibold">
        {question}
      </Text>
    </DebouncedPressable>
  );
}