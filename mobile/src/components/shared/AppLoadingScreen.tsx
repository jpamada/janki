import { ActivityIndicator, View } from "react-native";

export default function AppLoadingScreen() {
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="small" color="#4b5563" />
    </View>
  )
}