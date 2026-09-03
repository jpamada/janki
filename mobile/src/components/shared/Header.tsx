import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

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

  const insets = useSafeAreaInsets();

  return (
    <View 
      className={`
        flex flex-row justify-between items-center
        px-2 py-2 mt-2
      `}
      style={{
        paddingTop: insets.top
      }}  
    >
      <View className={`
        flex flex-row items-center
      `}>
        {back && (
          <Pressable
            onPress={() => router.back()}
            className="p-3 rounded-xl active:bg-gray-100"
          >
            <ArrowLeft />
          </Pressable>
        )}

        {title && (
          <Text className={`text-xl font-semibold ${back ? "px-1" : "px-4"}`}>
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