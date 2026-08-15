import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createSubject } from '@/repositories/subject.repository';
import { SubjectForm } from '@/components/subjects/SubjectForm';
import { SubjectFormData } from '@/schemas/subject.schema';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import * as Crypto from 'expo-crypto';

export default function CreateSubjectScreen() {
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
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
    <View
      className="flex-1 bg-white p-4 mb-4"
      style={{ paddingBottom: insets.bottom }}
    >
      <SubjectForm onSubmit={handleSubjectSubmit} />
    </View>
  );
}
