import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { Pressable, Text } from "react-native";
import { Trash2 } from "lucide-react-native";
import { router } from "expo-router";

type NoteItemProps = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  onDelete: (id: string) => void;
};

export function NoteItem({
  id,
  title,
  content,
  createdAt,
  onDelete,
}: NoteItemProps) {
  const renderRightActions = () => {
    return (
      <Pressable
        onPress={() => onDelete(id)}
        className="w-20 items-center justify-center bg-red-500"
      >
        <Trash2 size={24} color="white" />
      </Pressable>
    );
  }

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
    >
      <Pressable
          onPress={() => router.push(`/notes/${id}`)}
          className="bg-white rounded-lg p-4"
      >
        <Text className="text-gray-400 text-xs mb-2">
          {createdAt.toLocaleString()}
        </Text>

        <Text className="font-semibold">
          {title}
        </Text>

        <Text>
          {content}
        </Text>
      </Pressable>
    </Swipeable>
  );
}