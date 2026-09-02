import { Pressable } from "react-native";
import { Text } from "react-native";
import { router } from "expo-router";

import * as Haptics from "expo-haptics";

type QuestionItem = {
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
}: QuestionItem) {
  
  return (
    <Pressable
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onLongPress(id);
      }}
      onPress={() => {
        router.push({
          pathname: `/subjects/lessons/questions/[id]`,
          params: { id: id, lessonId: lessonId }
        });
      }}
      className="bg-gray-50 rounded-lg p-4 active:bg-gray-100"
    >
      <Text className="text-gray-600 text-xl font-semibold">
        {question}
      </Text>
    </Pressable>
  );
}