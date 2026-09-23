import { Pressable, View, Text } from "react-native";
import { Star } from "lucide-react-native";
import { router } from "expo-router";

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
      className="flex flex-row items-center gap-2 bg-gray-50 rounded-lg px-2 py-2 active:bg-gray-100"
    >
      <Pressable 
        onPress={(event) => {
          event.stopPropagation();
          onRemoveFavorite(id);
        }}
        className="p-2 rounded-xl active:bg-gray-100"
      >
        {favorite === true ? (
          <Star size={20} color="#9ca3af" fill="#9ca3af"/>
        ) : (
          <Star size={20} color="#9ca3af" />
        )}
      </Pressable>

      <View className="flex-1 min-w-0 pe-2">
        <Text
          className="text-gray-400 text-sm font-semibold"
          numberOfLines={1}
        >
          {subject?.name}
        </Text>

        <Text className="text-gray-600 text-lg font-medium">
          {title}
        </Text>
      </View>
    </Pressable>
  );
}