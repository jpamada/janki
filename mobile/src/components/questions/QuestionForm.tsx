import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { QuestionFormData, questionSchema } from '@/schemas/question.schema';
import { ArrowLeft, Square, SquareCheck, Trash2 } from 'lucide-react-native';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Pressable, Text, TextInput, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
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

  const handleFormSubmit = async (data: QuestionFormData) => {
    await onSubmit(data);

    reset({
      question: '',
      lessonId: data.lessonId,
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
        back={true}
      />

      <KeyboardAwareScrollView className="flex-1 mb-2" bottomOffset={20}>
        <View className='gap-4 bg-white rounded-xl shadow-lg p-4 m-4 pb-8'>
          <Controller
            name="question"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <Text className='text-gray-600 text-sm font-semibold mb-2'>
                  Question
                </Text>

                <TextInput
                  multiline
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Enter question"
                  className='bg-gray-100 rounded-xl font-semibold px-2 py-4'
                />

                {errors.question && (
                  <Text className="text-red-400">{errors.question.message}</Text>
                )}
              </View>
            )}
          />

          <View>
            <Text className='text-gray-600 text-sm font-semibold mb-2'>
              Answers
            </Text>

              {errors.answers?.root?.message && (
                <Text className="text-red-400">
                  {errors.answers.root.message}
                </Text>
              )}

            {fields.map((field, index) => (
              <View key={field.id} className='px-1 py-2'>
                <View className='flex flex-row justify-between items-center mb-1'>
                  <Text className='text-gray-600 text-lg font-semibold'>
                    {index + 1}
                  </Text>

                  <View className='flex flex-row'>
                    <Controller
                      name={`answers.${index}.isCorrect`}
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Pressable 
                          onPress={() => onChange(!value)}
                          className='px-4 py-2 rounded-full active:bg-gray-100'
                        >
                          {value ? (
                            <View className='flex flex-row items-center gap-1'>
                              <Text className='text-gray-600 font-semibold'>
                                Correct
                              </Text>
                              <SquareCheck color="#4b5563" size={24} />
                            </View>

                          ) : (
                            <View className='flex flex-row items-center gap-1'>
                              <Text className='text-gray-600 font-semibold'>
                                Incorrect
                              </Text>
                              <Square color="#4b5563" size={24} /> 
                            </View>
                          )}
                        </Pressable>
                      )}
                    />

                    <Pressable 
                      onPress={() => remove(index)}
                      className='px-4 py-2 rounded-full active:bg-gray-100'
                    >
                      <Trash2 color="#4b5563" size={24}/>
                    </Pressable>
                  </View>
                </View>

                <Controller
                  name={`answers.${index}.answer`}
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                      <TextInput
                        multiline
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        placeholder="Enter answer"
                        className='bg-gray-100 rounded-xl font-semibold px-2 py-4'
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
            className='border-2 border-gray-200 border-dashed mx-1 py-2 active:bg-gray-50'
          >
            <Text className="text-gray-300 text-sm text-center font-semibold">
              Add answer
            </Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>

      {onCreateSuccess && (
        <KeyboardStickyView>
          <View className="h-12 flex-row items-center bg-gray-100 rounded-xl px-4 m-2">
            <Text className='text-gray-800 font-medium'>
              1 question added
            </Text>
          </View>
        </KeyboardStickyView>
      )}

      <KeyboardStickyView>
        <View className="flex-row items-center border-t border-gray-200 bg-white px-4 py-6">
          <Pressable
            disabled={isSubmitting}
            onPress={handleSubmit(handleFormSubmit)}
            className="bg-gray-600 rounded-full px-4 py-4 w-full active:bg-gray-500"
          >
            <Text className="text-white text-center text-lg font-semibold">
              Save Changes
            </Text>
          </Pressable>
        </View>
      </KeyboardStickyView>
    </View>
  );
}
