import { SubjectFormData, subjectSchema } from '@/schemas/subject.schema';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';

import Header from '../shared/Header';

type SubjectFormProps = {
  onSubmit: (data: SubjectFormData) => Promise<void>;
  defaultValues?: SubjectFormData;
};

export default function SubjectForm({
  onSubmit,
  defaultValues = {
    title: '',
    category: '',
  },
}: SubjectFormProps) {
  
  const { control, handleSubmit, formState: { errors, isSubmitting }} = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues,
  });

  return (
    <View className="flex-1">
      <Header
        title="Subject"
        back={
          <Pressable onPress={() => router.back()}>
            <ArrowLeft />
          </Pressable>
        }
        right={
          <Pressable
            disabled={isSubmitting}
            onPress={handleSubmit(onSubmit)}
            className="active:opacity-70 disabled:bg-gray-400"
          >
            <Text className="text-center font-semibold">
              SAVE
            </Text>
          </Pressable>
        }
      />

      <View className='p-4'>
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
                placeholder="Enter category"
              />

              {errors.category && (
                <Text className="text-red-400">{errors.category.message}</Text>
              )}
            </View>
          )}
        />
      </View>
    </View>
  );
}
