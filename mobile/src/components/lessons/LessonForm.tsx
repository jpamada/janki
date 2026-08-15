import { lessonSchema, type LessonFormData } from '@/schemas/lesson.schema';
import { Pressable, Text, TextInput, View } from 'react-native';
import { getSubjects } from '@/repositories/subject.repository';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Picker } from '@react-native-picker/picker';
import { useQuery } from '@tanstack/react-query';

type LessonFormProps = {
  onSubmit: (data: LessonFormData) => Promise<void>;
  defaultValues?: LessonFormData;
};

export function LessonForm({
  onSubmit,
  defaultValues = {
    title: '',
    subjectId: '',
  },
}: LessonFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: getSubjects,
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
              placeholder="Enter lesson title"
              className="px-0 text-2xl font-semibold"
            />

            {errors.title && (
              <Text className="text-red-400">{errors.title.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        name="subjectId"
        control={control}
        render={({ field: { onChange, value } }) => (
          <View>
            <Text>Subject</Text>

            <Picker
              selectedValue={value}
              onValueChange={onChange}
            >
              <Picker.Item
                label="Select a subject"
                value=""
              />

              {subjects.map((subject) => (
                <Picker.Item
                  key={subject.id}
                  label={subject.title}
                  value={subject.id}
                />
              ))}
            </Picker>

            {errors.subjectId && (
              <Text className="text-red-400">
                {errors.subjectId.message}
              </Text>
            )}
          </View>
        )}
      />
      
      <Pressable
        disabled={isSubmitting}
        onPress={handleSubmit(onSubmit)}
        className="mt-auto rounded-lg bg-black px-4 py-3 active:opacity-70 disabled:bg-gray-400"
      >
        <Text className="text-center font-semibold text-white">
          {isSubmitting ? 'Saving...' : 'Save Lesson'}
        </Text>
      </Pressable>
    </View>
  );
}
