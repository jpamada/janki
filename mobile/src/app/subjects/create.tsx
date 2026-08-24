import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSubject } from '@/repositories/subject.repository';
import { SubjectFormData } from '@/schemas/subject.schema';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import SubjectForm from '@/components/subjects/SubjectForm';
import * as Crypto from 'expo-crypto';

export default function CreateSubjectScreen() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const createSubjectMutation = useMutation({
    mutationFn: createSubject,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['subjects'],
      });
      router.back();
    },

    onError: (error) => {
      console.error(error);
    },
  });

  const handleSubjectSubmit = async (data: SubjectFormData) => {
    await createSubjectMutation.mutateAsync({
      id: Crypto.randomUUID(),
      title: data.title,
      category: data.category,
    });
  };

  return (
    <View className="flex-1">
      <SubjectForm onSubmit={handleSubjectSubmit} />
    </View>
  );
}
