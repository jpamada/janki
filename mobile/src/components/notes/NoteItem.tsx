import { Pressable, Text } from "react-native";
import { FileText } from "lucide-react-native";
import { router } from "expo-router";

import * as Haptics from 'expo-haptics';

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
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onLongPress(id);
      }}
      onPress={() => router.push({
        pathname: `/notes/[id]`,
        params: { id: id, title: title }
      })}
      className="bg-gray-50 rounded-xl flex-row items-center gap-2 px-4 py-4"
    >
      <FileText size={18} />

      <Text className="flex-1 font-semibold text-gray-700 text-lg">
        {title}
      </Text>
    </Pressable>
  );
}