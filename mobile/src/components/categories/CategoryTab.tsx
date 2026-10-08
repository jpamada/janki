import { Pressable, Text } from "react-native";

type CategoryTabProps = {
  name: string;
  selected: boolean;
  onPress: () => void;
};

export default function CategoryTab({
  name,
  selected,
  onPress,
}: CategoryTabProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`
        rounded-full px-4 py-2 
        ${selected
          ? "bg-gray-600 dark:bg-neutral-800"
          : "bg-gray-50 active:bg-gray-100 dark:bg-neutral-700 dark:active:bg-neutral-600"
        }
      `}
    >
      <Text
        className={`
          text-sm 
          ${selected
            ? "font-bold text-white dark:text-neutral-200"
            : "font-semibold text-gray-600 dark:text-neutral-300"
          }
        `}
      >
        {name}
      </Text>
    </Pressable>
  );
}