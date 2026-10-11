import { SearchX } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { Text, View } from "react-native";

type EmptyListProps = {
  message?: string;
}
export default function EmptyList({
  message
}:EmptyListProps) {
  const { colorScheme } = useColorScheme();
  
  return (
    <View className="flex-1 flex-col justify-center items-center gap-4">
      <View className='flex-1 justify-center items-center py-4'>
        <SearchX size={32} color={colorScheme === "light" ? "#D1D5DB" : "#9CA3AF"} />
        <Text className='text-gray-300 font-semibold dark:text-gray-400'>
          {message}
        </Text>
      </View>
    </View>
  )
}