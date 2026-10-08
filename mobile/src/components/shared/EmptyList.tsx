import { SearchX } from "lucide-react-native";
import { Text, View } from "react-native";

type EmptyListProps = {
  message?: string;
}
export default function EmptyList({
  message
}:EmptyListProps) {

  return (
    <View className="flex-1 flex-col justify-center items-center gap-4">
      <View className='flex-1 justify-center items-center py-4'>
        <SearchX size={32} color="#6b7280" />
        <Text className='text-gray-500 font-semibold'>
          {message}
        </Text>
      </View>
    </View>
  )
}