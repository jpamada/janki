import { Pencil, Trash2 } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

type CategoryItemProps = {
  id: string;
  name: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function CategoryItem({
  id,
  name,
  onEdit,
  onDelete
}: CategoryItemProps) {

  return (
    <Pressable className="flex-row items-center bg-gray-50 rounded-lg p-4">
      <View className="flex-1">
        <Pressable onPress={() => onEdit(id)}>
          <Text className="text-gray-800 text-lg font-semibold">
            {name}
          </Text>
        </Pressable>
      </View>

      <View className="flex flex-row items-center gap-4">
        <Pressable onPress={() => onEdit(id)} >
          <Pencil size={24} />
        </Pressable>

        <Pressable onPress={() => onDelete(id)}>
          <Trash2 size={24} />
        </Pressable>
      </View>
    </Pressable>
  );
}