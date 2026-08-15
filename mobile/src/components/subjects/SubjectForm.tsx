import { SubjectFormData, subjectSchema } from '@/schemas/subject.schema';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

type SubjectFormProps = {
  onSubmit: (data: SubjectFormData) => Promise<void>;
  defaultValues?: SubjectFormData;
};

export function SubjectForm({
  onSubmit,
  defaultValues = {
    title: '',
    category: '',
  },
}: SubjectFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues,
  });

  return (
    <View className="flex-1">
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
        name="category"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              value={value}
              onBlur={onBlur}
              className="px-0"
              onChangeText={onChange}
              placeholder="Enter subject category"
            />
          </View>
        )}
      />

      <Pressable
        disabled={isSubmitting}
        onPress={handleSubmit(onSubmit)}
        className="mt-auto rounded-lg bg-black px-4 py-3 active:opacity-70 disabled:bg-gray-400"
      >
        <Text className="text-center font-semibold text-white">
          {isSubmitting ? 'Saving...' : 'Save Subject'}
        </Text>
      </Pressable>
    </View>
  );
}
