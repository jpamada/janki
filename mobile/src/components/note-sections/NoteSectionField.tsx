import { Controller, useFieldArray, type Control, type UseFieldArrayRemove } from "react-hook-form"
import NoteContentField from "../note-contents/NoteContentField";
import { Pressable, Text, TextInput, View } from "react-native";
import type { NoteFormData } from "@/schemas/note.schema";

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

  const { fields, append, remove: removeContent } = useFieldArray({
    control,
    name: `noteSections.${index}.noteContents`,
  });

  return (
    <View>
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
              className="text-lg font-bold text-gray-800"
            />

            {error && (
              <Text className="mt-1 text-red-400">
                {error.message}
              </Text>
            )}
          </View>
        )}
      />

      <View>
        {fields.map((field, contentIndex) => (
          <NoteContentField
            key={field.id}
            control={control}
            sectionIndex={index}
            contentIndex={contentIndex}
            remove={removeContent}
          />
        ))}
      </View>

      <Pressable
        onPress={() =>
          append({
            title: "",
            content: "",
            type: "text",
            position: fields.length,
          })
        }
      >
        <Text className="text-gray-300 text-sm text-center border-2 font-semibold border-gray-200 border-dashed py-2 mt-4">
          New Content
        </Text>
      </Pressable>
    </View>
  );
}