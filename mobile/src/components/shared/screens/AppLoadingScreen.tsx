import { ActivityIndicator, Text, View } from "react-native";

export default function AppLoadingScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
      <ActivityIndicator size="small" color="#4b5563" />
      <Text className="text-sm font-semibold dark:text-neutral-300">
        Loading Janki...
      </Text>
    </View>
  )
}