import { CategoryFormData, categorySchema } from "@/schemas/category.schema"
import { Pressable, Text, TextInput } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

type CategoryProps = {
  onSubmit: (data: CategoryFormData) => Promise<void>;
  isEditing: boolean;
  defaultValues?: CategoryFormData;
}

export default function CategoryForm({
  onSubmit,
  isEditing,
  defaultValues = {
    name: ""
  }
}: CategoryProps) {

  const { control, handleSubmit, formState: { errors, isSubmitting }} = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues,
  });

  const handleFormSubmit = async (data: CategoryFormData) => {
    await onSubmit(data);
  }

  return (
    <View className="flex gap-6">
      <Text className="text-xl font-bold">
        {isEditing ? "Rename Category" : "Create Category"}
      </Text>

      <Controller
        name="name"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <Text className="text-gray-400 font-semibold mb-1">Name</Text>

            <TextInput
              multiline
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Enter name"
              className='bg-gray-100 rounded-xl text-lg text-gray-600 px-2 py-4'
            />

            {errors.name && (
              <Text className="text-red-400">{errors.name.message}</Text>
            )}
          </View>
        )}
      />

      <Pressable
        disabled={isSubmitting}
        onPress={handleSubmit(handleFormSubmit)}
        className="bg-gray-800 rounded-full px-4 py-3 active:bg-gray-700 disabled:bg-gray-400"
      >
        <Text className="text-white text-center font-semibold">
          {isEditing ? 'Rename' : 'Create Category'}
        </Text>
      </Pressable>
    </View>
  )
}