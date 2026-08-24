import { NoteFolderFormData, noteFolderSchema } from "@/schemas/note-folder.schema";
import { Pressable, Text, TextInput, View } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

type NoteFolderProps = {
  onSubmit: (data: NoteFolderFormData) => Promise<void>;
  isEditing: boolean;
  defaultValues?: NoteFolderFormData;
}

export default function NoteFolderForm({
  onSubmit,
  isEditing,
  defaultValues = {
    name: "",
  },
}: NoteFolderProps) {

  const { control, handleSubmit, formState: { errors, isSubmitting }} = useForm<NoteFolderFormData>({
    resolver: zodResolver(noteFolderSchema),
    defaultValues,
  });

  const handleFormSubmit = async (data: NoteFolderFormData) => {
    await onSubmit(data);
  };

  return (
    <View className="flex gap-4">
      <Text className="text-xl font-bold">
        {isEditing ? "Rename Folder" : "Create Folder"}
      </Text>

      <Controller
        name="name"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              multiline
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Enter note title"
              className="text-xl font-semibold border-b-2 border-gray-200 px-0 py-0"
            />

            {errors.name && (
              <Text className='text-red-400'>{errors.name.message}</Text>
            )}
          </View>
        )}
      />

      <Pressable
        disabled={isSubmitting}
        onPress={handleSubmit(handleFormSubmit)}
        className="bg-gray-800 rounded-full py-2 active:opacity-70 disabled:bg-gray-400"
      >
        <Text className="text-white text-center font-semibold">
          {isEditing ? "Rename" : "Create Folder"}
        </Text>
      </Pressable>
    </View>
  )
}