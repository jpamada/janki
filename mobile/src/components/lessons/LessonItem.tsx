import { Star } from "lucide-react-native";
import { Pressable } from "react-native";
import { router } from "expo-router";
import { Text } from "react-native";

import * as Haptics from "expo-haptics";

type LessonItemProps = {
  id: string;
  title: string;
  index: number;
  favorite: boolean;
  onLongPress: (id: string) => void;
  onToggleFavorite: (id: string, favorite: boolean) => void;
};

export default function LessonItem({
  id,
  title,
  favorite,
  onLongPress,
  onToggleFavorite,
}: LessonItemProps) {
  return (
    <Pressable
      onLongPress={() => {
        Haptics.impactAsync(
          Haptics.ImpactFeedbackStyle.Light
        );

        onLongPress(id);
      }}
      onPress={() =>
        router.push({
          pathname: "/quiz/play",
          params: { lessonId: id },
        })
      }
      className="flex-row items-center justify-between gap-2 rounded-lg bg-gray-50 px-4 py-2 active:bg-gray-100"
    >
      <Text className="text-xl font-bold text-gray-600">
        {title}
      </Text>

      <Pressable
        onPress={(event) => {
          event.stopPropagation();
          onToggleFavorite(id, !favorite);
        }}
        className="rounded-xl p-4 active:bg-gray-100"
      >
        {favorite ? (
          <Star
            size={20}
            color="#9ca3af"
            fill="#9ca3af"
          />
        ) : (
          <Star
            size={20}
            color="#9ca3af"
          />
        )}
      </Pressable>
    </Pressable>
  );
}