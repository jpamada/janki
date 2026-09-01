import { Lightbulb } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Text } from "react-native";

import * as Haptics from 'expo-haptics';

type SubjectItem = {
  id: string;
  title: string;
  onLongPress: (id: string) => void;
};

export default function SubjectItem({
  id,
  title,
  onLongPress
}: SubjectItem) {

  return (
    <Pressable
      delayLongPress={500}
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onLongPress(id);
      }}
      onPress={() => router.push({
        pathname: `/subjects/lessons/[subjectId]`,
        params: { subjectId: id, subjectName: title }
      })}
      className='flex flex-row items-center gap-4 p-4 bg-gray-50 rounded-lg active:bg-gray-100'
    >
      <View className='bg-white rounded-xl p-4'>
        <Lightbulb color="#9ca3af" />
      </View>
      <View>
        <Text className='text-gray-600 font-bold'>
          {title}
        </Text>
      </View>
    </Pressable>
  );
}