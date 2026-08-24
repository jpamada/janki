import { Pressable, Text, View } from "react-native";
import { Calendar } from "lucide-react-native";
import { router } from "expo-router";

type NoteItemProps = {
  id: string;
  title: string;
  createdAt: Date;
  onLongPress: (id: string) => void;
};

export default function NoteItem({
  id,
  title,
  createdAt,
  onLongPress
}: NoteItemProps) {

  return (
    <Pressable
      delayLongPress={500}
      onLongPress={() => onLongPress(id)}
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
  );
}