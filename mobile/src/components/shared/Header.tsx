import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View } from "react-native";

type HeaderProps = {
  title?: string;
  back?: React.ReactNode;
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
        px-4 py-2 mt-4 
      `}
      style={{
        paddingTop: insets.top
      }}  
    >
      <View className={`
        flex flex-row gap-2
      `}>
        <View>
          {back}
        </View>

        <Text className="text-xl font-semibold">
          {title}
        </Text>
      </View>

      <View>
        {right}
      </View>
    </View>
  )
} 