import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { noteSchema, type NoteFormData } from '@/schemas/note.schema';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Pressable, Text, TextInput, View } from 'react-native';
import { ArrowLeft, Form, Plus, X } from 'lucide-react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';

import NoteSectionField from '../note-sections/NoteSectionField';
import Header from '../shared/Header';

type NoteFormProps = {
  onSubmit: (data: NoteFormData) => Promise<void>;
  defaultValues?: NoteFormData;
};

type ActiveContent = {
  sectionIndex: number;
  contentIndex: number;
} | null;

export default function NoteForm({
  onSubmit,
  defaultValues = {
    title: '',
    folderId: '',
    subfolderId: '',
    noteSections: [],
  },
}: NoteFormProps) {

  const [fabVisible, setFabVisible] = useState(false);
  const [activeContent, setActiveContent] = useState<ActiveContent>(null);

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
      <Header 
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

      <KeyboardAwareScrollView
        bottomOffset={80}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-4 pb-24"
      >
        <Controller
          name="title"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <TextInput
                multiline
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

        <View className='flex flex-col gap-4'>
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
              onContentFocus={(contentIndex) => {
                setActiveContent({ sectionIndex: index, contentIndex });
              }}
              onContentBlur={() => setActiveContent(null)}
            />
          ))}
        </View>
      </KeyboardAwareScrollView>

      {activeContent && (
        <KeyboardStickyView>
          <View className="h-12 flex-row items-center border-t border-gray-200 bg-white px-4">
          </View>
        </KeyboardStickyView>
      )}

      {fabVisible && (
        <Pressable
          className="absolute inset-0"
          onPress={() => setFabVisible(false)}
        />
      )}

      <View className="absolute bottom-6 right-6 items-end">
        {fabVisible && (
          <View className="mb-3 items-end gap-3">
            <Pressable
              onPress={() =>
                append({
                  title: "",
                  position: fields.length,
                  noteContents: [],
              })}
              className="flex-row items-center gap-1 rounded-full bg-white px-4 py-3"
              style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)' }}
            >
              <Form size={20} color="#4b5563" />
              <Text className="font-semibold text-gray-700">New Section</Text>
            </Pressable>
          </View>
        )}

        <Pressable
          onPress={() => setFabVisible((prev) => !prev)}
          className="h-14 w-14 items-center justify-center rounded-full bg-white"
          style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)' }}
        >
          {fabVisible ? (
            <X size={24} color="#4b5563" />
          ) : (
            <Plus size={24} color="#4b5563" />
          )}
        </Pressable>
      </View>
    </View>
  );
}