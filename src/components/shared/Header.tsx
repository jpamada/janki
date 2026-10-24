import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { Text, View } from "react-native";
import { router } from "expo-router";

import DebouncedPressable from "./pressables/DebouncedPressable";

type HeaderProps = {
  title?: string;
  back?: boolean;
  right?: React.ReactNode;
};

export default function Header({
  title,
  back,
  right
}: HeaderProps) {
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <View 
      className="
        flex flex-row justify-between items-center
        px-2 py-2 mt-2
      "
      style={{ paddingTop: insets.top }}  
    >
      <View className="flex flex-row items-center">
        {back && (
          <DebouncedPressable
            onPress={() => router.back()}
            className="p-3 rounded-xl active:bg-gray-100 dark:active:bg-neutral-800"
          >
            <ArrowLeft color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
          </DebouncedPressable>
        )}

        {title && (
          <Text className={`
            text-xl font-semibold dark:text-neutral-300
            ${back ? "px-1" : "px-4"}
          `}>
            {title}
          </Text>
        )}
      </View>

      <View>
        {right}
      </View>
    </View>
  )
} 