import { ActivityIndicator, Animated, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { FileQuestionMark, Lightbulb, LogOut, Settings, Trophy } from 'lucide-react-native';
import { getQuestionsByLessonIdWithAnswers } from '@/repositories/question.repository';
import { recordAnswer, startOrResumeQuiz } from '@/repositories/progress.repository';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { resetQuizSession } from '@/repositories/quiz.repository';
import { router, useLocalSearchParams } from 'expo-router';
import { logReview } from '@/repositories/logs.repository';
import { useBottomSheet } from '@/hooks/UseBottomSheet';
import { useQuizSfx } from '@/hooks/useQuizSfx';
import { useEffect, useMemo, useState } from 'react';

import EmptyStateScreen from '@/components/shared/EmptyState';
import CodeBlock from '@/components/shared/CodeBlock';
import QuizResults from './results';
import { useQuizSession } from '@/hooks/useQuizSession';

export type UserAnswer = {
  questionId: string;
  answerId: string | null;
  answerText: string;
  isCorrect: boolean;
  correctAnswerId: string | null;
  correctAnswerText: string;
};

export default function QuizScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { playAnswerSfx } = useQuizSfx();
  const insets = useSafeAreaInsets();

  const queryClient = useQueryClient();
  const resultSheet = useBottomSheet();
  const settingSheet = useBottomSheet();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [identificationInput, setIdentificationInput] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const { data: questions = [], isLoading, error } = useQuery({
    queryKey: ['questionsWithAnswers', lessonId],
    queryFn: () => getQuestionsByLessonIdWithAnswers(lessonId),
    enabled: !!lessonId,
  });

  const logReviewMutation = useMutation({
    mutationFn: logReview,

    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ['reviewHeatmap'] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['reviewStats'] 
      });
    },

    onError: (error) => {
      console.error(error.message)
    },
  });

  const recordQuizAnswerMutation = useMutation({
    mutationFn: ({ questionId, correct }: { questionId: string; correct: boolean }) =>
      recordAnswer(questionId, correct),

    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ["subjects"] 
      });
    },

    onError: (error) => {
      console.error(error.message)
    },
  });

  const { 
    quizQuestionIds, 
    quizInitialized, 
    reset: resetQuizQueue 
  } = useQuizSession(
    lessonId,
    questions,
    isLoading,
  );

  const quizQuestions = useMemo(() =>
    quizQuestionIds.flatMap((id) => {
      const question = questions.find((q) => q.id === id);
      return question ? [question] : [];
  }), [quizQuestionIds, questions]);

  const currentQuestion = quizQuestions[currentQuestionIndex];

  const progress = quizQuestions.length > 0
    ? ((currentQuestionIndex + 1) / quizQuestions.length) * 100
    : 0;

  const submitAnswerResult = async (input: {
    correct: boolean;
    answerId: string | null;
    answerText: string;
    correctAnswer: { 
      id: string; 
      answer: string 
    };
  }) => {
    if (!currentQuestion) return;

    playAnswerSfx(input.correct);
    setIsCorrect(input.correct);

    setUserAnswers((previous) => [
      ...previous,
      {
        isCorrect: input.correct,
        questionId: currentQuestion.id,
        answerId: input.answerId,
        answerText: input.answerText,
        correctAnswerId: input.correctAnswer.id,
        correctAnswerText: input.correctAnswer.answer,
      },
    ]);

    await recordQuizAnswerMutation.mutateAsync({
      questionId: currentQuestion.id,
      correct: input.correct,
    });

    await logReviewMutation.mutateAsync({
      questionId: currentQuestion.id,
      isCorrect: input.correct,
    });

    resultSheet.open();
  };

  const handleSelectAnswer = async (answerId: string) => {
    if (!currentQuestion || resultSheet.visible) return;

    const selectedAnswer = currentQuestion.questionAnswers.find(
      (item) => item.answer.id === answerId,
    );
    const correctAnswer = currentQuestion.questionAnswers.find(
      (item) => item.isCorrect,
    );

    if (!selectedAnswer || !correctAnswer) return;

    await submitAnswerResult({
      correct: selectedAnswer.answer.id === correctAnswer.answer.id,
      answerId: selectedAnswer.answer.id,
      answerText: selectedAnswer.answer.answer,
      correctAnswer: correctAnswer.answer,
    });
  };

  const handleSubmitIdentification = async () => {
    if (!currentQuestion || resultSheet.visible || !identificationInput.trim()) return;

    const correctAnswer = currentQuestion.questionAnswers.find(
      (item) => item.isCorrect,
    );
    if (!correctAnswer) return;

    const trimmedInput = identificationInput.trim();
    const correct = trimmedInput.toLowerCase() === correctAnswer.answer.answer.trim().toLowerCase();

    await submitAnswerResult({
      correct,
      answerId: null,
      answerText: trimmedInput,
      correctAnswer: correctAnswer.answer,
    });
  };

  const handleContinue = () => {
    resultSheet.close();

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setIsCorrect(null);
      setIdentificationInput('');
      setCurrentQuestionIndex((previous) => previous + 1);

    } else {
      setIsFinished(true);
    }
  };

  const handleResetQuizSession = async () => {
    try {
      await resetQuizQueue();
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setIsFinished(false);
      setIsCorrect(null);
      setIdentificationInput('');

    } catch (error) {
      console.error(error);
    }
  };

  if (isFinished) {
    return (
      <QuizResults
        questions={quizQuestions}
        userAnswers={userAnswers}
      />
    );
  }

  return (
    <View className="flex-1 bg-white">
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#4b5563" />
        </View>

      ) : !quizInitialized ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#4b5563"
          />
        </View>

      ) : error ? (
        <View className="flex-1 items-center justify-center">
          <Text>
            Failed to load quiz
          </Text>
        </View>

      ) : quizQuestions.length > 0 && currentQuestion ? (
        <>
          <View className="mt-8 flex-row items-center gap-1 p-1">
            <Pressable
              onPress={() =>
                settingSheet.open()
              }
              className="rounded-xl p-3 active:bg-gray-100"
            >
              <Settings
                strokeWidth={2}
                color="#4a5462"
              />
            </Pressable>

            <View className="me-3 h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
              <View
                className="h-full bg-gray-600"
                style={{
                  width: `${progress}%`,
                }}
              />
            </View>
          </View>

          <KeyboardAwareScrollView
            bottomOffset={20}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            className="p-4"
          >
            {currentQuestion.code ? (
              <View className="gap-4">
                <View className="rounded-lg">
                  <Text className="text-xl font-semibold">
                    {currentQuestion.question}
                  </Text>
                </View>

                <View className="w-auto p-2">
                  <CodeBlock
                    code={currentQuestion.code}
                    language={currentQuestion.language}
                  />
                </View>
              </View>
            ) : (
              <View className="flex-1 justify-center">
                <View className="rounded-lg bg-white p-6">
                  <Text className="text-center text-xl font-semibold">
                    {currentQuestion.question}
                  </Text>
                </View>
              </View>
            )}

            <Modal
              transparent
              animationType="none"
              visible={resultSheet.visible}
              onRequestClose={
                handleContinue
              }
            >
              <View className="flex-1 justify-end">
                <Animated.View
                  className="absolute inset-0 bg-black/40"
                  style={{ opacity: resultSheet.backdropOpacity }}
                >
                  <Pressable
                    className="flex-1"
                    onPress={
                      handleContinue
                    }
                  />
                </Animated.View>

                <Animated.View
                  style={{ transform: [{ translateY: resultSheet.translateY }]}}
                  className="rounded-t-3xl bg-white"
                >
                  <View className="p-6">
                    <Text className="text-3xl font-bold text-gray-800">
                      {isCorrect
                        ? 'Correct!'
                        : 'Incorrect'}
                    </Text>

                    {!isCorrect && (
                      <View className="mt-6">
                        <Text className="text-lg font-semibold text-gray-400">
                          Correct Answer
                        </Text>

                        <Text className="mt-2 text-lg font-semibold">
                          {
                            currentQuestion.questionAnswers.find(
                              (item) => item.isCorrect,
                            )?.answer.answer
                          }
                        </Text>
                      </View>
                    )}

                    <Pressable
                      onPress={handleContinue}
                      className="mt-8 rounded-lg bg-gray-600 p-4 active:bg-gray-700"
                    >
                      <Text className="text-center text-lg font-semibold text-white">
                        {currentQuestionIndex <
                        quizQuestions.length - 1
                          ? 'Continue'
                          : 'Finish'}
                      </Text>
                    </Pressable>
                  </View>

                  <View style={{ height: insets.bottom }} />
                </Animated.View>
              </View>
            </Modal>

            <Modal
              transparent
              animationType="none"
              visible={settingSheet.visible}
              onRequestClose={() => settingSheet.close()}
            >
              <View className="flex-1 justify-end">
                <Animated.View
                  className="absolute inset-0 bg-black/40"
                  style={{ opacity: settingSheet.backdropOpacity }}
                >
                  <Pressable
                    className="flex-1"
                    onPress={() => settingSheet.close()}
                  />
                </Animated.View>

                <Animated.View
                  style={{ transform: [{ translateY: settingSheet.translateY }]}}
                  className="rounded-3xl bg-gray-50 px-4 py-6"
                >
                  <Pressable
                    onPress={() => {
                      settingSheet.close();
                      router.push({
                        pathname: "/questions/create",
                        params: { lessonId: lessonId },
                      });
                    }}
                    className="flex-row items-center gap-2 rounded-t-xl bg-white p-4 active:bg-gray-100"
                  >
                    <Lightbulb size={16} />
                    <Text className="text-xl">
                      Add Question
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      settingSheet.close();
                      router.push({
                        pathname: "/questions/browse",
                        params: { lessonId: lessonId },
                      });
                    }}
                    className="flex-row items-center gap-2 bg-white p-4 active:bg-gray-100"
                  >
                    <Lightbulb size={16} />
                    <Text className="text-xl">
                      Browse Questions
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      settingSheet.close();
                      router.back();
                    }}
                    className="flex-row items-center gap-2 rounded-b-xl bg-white p-4 active:bg-gray-100"
                  >
                    <LogOut size={16} />

                    <Text className="text-xl">
                      Give Up
                    </Text>
                  </Pressable>

                  <View style={{ height: insets.bottom }}
                  />
                </Animated.View>
              </View>
            </Modal>
          </KeyboardAwareScrollView>
        </>

      ) : (quizInitialized && questions.length > 0 && quizQuestionIds.length === 0) ? (
        <View className="flex-1 items-center justify-center gap-6 p-6">
          <Trophy color="#4b5563" size={72} />
          <Text className="text-center text-xl font-semibold text-gray-700">
            You've answered every question correctly
          </Text>

          <Pressable
            onPress={handleResetQuizSession}
            className="rounded-xl bg-gray-600 px-8 py-4 active:bg-gray-700"
          >
            <Text className="text-center text-lg font-semibold text-white">
              Answer Again
            </Text>
          </Pressable>
        </View>

      ) : (
        <EmptyStateScreen
          title="No Questions Available"
          icon={
            <FileQuestionMark color="#4b5563" size={72} />
          }
          navigate={{
            pathname: "/questions/create",
            params: { lessonId },
          }}
        />
      )}

      {currentQuestion && (
        <KeyboardStickyView offset={{ closed: 0, opened: insets.top }}>
          <View
            className="gap-4 bg-white p-4"
            style={{ paddingBottom: insets.bottom }}
          >
            {currentQuestion.type === 'multiple_choice' ? (
              currentQuestion.questionAnswers.map(
                (item) => (
                  <Pressable
                    key={item.answer.id}
                    disabled={resultSheet.visible}
                    onPress={() => handleSelectAnswer(item.answer.id)}
                    className="rounded-xl bg-gray-600 p-4 active:bg-gray-700"
                  >
                    <Text className="text-center text-lg font-semibold text-white">
                      {item.answer.answer}
                    </Text>
                  </Pressable>
                ),
              )

            ) : (
              <>
                <TextInput
                  value={
                    identificationInput
                  }
                  onChangeText={
                    setIdentificationInput
                  }
                  editable={
                    !resultSheet.visible
                  }
                  placeholder="Type your answer"
                  autoCapitalize="none"
                  className="rounded-xl bg-gray-100 px-4 py-4 text-lg font-semibold"
                />

                <Pressable
                  disabled={
                    resultSheet.visible ||
                    !identificationInput.trim()
                  }
                  onPress={
                    handleSubmitIdentification
                  }
                  className="rounded-xl bg-gray-600 p-4 active:bg-gray-700 disabled:bg-gray-300"
                >
                  <Text className="text-center text-lg font-semibold text-white">
                    Submit
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </KeyboardStickyView>
      )}
    </View>
  );
}