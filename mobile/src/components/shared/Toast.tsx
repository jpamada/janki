import { Text, View } from "react-native";

type ToastProps = {
  message: string;
  visible: boolean;
};

export default function Toast({
  message,
  visible,
}: ToastProps) {

  if (!visible) {
    return null;
  }

  return (
    <View className="absolute top-8 right-4 left-4 rounded-xl bg-white p-4">
      <Text>
        {message}
      </Text>
    </View>
  );
}