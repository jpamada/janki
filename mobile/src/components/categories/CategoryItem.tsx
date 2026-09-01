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
    <Pressable className="flex-row items-center bg-gray-50 rounded-lg p-2 active:bg-gray-100">
      <View className="flex-1">
        <Pressable 
          onPress={() => onEdit(id)}
          className="ps-4"
        >
          <Text className="text-gray-800 text-lg font-semibold">
            {name}
          </Text>
        </Pressable>
      </View>

      <View className="flex flex-row items-center">
        <Pressable 
          onPress={() => onEdit(id)}
          className="p-4 rounded-full active:bg-gray-100"
        >
          <Pencil color="#1f2937" />
        </Pressable>

        <Pressable 
          onPress={() => onDelete(id)}
          className="p-4 rounded-full active:bg-gray-100"
        >
          <Trash2 color="#1f2937" />
        </Pressable>
      </View>
    </Pressable>
  );
}