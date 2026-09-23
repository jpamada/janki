import { createQuizData } from '@/repositories/quiz.repository';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QuestionFormData } from '@/schemas/question.schema';
import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import QuestionForm from '@/components/questions/QuestionForm';
import { useSnackbar } from '@/providers/SnackbarContext';

export default function CreateQuestionScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { showSnackbar } = useSnackbar();

  const queryClient = useQueryClient();
  
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [createSuccess, setCreateSuccess] = useState(false);

  const createQuestionMutation = useMutation({
    mutationFn: createQuizData,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["questions", lessonId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["quizData", lessonId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["subjects"],
      });
      await handleSuccessMessage();
    },

    onError: (error) => {
      console.error(error.message);
      showSnackbar({ message: "Something went wrong. Please try again." });
    },
  });

  const handleQuestionSubmit = async (data: QuestionFormData) => {
    await createQuestionMutation.mutateAsync({
      type: data.type,
      code: data.code,
      image: data.image,
      answers: data.answers,
      language: data.language,
      question: data.question,
      lessonId: data.lessonId,
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
          code: "",
          image: null,
          question: "",
          language: null,
          lessonId: lessonId,
          type: "multiple_choice",
          answers: [
            {
              answer: "",
              isCorrect: false,
            },
            {
              answer: "",
              isCorrect: false,
            },
          ],
        }}
      />
    </View>
  );
}
