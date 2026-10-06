import { lessonSchema, type LessonFormData } from '@/schemas/lesson.schema';
import { Pressable, Text, TextInput, View } from 'react-native';
import { getSubjects } from '@/repositories/subject.repository';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';

import CustomPicker from '../shared/CustomPicker';

type LessonFormProps = {
  isEditing: boolean;
  defaultValues: LessonFormData;
  onSubmit: (data: LessonFormData) => Promise<void>;
};

export default function LessonForm({
  isEditing,
  onSubmit,
  defaultValues = {
    name: "",
    subjectId: "",
    favorite: false
  },
}: LessonFormProps) {

  const { control, handleSubmit, reset, formState: { errors, isSubmitting }} = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues,
  });

    const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: getSubjects,
  });

  const handleLessonSubmit = async (data: LessonFormData) => {
    try {
      await onSubmit(data);
      reset();

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View className="flex gap-6">
      <Controller
        name="name"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <Text className="text-gray-400 font-semibold mb-1">Name</Text>
            
            <TextInput
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Enter lesson title"
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

      <Controller
        name="subjectId"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="flex flex-col gap-2">
            <Text className="text-gray-400 font-semibold">
              Subject
            </Text>

            <View className="bg-gray-100 rounded-xl">
              <CustomPicker
                title="Subjects"
                placeholder='Select Subject'
                className='py-4 justify-between font-normal dark:bg-neutral-800'
                contentContainerClassName='text-lg dark:text-neutral-400'
                selectedValue={value}
                onValueChange={onChange}
                options={subjects.map((subject) => ({
                  label: subject.name,
                  value: subject.id,
                }))}
              />
            </View>

            {errors.subjectId && (
              <Text className="text-red-400">{errors.subjectId.message}</Text>
            )}
          </View>
        )}
      />
      
      <Pressable
        disabled={isSubmitting}
        onPress={handleSubmit(handleLessonSubmit)}
        className="
          bg-gray-600 rounded-full px-4 py-4 mt-2 
          dark:bg-neutral-700 dark:active:bg-neutral-600
          active:bg-gray-700 disabled:bg-gray-400
        "
      >
        <Text className="text-white text-center font-semibold">
          {isEditing ? 'Rename' : 'Create Lesson'}
        </Text>
      </Pressable>
    </View>
  );
}
