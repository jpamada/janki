import { QuestionFormData, questionSchema } from '@/schemas/question.schema';
import { ArrowLeft, Square, SquareCheck, Trash2 } from 'lucide-react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Pressable, Text, TextInput, View } from 'react-native';
import { getLessons } from '@/repositories/lesson.repository';
import { zodResolver } from '@hookform/resolvers/zod';
import { Picker } from '@react-native-picker/picker';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';

import Header from '../shared/Header';

type QuestionFormProps = {
  onCreateSuccess?: boolean;
  onEditSuccess?: boolean;
  onSubmit: (data: QuestionFormData) => Promise<void>;
  defaultValues?: QuestionFormData;
};

export default function QuestionForm({
  onCreateSuccess,
  onEditSuccess,
  onSubmit,
  defaultValues = {
    question: '',
    lessonId: '',
    answers: []
  },
}: QuestionFormProps) {

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'answers',
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons'],
    queryFn: getLessons,
  });

  const handleFormSubmit = async (data: QuestionFormData) => {
    await onSubmit(data);

    reset({
      question: '',
      answers: [
        { answer: '', isCorrect: false },
        { answer: '', isCorrect: false },
      ],
    });
  };

  return (
    <View className="flex-1">
      <Header
        title="Questions"
        back={
          <Pressable onPress={() => router.back()}>
            <ArrowLeft />
          </Pressable>
        }
        right={
          <Pressable
            disabled={isSubmitting}
            onPress={handleSubmit(handleFormSubmit)}
            className="active:opacity-70 disabled:bg-gray-400"
          >
            <Text className="font-semibold">
              SAVE
            </Text>
          </Pressable>
        }
      />

      <View className='flex-1 p-4'>
        <Controller
          name="lessonId"
          control={control}
          render={({ field: { onChange, value } }) => (
            <View>
              <Text className='text-gray-400 text-sm font-semibold'>
                Lesson
              </Text>

              <Picker
                selectedValue={value}
                onValueChange={onChange}
              >
                <Picker.Item
                  label="Select a lesson"
                  value=""
                />

                {lessons.map((lesson) => (
                  <Picker.Item
                    key={lesson.id}
                    label={lesson.title}
                    value={lesson.id}
                  />
                ))}
              </Picker>

              {errors.lessonId && (
                <Text className="text-red-400">
                  {errors.lessonId.message}
                </Text>
              )}
            </View>
          )}
        />

        <Controller
          name="question"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <Text className='text-gray-400 text-sm font-semibold'>Question</Text>

              <TextInput
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Enter question"
              />

              {errors.question && (
                <Text className="text-red-400">{errors.question.message}</Text>
              )}
            </View>
          )}
        />

        <View>
          <Text className='text-gray-400 text-sm font-semibold'>Answers</Text>

            {errors.answers?.root?.message && (
              <Text className="text-red-400">
                {errors.answers.root.message}
              </Text>
            )}

          {fields.map((field, index) => (
            <View key={field.id} className='px-1 py-2'>
              <View className='flex flex-row justify-between items-center'>
                <Text>Answer #{index + 1}</Text>

                <View className='flex flex-row gap-3'>
                  <Controller
                    name={`answers.${index}.isCorrect`}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Pressable onPress={() => onChange(!value)}>
                        <View className='flex flex-row items-center gap-1'>
                          {value ? (
                            <>
                              <Text>Correct</Text>
                              <SquareCheck size={24} />
                            </>
                          ) : (
                            <>
                              <Text>Incorrect</Text>
                              <Square size={24} /> 
                            </>
                          )}
                        </View>
                      </Pressable>
                    )}
                  />

                  <Pressable 
                    onPress={() => remove(index)}
                  >
                    <Trash2 size={24}/>
                  </Pressable>
                </View>
              </View>

              <Controller
                name={`answers.${index}.answer`}
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <TextInput
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      placeholder="Write the answer..."
                      className="px-0"
                    />

                    {errors.answers?.[index]?.answer && (
                      <Text className="text-red-400">
                        {errors.answers[index].answer.message}
                      </Text>
                    )}
                  </View>
                )}
              />
            </View>
          ))}
        </View>

        <Pressable 
          onPress={() => append({ 
            answer: '', 
            isCorrect: false 
          })}
          className='border-2 border-gray-200 border-dashed py-2'
        >
          <Text className="text-gray-300 text-sm text-center font-semibold">
            Add New Choice
          </Text>
        </Pressable>
      </View>

      {onCreateSuccess && (
        <KeyboardStickyView>
          <View className="h-12 flex-row items-center bg-gray-600 rounded-xl px-4 m-2">
            <Text className='text-white font-medium'>
              1 question added
            </Text>
          </View>
        </KeyboardStickyView>
      )}
    </View>
  );
}
