import { SubfolderFormData, subfolderSchema } from '@/schemas/subfolder.schema';
import { Pressable, Text, TextInput, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

type SubfolderProps = {
  onSubmit: (data: SubfolderFormData) => Promise<void>;
  isEditing: boolean;
  defaultValues?: SubfolderFormData;
};

export default function SubfolderForm({
  onSubmit,
  isEditing,
  defaultValues = {
    name: '',
    folderId: '',
  },
}: SubfolderProps) {

  const { control, handleSubmit, formState: { errors, isSubmitting }} = useForm<SubfolderFormData>({
    resolver: zodResolver(subfolderSchema),
    defaultValues,
  });

  const handleFormSubmit = async (data: SubfolderFormData) => {
    await onSubmit(data);
  };

  return (
    <View className="flex gap-6">
      <Text className="text-xl font-bold">
        {isEditing ? 'Rename Subfolder' : 'Create Subfolder'}
      </Text>

      <Controller
        name="name"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="flex flex-col gap-2">
            <Text className="text-gray-400 font-semibold">Title</Text>

            <TextInput
              multiline
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder=""
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
        className="bg-gray-800 rounded-full px-4 py-3 mt-2 active:bg-gray-700 disabled:bg-gray-400"
      >
        <Text className="text-white text-center font-semibold">
          {isEditing ? 'Rename' : 'Create Subfolder'}
        </Text>
      </Pressable>
    </View>
  );
}
