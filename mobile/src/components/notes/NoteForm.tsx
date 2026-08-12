import { noteSchema, type NoteFormData } from '@/schemas/note.schema';
import { Button, Text, TextInput, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

type NoteFormProps = {
  onSubmit: (data: NoteFormData) => Promise<void>;
};

export function NoteForm({ onSubmit }: NoteFormProps) {
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: { title: '', content: '' },
  });

  return (
    <View>
      <Controller
        name="title"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <Text>Title</Text>

            <TextInput
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Enter note title"
            />

            {errors.title && <Text>{errors.title.message}</Text>}
          </View>
        )}
      />

      <Controller
        name="content"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <Text>Content</Text>

            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Write your note..."
              multiline
              textAlignVertical="top"
            />
          </View>
        )}
      />

      <Button
        title={isSubmitting ? 'Saving...' : 'Save Note'}
        disabled={isSubmitting}
        onPress={handleSubmit(onSubmit)}
      />
    </View>
  );
}
