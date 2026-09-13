import { lessonSchema, type LessonFormData } from '@/schemas/lesson.schema';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

type LessonFormProps = {
  isEditing: boolean;
  defaultValues?: LessonFormData;
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

  const { control, handleSubmit, formState: { errors, isSubmitting }} = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues,
  });

  const handleLessonSubmit = async (data: LessonFormData) => {
    await onSubmit(data);
  };

  return (
    <View className="flex gap-6">
      <Text className="text-xl font-bold">
        {isEditing ? 'Rename Lesson' : 'Create Lesson'}
      </Text>

      
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
        onPress={handleSubmit(handleLessonSubmit)}
        className="bg-gray-600 rounded-full px-4 py-3 mt-2 active:bg-gray-700 disabled:bg-gray-400"
      >
        <Text className="text-white text-center font-semibold">
          {isEditing ? 'Rename' : 'Create Lesson'}
        </Text>
      </Pressable>
    </View>
  );
}
