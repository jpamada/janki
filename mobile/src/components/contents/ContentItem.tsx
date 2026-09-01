import { Square, SquareCheck } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

type ContentItemProps = {
  id: string;
  title: string;
  content: string;
  todo?: boolean | null;
  remarks?: string | null;
  onPress: (id: string) => void;
};

export default function ContentItem({
  id,
  title,
  todo,
  content,
  remarks,
  onPress,
}: ContentItemProps) {

  const TodoCheckbox = () => {
    if (todo === null || todo === undefined) {
      return null;
    }

    return todo ? (
      <SquareCheck size={18} color="#4b5563" />
    ) : (
      <Square size={18} color="#4b5563" />
    );
  };

  return (
    <Pressable
      onPress={() => onPress(id)}
      className="rounded-xl bg-gray-50 p-4 active:bg-gray-100"
    >
      <View>
        {!!title.trim() ? (
          <View className="flex-row items-center gap-2">
            <Text className="flex-1 text-lg font-semibold text-gray-800">
              {title}
            </Text>

            <TodoCheckbox />
          </View>

        ) : (
          <View className="flex-row items-start gap-2">

            {content && (
              <Text className="flex-1 text-sm text-gray-500">
                {content}
              </Text>
            )}
            
            <TodoCheckbox />
          </View>
        )}

        {!!title.trim() && content && (
          <Text className="mt-1 text-sm text-gray-500">
            {content}
          </Text>
        )}

        {remarks && (
          <Text className="mt-2 text-xs text-gray-400">
            {remarks}
          </Text>
        )}
      </View>
    </Pressable>
  );
}