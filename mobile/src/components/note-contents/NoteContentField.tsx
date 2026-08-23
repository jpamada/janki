import { Control, Controller, UseFieldArrayRemove } from "react-hook-form";
import { NoteFormData } from "@/schemas/note.schema"
import { Pressable, Text, TextInput, View } from "react-native";
import { Trash2 } from "lucide-react-native";

import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";

type NoteContentFieldProps = {
  control: Control<NoteFormData>;
  sectionIndex: number;
  contentIndex: number;
  remove: UseFieldArrayRemove;
  onContentFocus: () => void;
  onContentBlur: () => void;
};

export default function NoteContentField({
  control,
  sectionIndex,
  contentIndex,
  remove,
  onContentFocus,
  onContentBlur
}: NoteContentFieldProps) {
  
  const renderRightActions = () => {
    return (
      <Pressable
        onPress={() => remove(contentIndex)}
        className="w-20 items-center justify-center bg-red-500"
      >
        <Trash2 size={24} color="white" />
      </Pressable>
    )
  }

  return (
    <Swipeable
    friction={1}
    rightThreshold={40}
    overshootRight={false}
    renderRightActions={renderRightActions}
    containerStyle={{
      width: "100%",
    }}
    >
      <View className="bg-gray-50 rounded-xl p-2">
        <Controller
          name={`noteSections.${sectionIndex}.noteContents.${contentIndex}.title`}
          control={control}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <View>
              <TextInput
                multiline
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Content title"
                className="text-gray-600 font-semibold"
              />

              {error && (
                <Text className="mt-1 text-red-400">
                  {error.message}
                </Text>
              )}
            </View>
          )}
        />

        <Controller
          name={`noteSections.${sectionIndex}.noteContents.${contentIndex}.content`}
          control={control}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <View>
              <TextInput
                value={value}
                onFocus={onContentFocus}
                onBlur={() => {
                  onBlur();
                  onContentBlur();
                }}
                onChangeText={onChange}
                placeholder="Write your content..."
                multiline
                textAlignVertical="top"
                className="text-gray-400"
              />

              {error && (
                <Text className="mt-1 text-red-400">
                  {error.message}
                </Text>
              )}
            </View>
          )}
        />
      </View>
    </Swipeable>
  );
}