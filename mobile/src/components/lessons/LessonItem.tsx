import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";

import { Trash2 } from "lucide-react-native";
import { Pressable } from "react-native";
import { Text } from "react-native";


type LessonItem = {
  id: string;
  title: string;
  onDelete: (id: string) => void;
};

export function LessonItem({
  id,
  title,
  onDelete,
}: LessonItem) {
  const renderRightActions = () => {
    return (
      <Pressable
        onPress={() => onDelete(id)}
        className="w-20 items-center justify-center bg-red-500"
      >
        <Trash2 size={24} color="white" />
      </Pressable>
    )
  }

  return (
    <Swipeable
      rightThreshold={40}
      overshootRight={false}
      renderRightActions={renderRightActions}
    >
      <Pressable
          // onPress={() => router.push(`/notes/${id}`)}
          className="bg-purple-600 rounded-lg p-4"
      >
        <Text className="text-white text-xl font-bold">
          {title}
        </Text>
      </Pressable>
    </Swipeable>
  );
}