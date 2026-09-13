import { lessonSchema, type LessonFormData } from '@/schemas/lesson.schema';
import { Pressable, Text, TextInput, View } from 'react-native';
import { getSubjects } from '@/repositories/subject.repository';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Picker } from '@react-native-picker/picker';
import { useQuery } from '@tanstack/react-query';

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

      <Controller
        name="subjectId"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="flex flex-col gap-2">
            <Text className="text-gray-400 font-semibold">
              Subject
            </Text>

            <View className="bg-gray-100 rounded-xl">
              <Picker selectedValue={value} onValueChange={onChange}>
                <Picker.Item 
                  label="Select Subject" 
                  value={null}
                  style={{
                    fontSize: 16,
                    color: "#6b7280",
                  }}
                />

                {subjects.map((subject) => (
                  <Picker.Item
                    key={subject.id}
                    label={subject.name}
                    value={subject.id}
                    style={{
                      fontSize: 16,
                      color: "#6b7280",
                    }}
                  />
                ))}
              </Picker>
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
        className="bg-gray-600 rounded-full px-4 py-3 mt-2 active:bg-gray-700 disabled:bg-gray-400"
      >
        <Text className="text-white text-center font-semibold">
          {isEditing ? 'Rename' : 'Create Lesson'}
        </Text>
      </Pressable>
    </View>
  );
}
