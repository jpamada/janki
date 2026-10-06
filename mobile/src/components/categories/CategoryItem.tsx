import { useSfx } from "@/contexts/SfxContext";
import { Pressable, Text } from "react-native";

type CategoryItemProps = {
  id: string;
  name: string;
  onPress: (id: string) => void;
  onLongPress: (id: string) => void;
};

export default function CategoryItem({
  id,
  name,
  onPress,
  onLongPress,
}: CategoryItemProps) {
  const { hapticVibration } = useSfx();

  return (
    <Pressable 
      onPress={() => {
        hapticVibration();
        onPress(id);
      }}
      onLongPress={() => {
        hapticVibration();
        onLongPress(id);
      }}
      className="
        flex-row items-center gap-2
        bg-gray-100 rounded-lg p-4
        active:bg-gray-100 dark:bg-neutral-800 dark:active:bg-neutral-700
      "
    >
      <Text className="
        flex-1 
        text-gray-700 text-lg font-semibold 
        dark:text-neutral-300
      ">
        {name}
      </Text>
    </Pressable>
  );
}