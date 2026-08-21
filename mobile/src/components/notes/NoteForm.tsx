import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { noteSchema, type NoteFormData } from '@/schemas/note.schema';
import NoteSectionField from '../note-sections/NoteSectionField';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';

import Header from '../shared/Header';

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

  const title = useWatch({
    control,
    name: "title",
  });

  const handleFormSubmit = async (data: NoteFormData) => {
    await onSubmit(data);
  };

  return (
    <View className='flex-1'>
      <Header 
        title={title}
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
            <Text className="text-center font-semibold">
              SAVE
            </Text>
          </Pressable>
        }
      />

      <ScrollView 
        overScrollMode="always"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-4 pb-8"
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
    </View>
  );
}