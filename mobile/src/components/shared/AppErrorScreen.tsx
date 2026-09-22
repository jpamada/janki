import { Text, View } from "react-native";

type AppErrorScreenProps = {
  errorMessage?: string;
};

export default function AppErrorScreen({
  errorMessage,
}: AppErrorScreenProps) {
  return (
    <View className="flex-1 items-center justify-center">
      <Text>
        {errorMessage}
      </Text>
    </View>
  );
}