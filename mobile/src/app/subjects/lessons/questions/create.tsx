import { createQuestionWithAnswers } from '@/repositories/question.repository';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QuestionFormData } from '@/schemas/question.schema';
import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import QuestionForm from '@/components/questions/QuestionForm';

export default function CreateQuestionScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();

  const queryClient = useQueryClient();
  
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [createSuccess, setCreateSuccess] = useState(false);

  const createQuestionMutation = useMutation({
    mutationFn: createQuestionWithAnswers,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["questions", lessonId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["questionsWithAnswers", lessonId],
      });
      await handleSuccessMessage();
    },

    onError: (error) => {
      console.error(error.message);
    },
  });

  const handleQuestionSubmit = async (data: QuestionFormData) => {
    await createQuestionMutation.mutateAsync({
      question: data.question,
      lessonId: data.lessonId,
      answers: data.answers,
    });
  };

  const handleSuccessMessage = async () => {
    setCreateSuccess(true);

    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }

    successTimeoutRef.current = setTimeout(() => {
      setCreateSuccess(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  return (
    <View className="flex-1 bg-white">
      <QuestionForm
        onSubmit={handleQuestionSubmit}
        onCreateSuccess={createSuccess}
        defaultValues={{
          question: '',
          lessonId: lessonId,
          answers: [
            { answer: '', isCorrect: false },
            { answer: '', isCorrect: false },
          ],
        }}
      />
    </View>
  );
}
