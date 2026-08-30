import { Href, router } from "expo-router";
import { Pressable, Text, View } from "react-native";

type EmptyStateProps = {
  title: string;
  navigate: Href;
  description?: string;
  icon?: React.ReactNode;
}

export default function EmptyStateScreen({
  icon,
  title,
  navigate,
  description,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-white p-4">
      <View className='flex flex-col items-center gap-2'>
        {icon && (
          <View>
            {icon}
          </View>
        )}

        {title && (
          <Text className="text-2xl font-semibold">
            {title}
          </Text>
        )}

        {description && (
          <Text className="text-lg font-medium">
            {description}
          </Text>
        )}
      </View>

      <View className='flex flex-col items-center gap-2'>
        {navigate && (
          <Pressable
            onPress={() =>
            router.push(navigate)}
            className='bg-gray-800 border rounded-full px-4 py-2'
          >
            <Text className='text-white'>
              Manage Questions
            </Text>
          </Pressable>
        )}
        
        <Pressable
          onPress={() => router.back()}
          className='border rounded-full px-4 py-2'
        >
          <Text>Go Back</Text>
        </Pressable>
      </View>
    </View>
  )
}