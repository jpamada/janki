import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createLesson } from '@/repositories/lesson.repository';
import { LessonFormData } from '@/schemas/lesson.schema';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import LessonForm from '@/components/lessons/LessonForm';
import * as Crypto from 'expo-crypto';

export default function CreateLessonScreen() {
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const createLessonMutation = useMutation({
    mutationFn: createLesson,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['lessons'],
      });
      router.back();
    },

    onError: (error) => {
      console.error(error);
    },
  });

  const handleLessonSubmit = async (data: LessonFormData) => {
    await createLessonMutation.mutateAsync({
      id: Crypto.randomUUID(),
      title: data.title,
      subjectId: data.subjectId,
    });
  };

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingBottom: insets.bottom }}
    >
      <LessonForm onSubmit={handleLessonSubmit} />
    </View>
  );
}