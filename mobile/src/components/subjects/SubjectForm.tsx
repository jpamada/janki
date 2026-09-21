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
    name: "",
    categoryId: null,
  },
}: SubjectFormProps) {
  
  const { control, handleSubmit, reset, formState: { errors, isSubmitting }} = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const handleSubjectSubmit = async (data: SubjectFormData) => {
    try {
      await onSubmit(data);
      reset();

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View className="flex gap-6">
      <Text className="text-xl font-bold">
        {isEditing ? 'Rename Subject' : 'Create Subject'}
      </Text>

      <Controller
        name="name"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <Text className="text-gray-400 font-semibold mb-1">
              Name
            </Text>

            <TextInput
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Enter subject title"
              className='bg-gray-100 rounded-xl text-lg text-gray-600 px-2 py-4'
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
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="flex flex-col gap-2">
            <Text className="text-gray-400 font-semibold">
              Category
            </Text>

            <View className="bg-gray-100 rounded-xl">
              <Picker selectedValue={value} onValueChange={onChange}>
                <Picker.Item 
                  label="Default" 
                  value={null}
                  style={{
                    fontSize: 16,
                    color: "#6b7280",
                  }}
                />

                {categories.map((category) => (
                  <Picker.Item
                    key={category.id}
                    label={category.name}
                    value={category.id}
                    style={{
                      fontSize: 16,
                      color: "#6b7280",
                    }}
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
        className="bg-gray-600 rounded-full px-4 py-4 mt-2 active:bg-gray-700 disabled:bg-gray-400"
      >
        <Text className="text-white text-center font-semibold">
          {isEditing ? 'Rename' : 'Create Subject'}
        </Text>
      </Pressable>
    </View>
  );
}
