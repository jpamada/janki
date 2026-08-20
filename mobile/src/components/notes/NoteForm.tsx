import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { noteSchema, type NoteFormData } from '@/schemas/note.schema';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import NoteSectionField from '../note-sections/NoteSectionField';

type NoteFormProps = {
  onSubmit: (data: NoteFormData) => Promise<void>;
  defaultValues?: NoteFormData;
};

export function NoteForm({
  onSubmit,
  defaultValues = {
    title: '',
    noteSections: [],
  },
}: NoteFormProps) {

  const { control, handleSubmit, formState: { errors, isSubmitting }} = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "noteSections",
  });

  const handleFormSubmit = async (data: NoteFormData) => {
    await onSubmit(data);
  };

  return (
    <View className='flex-1'>
      <ScrollView 
        className="flex-1"
        overScrollMode="always"
        showsVerticalScrollIndicator={false}
      >
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

        <View>
          {errors.noteSections?.root?.message && (
            <Text className="mb-2 text-red-400">
              {errors.noteSections.root.message}
            </Text>
          )}

          {fields.map((field, index) => (
            <NoteSectionField
              key={field.id}
              control={control}
              index={index}
              remove={remove}
            />
          ))}
        </View>

        <Pressable
          onPress={() =>
            append({
              title: "",
              position: fields.length,
              noteContents: [],
            })
          }
          className="bg-white px-2 py-2 mt-2 mb-8"
        >
          <Text className="text-center font-semibold text-gray-400">
            Add New Section
          </Text>
        </Pressable>
      </ScrollView>

      <Pressable
        disabled={isSubmitting}
        onPress={handleSubmit(handleFormSubmit)}
        className="mt-auto rounded-lg bg-black px-4 py-3 active:opacity-70 disabled:bg-gray-400"
      >
        <Text className="text-center font-semibold text-white">
          {isSubmitting ? 'Saving...' : 'Save Note'}
        </Text>
      </Pressable>
    </View>
  );
}