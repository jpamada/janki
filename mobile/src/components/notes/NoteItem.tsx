import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { Pressable, Text, View } from "react-native";
import { Calendar, Trash2 } from "lucide-react-native";
import { router } from "expo-router";

type NoteItemProps = {
  id: string;
  title: string;
  createdAt: Date;
  onDelete: (id: string) => void;
};

export function NoteItem({
  id,
  title,
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
          className="bg-gray-50 rounded-lg p-4"
      >
        <View className="flex flex-row items-center gap-1">
          <Calendar size={12} color="#b4b4b4" />

          <Text className="text-gray-400 text-xs">
            {createdAt.toLocaleString()}
          </Text>
        </View>

        <Text className="text-gray-600 font-semibold">
          {title}
        </Text>
      </Pressable>
    </Swipeable>
  );
}