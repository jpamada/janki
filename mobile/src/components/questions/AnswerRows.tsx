import { Square, SquareCheck, Trash2 } from 'lucide-react-native';
import { type QuestionFormData } from '@/schemas/question.schema';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Controller, type Control } from 'react-hook-form';
import { useColorScheme } from 'nativewind';
import { memo } from 'react';

type AnswerRowProps = {
  index: number;
  errorMessage?: string;
  control: Control<QuestionFormData>;
  onRemove: (index: number) => void;
};

function AnswerRow({ 
  index, 
  control, 
  errorMessage, 
  onRemove 
}: AnswerRowProps) {
  const { colorScheme } = useColorScheme();

  return (
    <View className='px-1 py-2'>
      <View className='flex flex-row justify-between items-center mb-1'>
        <Text className='text-gray-600 text-lg font-semibold dark:text-neutral-300'>
          {index + 1}
        </Text>

        <View className='flex flex-row'>
          <Controller
            control={control}
            name={`answers.${index}.isCorrect`}
            render={({ field: { onChange, value } }) => (
              <Pressable 
                onPress={() => onChange(!value)}
                className='p-2 rounded-xl active:bg-gray-100 dark:active:bg-neutral-700'
              >
                {value ? (
                  <View className='flex flex-row items-center gap-1'>
                    <Text className='text-gray-600 font-semibold dark:text-neutral-300'>
                      Correct
                    </Text>

                    <SquareCheck 
                      size={24}
                      color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"}  
                    />
                  </View>
                  
                ) : (
                  <View className='flex flex-row items-center gap-1'>
                    <Text className='text-gray-600 font-semibold dark:text-neutral-300'>
                      Incorrect
                    </Text>

                    <Square 
                      size={24} 
                      color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"}  
                    />
                  </View>
                )}
              </Pressable>
            )}
          />

          <Pressable 
            onPress={() => onRemove(index)} 
            className='p-2 rounded-xl active:bg-gray-100 dark:active:bg-neutral-700'
          >
            <Trash2 
              size={24} 
              color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"}  
            />
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
              className='
                text-gray-600 text-lg
                bg-gray-100 rounded-xl px-2 py-4
                dark:text-neutral-300
                dark:bg-neutral-700
              '
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