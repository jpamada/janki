import { FolderFormData, noteFolderSchema } from '@/schemas/folder.schema';
import { getCategories } from '@/repositories/category.repository';
import { Pressable, Text, TextInput, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Picker } from '@react-native-picker/picker';
import { useQuery } from '@tanstack/react-query';

type NoteFolderProps = {
  onSubmit: (data: FolderFormData) => Promise<void>;
  isEditing: boolean;
  defaultValues?: FolderFormData;
};

export default function NoteFolderForm({
  onSubmit,
  isEditing,
  defaultValues = {
    name: '',
    categoryId: '',
  },
}: NoteFolderProps) {
  
  const { control, handleSubmit, formState: { errors, isSubmitting }} = useForm<FolderFormData>({
    resolver: zodResolver(noteFolderSchema),
    defaultValues,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories
  });

  const handleFormSubmit = async (data: FolderFormData) => {
    await onSubmit(data);
  };

  return (
    <View className="flex gap-6">
      <Text className="text-xl font-bold">
        {isEditing ? 'Rename Folder' : 'Create Folder'}
      </Text>

      <Controller
        name="name"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="flex flex-col gap-2">
            <Text className="text-gray-400 font-semibold">
              Title
            </Text>

            <TextInput
              multiline
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder=""
              className="text-gray-800 text-lg rounded-xl border px-2 py-4 border-gray-200"
            />

            {errors.name && (
              <Text className="text-red-400">{errors.name.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        name="categoryId"
        control={control}
        render={({ field: { onChange, onBlur, value }}) => (
          <View className="flex flex-col gap-2">
            <Text className="text-gray-400 font-semibold">
              Category
            </Text>

            <View className="bg-white rounded-xl border border-gray-200">
              <Picker
                selectedValue={value}
                onValueChange={onChange}
              >
                {categories.map((category) => (
                  <Picker.Item
                    key={category.id}
                    label={category.name}
                    value={category.id}
                  />
                ))}
              </Picker>
            </View>

            {errors.categoryId && (
              <Text className="text-red-400">
                {errors.categoryId.message}
              </Text>
            )}
          </View>
        )}
      />

      <Pressable
        disabled={isSubmitting}
        onPress={handleSubmit(handleFormSubmit)}
        className="bg-gray-800 rounded-full px-4 py-3 mt-2 active:opacity-70 disabled:bg-gray-400"
      >
        <Text className="text-white text-center font-semibold">
          {isEditing ? 'Rename' : 'Create Folder'}
        </Text>
      </Pressable>
    </View>
  );
}
