import { Controller, type Control, type UseFieldArrayRemove } from "react-hook-form"
import type { NoteFormData } from "@/schemas/note.schema";
import { Text, TextInput, View } from "react-native";

type NoteSectionFieldProps = {
  control: Control<NoteFormData>;
  index: number;
  remove: UseFieldArrayRemove;
};

export default function NoteSectionField({
  control,
  index,
  remove,
}: NoteSectionFieldProps) {
  return (
    <View className="mb-4 rounded-lg bg-gray-100">
      <Controller
        name={`noteSections.${index}.title`}
        control={control}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <View>
            <TextInput
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Enter section title"
              className="text-gray-800 text-lg font-bold bg-white rounded-lg py-2"
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
  );
}