import { useSfx } from "@/contexts/SfxContext";
import { Pressable, Text } from "react-native";

type CategoryItemProps = {
  id: string;
  name: string;
  onLongPress: (id: string) => void;
};

export default function CategoryItem({
  id,
  name,
  onLongPress,
}: CategoryItemProps) {
  const { hapticVibration } = useSfx();

  return (
    <Pressable 
      onLongPress={() => {
        hapticVibration();
        onLongPress(id);
      }}
      className="flex-row items-center bg-gray-50 rounded-lg p-4 active:bg-gray-100"
    >
      <Text className="text-gray-800 text-lg font-semibold">
        {name}
      </Text>
    </Pressable>
  );
}