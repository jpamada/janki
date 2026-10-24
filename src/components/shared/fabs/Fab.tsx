import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Pressable, View } from "react-native";
import { useColorScheme } from "nativewind";
import { Plus } from "lucide-react-native";

type FabPressableProps = {
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Fab({
  setVisible,
}:FabPressableProps) {
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute right-6 items-end"
      style={{ bottom: insets.bottom }}
    >
      <Pressable
        onPress={() => setVisible((prev) => !prev)}
        style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)' }}
        className="
          flex items-center justify-center 
          rounded-full h-16 w-16
          bg-white active:bg-gray-50
          dark:bg-neutral-800 dark:active:bg-neutral-700
        "
      >
        <Plus 
          size={24} 
          color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"}
        />
      </Pressable>
    </View>
  )
}