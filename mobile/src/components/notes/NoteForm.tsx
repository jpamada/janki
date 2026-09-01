import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { noteSchema, type NoteFormData } from '@/schemas/note.schema';
import { Controller,  useForm } from 'react-hook-form';
import { Pressable, Text, TextInput, View } from 'react-native';
import { ArrowLeft, Form, Plus, X } from 'lucide-react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';

import Header from '../shared/Header';

type NoteFormProps = {
  onSubmit: (data: NoteFormData) => Promise<void>;
  isEditing: boolean;
  defaultValues?: NoteFormData;
};

export default function NoteForm({
  onSubmit,
  isEditing,
  defaultValues = {
    title: "Untitled",
    folderId: null,
    subfolderId: null,
  },
}: NoteFormProps) {

  const { control, handleSubmit, formState: { errors, isSubmitting }} = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues,
  });

  const handleFormSubmit = async (data: NoteFormData) => {
    await onSubmit(data);
  };

  return (
    <View className="flex gap-6">
      <Text className="text-xl font-bold">
        {isEditing ? 'Rename Note' : 'Create Note'}
      </Text>

      <Controller
        name="title"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="flex flex-col gap-2">
            <Text className="text-gray-400 font-semibold">Title</Text>

            <TextInput
              multiline
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder=""
              className='bg-gray-100 rounded-xl text-lg text-gray-600 px-2 py-4'
            />

            {errors.title && (
              <Text className="text-red-400">{errors.title.message}</Text>
            )}
          </View>
        )}
      />

      <Pressable
        disabled={isSubmitting}
        onPress={handleSubmit(handleFormSubmit)}
        className="bg-gray-800 rounded-full px-4 py-3 mt-2 active:opacity-70 disabled:bg-gray-400"
      >
        <Text className="text-white text-center font-semibold">
          {isEditing ? 'Rename' : 'Create Note'}
        </Text>
      </Pressable>
    </View>
  );
}