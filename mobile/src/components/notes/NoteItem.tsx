import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { Trash2 } from "lucide-react-native";

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
  function renderRightActions() {
    return (
      <Pressable
        onPress={() => onDelete(id)}
        className="w-20 items-center justify-center bg-red-500"
      >
        <Trash2 size={24} color="white" />
        <Text className="text-white">Delete</Text>
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