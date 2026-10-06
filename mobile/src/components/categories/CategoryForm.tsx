import { CategoryFormData, categorySchema } from "@/schemas/category.schema"
import { Pressable, Text, TextInput, View } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

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
              className='
                text-gray-600 text-lg
                bg-gray-100 rounded-xl px-2 py-4
                dark:text-neutral-300
                dark:bg-neutral-800
              '
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
        className="
          bg-gray-600 rounded-full px-4 py-4 mt-2 
          dark:bg-neutral-700 dark:active:bg-neutral-600
          active:bg-gray-700 disabled:bg-gray-400
        "
      >
        <Text className="text-white text-center font-semibold">
          {isEditing ? 'Rename' : 'Create Category'}
        </Text>
      </Pressable>
    </View>
  )
}