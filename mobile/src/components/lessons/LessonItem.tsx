import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";

import { Settings, Trash2 } from "lucide-react-native";
import { Pressable } from "react-native";
import { Text } from "react-native";
import { router } from "expo-router";

type LessonItem = {
  id: string;
  title: string;
  subjectId: string;
  onDelete: (id: string) => void;
};

export function LessonItem({
  id,
  title,
  subjectId,
  onDelete,
}: LessonItem) {
  const renderRightActions = () => {
    return (
      <>
        <Pressable
          onPress={() => onDelete(id)}
          className="w-20 items-center justify-center bg-red-500"
        >
          <Trash2 size={24} color="white" />
        </Pressable>

        <Pressable
          onPress={() => 
            router.push({
              pathname: `/subjects/lessons/questions/create`,
              params: { lessonId: id },
            })
          }
          className="w-20 items-center justify-center bg-gray-400"
        >
          <Settings size={24} color="white" />
        </Pressable>
      </>
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
          pathname: `/subjects/lessons/quiz/play`,
          params: { lessonId: id }
        })}
        className="bg-gray-900 rounded-lg p-4"
      >
        <Text className="text-white text-xl font-bold">
          {title}
        </Text>
      </Pressable>
    </Swipeable>
  );
}