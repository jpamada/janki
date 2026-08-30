import { SubjectFormData, subjectSchema } from '@/schemas/subject.schema';
import { getCategories } from '@/repositories/category.repository';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Picker } from '@react-native-picker/picker';
import { useQuery } from '@tanstack/react-query';

type SubjectFormProps = {
  isEditing: boolean;
  onSubmit: (data: SubjectFormData) => Promise<void>;
  defaultValues?: SubjectFormData;
};

export default function SubjectForm({
  isEditing,
  onSubmit,
  defaultValues = {
    title: '',
    categoryId: null,
  },
}: SubjectFormProps) {
  
  const { control, handleSubmit, formState: { errors, isSubmitting }} = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const handleSubjectSubmit = async (data: SubjectFormData) => {
    await onSubmit(data);
  };

  return (
    <View className="flex gap-6">
      <Text className="text-xl font-bold">
        {isEditing ? 'Rename Subject' : 'Create Subject'}
      </Text>

      <Controller
        name="title"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Enter subject title"
              className="text-2xl font-semibold px-0"
            />

            {errors.title && (
              <Text className="text-red-400">{errors.title.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        name="categoryId"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="flex flex-col gap-2">
            <Text className="text-gray-400 font-semibold">Category</Text>

            <View className="bg-white rounded-xl border border-gray-200">
              <Picker selectedValue={value} onValueChange={onChange}>
                <Picker.Item label="Default" value={undefined} />

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
              <Text className="text-red-400">{errors.categoryId.message}</Text>
            )}
          </View>
        )}
      />

      <Pressable
        disabled={isSubmitting}
        onPress={handleSubmit(handleSubjectSubmit)}
        className="bg-gray-800 rounded-full px-4 py-3 mt-2 active:opacity-70 disabled:bg-gray-400"
      >
        <Text className="text-white text-center font-semibold">
          {isEditing ? 'Rename' : 'Create Subject'}
        </Text>
      </Pressable>
    </View>
  );
}
