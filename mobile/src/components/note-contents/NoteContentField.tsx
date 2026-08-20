import { Control, Controller, UseFieldArrayRemove } from "react-hook-form";
import { NoteFormData } from "@/schemas/note.schema"
import { Text, TextInput, View } from "react-native";

type NoteContentFieldProps = {
  control: Control<NoteFormData>;
  sectionIndex: number;
  contentIndex: number;
  remove: UseFieldArrayRemove;
};

export default function NoteContentField({
  control,
  sectionIndex,
  contentIndex,
  remove,
}: NoteContentFieldProps) {
  return (
    <View>
      <Controller
        name={`noteSections.${sectionIndex}.noteContents.${contentIndex}.title`}
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
              placeholder="Content title"
              className="font-semibold"
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
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Write your content..."
              multiline
              textAlignVertical="top"
              className="bg-gray-100 rounded-xl px-2 min-h-24"
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