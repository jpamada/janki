import { Pressable } from "react-native";
import { Text } from "react-native";
import { router } from "expo-router";

import * as Haptics from "expo-haptics";

type QuestionItem = {
  id: string;
  question: string;
  onLongPress: (id: string) => void;
};

export default function QuestionItem({
  id,
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
        router.push(`/subjects/lessons/questions/${id}`);
      }}
      className="bg-gray-50 rounded-lg p-4"
    >
      <Text className="text-gray-600 text-xl font-bold">
        {question}
      </Text>
    </Pressable>
  );
}