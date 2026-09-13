import { Star } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Text } from "react-native";

import * as Haptics from "expo-haptics";

type Subject = {
  id: string;
  name: string;
};

type LessonItem = {
  id: string;
  title: string;
  subject: Subject;
  favorite: boolean;
  onLongPress: (id: string) => void;
  onRemoveFavorite: (id: string) => void;
};

export default function FavoriteItem({
  id,
  title,
  subject,
  favorite,
  onLongPress,
  onRemoveFavorite
}: LessonItem) {

  return (
    <Pressable
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onLongPress(id);
      }}
      onPress={() => router.push({
        pathname: `/quiz/play`,
        params: { lessonId: id }
      })}
      className="flex flex-row items-center justify-between gap-2 bg-gray-50 rounded-lg px-4 py-2 active:bg-gray-100"
    >
      <View className="flex flex-col">
        <Text className="text-gray-400 text-sm font-semibold">
          {subject?.name}
        </Text>

        <Text className="text-gray-600 text-xl font-bold">
          {title}
        </Text>
      </View>

      <Pressable 
        onPress={(event) => {
          event.stopPropagation();
          onRemoveFavorite(id);
        }}
        className="p-4 rounded-xl active:bg-gray-100"
      >
        {favorite === true ? (
          <Star size={20} color="#9ca3af" fill="#9ca3af"/>
        ) : (
          <Star size={20} color="#9ca3af" />
        )}
      </Pressable>
    </Pressable>
  );
}