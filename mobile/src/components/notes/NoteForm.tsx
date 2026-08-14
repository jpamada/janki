import { noteSchema, type NoteFormData } from '@/schemas/note.schema';
import { Button, Pressable, Text, TextInput, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

type NoteFormProps = {
  onSubmit: (data: NoteFormData) => Promise<void>;
  defaultValues?: NoteFormData;
};

export function NoteForm({
  onSubmit,
  defaultValues = {
    title: '',
    content: '',
  },
}: NoteFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues,
  });

  return (
    <View className='flex-1'>
      <Controller
        name="title"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Enter note title"
              className="text-2xl font-semibold px-0"
            />

            {errors.title && (
              <Text className='text-red-400'>{errors.title.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        name="content"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              multiline
              value={value}
              onBlur={onBlur}
              className='px-0'
              onChangeText={onChange}
              textAlignVertical="top"
              placeholder="Write your note..."
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
          {isSubmitting ? 'Saving...' : 'Save Note'}
        </Text>
      </Pressable>
    </View>
  );
}
