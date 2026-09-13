import { Pressable } from "react-native";
import { Text } from "react-native";
import { router } from "expo-router";

import * as Haptics from "expo-haptics";

type LessonItem = {
  id: string;
  title: string;
  index: number;
  onLongPress: (id: string) => void;
};

export default function FavoriteItem({
  id,
  title,
  index,
  onLongPress
}: LessonItem) {

  return (
    <Pressable
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onLongPress(id);
      }}
      onPress={() => router.push({
        pathname: `/lessons/quiz/play`,
        params: { lessonId: id }
      })}
      className="flex flex-row items-center gap-2 bg-gray-50 rounded-lg p-4 active:bg-gray-100"
    >
      <Text className="text-gray-600 text-xl font-bold">
        {title}
      </Text>
    </Pressable>
  );
}