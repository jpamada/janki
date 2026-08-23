import { Trash2 } from "lucide-react-native";
import { Pressable } from "react-native";
import { router } from "expo-router";
import { Text } from "react-native";

import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";

type SubjectItem = {
  id: string;
  title: string;
  onDelete: (id: string) => void;
};

export function SubjectItem({
  id,
  title,
  onDelete,
}: SubjectItem) {
  const renderRightActions = () => {
    return (
      <Pressable
        onPress={() => onDelete(id)}
        className="w-20 items-center justify-center"
      >
        <Trash2 size={24} color="black" />
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
        onPress={() => router.push({
          pathname: `/subjects/lessons/[subjectId]`,
          params: { subjectId: id, subjectName: title }
        })}
        className="bg-gray-50 rounded-lg p-4"
      >
        <Text className="text-gray-600 text-xl font-bold">
          {title}
        </Text>
      </Pressable>
    </Swipeable>
  );
}