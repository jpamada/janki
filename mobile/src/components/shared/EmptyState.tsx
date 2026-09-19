import { Href, router } from "expo-router";
import { Pressable, Text, View } from "react-native";

type EmptyStateProps = {
  title: string;
  navigate: Href;
  icon?: React.ReactNode;
}

export default function EmptyStateScreen({
  icon,
  title,
  navigate,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-6 p-6">
      {icon && (
        <View>
          {icon}
        </View>
      )}

      {title && (
        <Text className="text-center text-xl font-semibold text-gray-700">
          {title}
        </Text>
      )}

      {navigate && (
        <Pressable
          onPress={() =>
          router.push(navigate)}
          className="rounded-xl bg-gray-600 px-8 py-4 active:bg-gray-700"
        >
          <Text className="text-center text-lg font-semibold text-white">
            Add Questions
          </Text>
        </Pressable>
      )}
    </View>
  )
}