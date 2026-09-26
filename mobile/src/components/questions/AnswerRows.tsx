import { Square, SquareCheck, Trash2 } from 'lucide-react-native';
import { type QuestionFormData } from '@/schemas/question.schema';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Controller, type Control } from 'react-hook-form';
import { memo } from 'react';

type AnswerRowProps = {
  control: Control<QuestionFormData>;
  index: number;
  errorMessage?: string;
  onRemove: (index: number) => void;
};

function AnswerRow({ control, index, errorMessage, onRemove }: AnswerRowProps) {
  return (
    <View className='px-1 py-2'>
      <View className='flex flex-row justify-between items-center mb-1'>
        <Text className='text-gray-600 text-lg font-semibold'>{index + 1}</Text>

        <View className='flex flex-row'>
          <Controller
            name={`answers.${index}.isCorrect`}
            control={control}
            render={({ field: { onChange, value } }) => (
              <Pressable onPress={() => onChange(!value)} className='p-2 rounded-xl active:bg-gray-100'>
                {value ? (
                  <View className='flex flex-row items-center gap-1'>
                    <Text className='text-gray-600 font-semibold'>Correct</Text>
                    <SquareCheck color="#4b5563" size={24} />
                  </View>
                ) : (
                  <View className='flex flex-row items-center gap-1'>
                    <Text className='text-gray-600 font-semibold'>Incorrect</Text>
                    <Square color="#4b5563" size={24} />
                  </View>
                )}
              </Pressable>
            )}
          />

          <Pressable onPress={() => onRemove(index)} className='p-2 rounded-xl active:bg-gray-100'>
            <Trash2 color="#4b5563" size={24} />
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

            {errorMessage && (
              <Text className="text-red-400">{errorMessage}</Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

export default memo(AnswerRow);