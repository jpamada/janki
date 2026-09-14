import { ActivityIndicator, Animated, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { getQuestionsByLessonIdWithAnswers } from '@/repositories/question.repository';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { FileQuestionMark, Lightbulb, LogOut, Settings, X } from 'lucide-react-native';
import { useBottomSheet } from '@/hooks/UseBottomSheet';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import EmptyStateScreen from '@/components/shared/EmptyState';
import QuizResults from './results';
import { logReview } from '@/repositories/logs.repository';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import CodeBlock from '@/components/shared/CodeBlock';

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

  const {
    backdropOpacity: resultBackdropOpacity,
    open: openResultSheet,
    close: closeResultSheet,
    visible: resultSheetVisible,
    translateY: resultSheetTranslateY,
  } = useBottomSheet();

  const settingSheet = useBottomSheet();

  const insets = useSafeAreaInsets();

  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [identificationInput, setIdentificationInput] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const { data: questions = [], isLoading, error } = useQuery({
    queryKey: ["questionsWithAnswers", lessonId],
    queryFn: () => getQuestionsByLessonIdWithAnswers(lessonId),
    enabled: !!lessonId,
  });

  const queryClient = useQueryClient();
  const logReviewMutation = useMutation({
    mutationFn: logReview,

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['reviewHeatmap'] });
      await queryClient.invalidateQueries({ queryKey: ['reviewStats'] });
    },

    onError: (error) => {
      console.error(error.message);
    },
  });

  const currentQuestion = questions[currentQuestionIndex];

  const progress = questions.length > 0
    ? ((currentQuestionIndex + 1) / questions.length) * 100
    : 0;

  const handleSelectAnswer = async (answerId: string) => {
    if (!currentQuestion || resultSheetVisible) {
      return;
    }

    const selectedAnswer = currentQuestion.questionAnswers.find(
      (item) => item.answer.id === answerId
    );

    const correctAnswer = currentQuestion.questionAnswers.find(
      (item) => item.isCorrect
    );

    if (!selectedAnswer || !correctAnswer) {
      return;
    }

    const correct = selectedAnswer.answer.id === correctAnswer.answer.id;

    setIsCorrect(correct);
    setSelectedAnswerId(answerId);

    setUserAnswers((previous) => [
      ...previous,
      {
        isCorrect: correct,
        answerId: selectedAnswer.answer.id,
        answerText: selectedAnswer.answer.answer,
        questionId: currentQuestion.id,
        correctAnswerId: correctAnswer.answer.id,
        correctAnswerText: correctAnswer.answer.answer,
      },
    ]);

    await logReviewMutation.mutateAsync({
      questionId: currentQuestion.id,
      isCorrect: correct,
    });

    openResultSheet();
  };

  const handleSubmitIdentification = async () => {
    if (
      !currentQuestion ||
      resultSheetVisible ||
      !identificationInput.trim()
    ) {
      return;
    }

    const correctAnswer = currentQuestion.questionAnswers.find(
      (item) => item.isCorrect
    );

    if (!correctAnswer) {
      return;
    }

    const correct =
      identificationInput.trim().toLowerCase() ===
      correctAnswer.answer.answer.trim().toLowerCase();

    setIsCorrect(correct);

    setUserAnswers((previous) => [
      ...previous,
      {
        isCorrect: correct,
        answerId: null,
        answerText: identificationInput.trim(),
        questionId: currentQuestion.id,
        correctAnswerId: correctAnswer.answer.id,
        correctAnswerText: correctAnswer.answer.answer,
      },
    ]);

    await logReviewMutation.mutateAsync({
      questionId: currentQuestion.id,
      isCorrect: correct,
    });

    openResultSheet();
  };

  const handleContinue = () => {
    closeResultSheet();

    if (currentQuestionIndex < questions.length - 1) {
      setIsCorrect(null);
      setSelectedAnswerId(null);
      setIdentificationInput('');
      setCurrentQuestionIndex((previous) => previous + 1);

    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <QuizResults
        questions={questions}
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

      ) : error ? (
        <View className="flex-1 items-center justify-center">
          <Text>Failed to load quiz</Text>
        </View>

      ) : questions.length > 0 && currentQuestion ? (
        <>
          <View className="flex-row items-center gap-1 p-1 mt-8">
            <Pressable
              onPress={() => settingSheet.open()}
              className="p-3 rounded-xl active:bg-gray-100"
            >
              <Settings strokeWidth={2} color="#4a5462" />
            </Pressable>

            <View className="h-3 me-3 flex-1 overflow-hidden rounded-full bg-gray-100">
              <View
                className="h-full bg-gray-600"
                style={{ width: `${progress}%` }}
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
                <View className="rounded-lg ">
                  <Text className="text-xl font-semibold">
                    {currentQuestion.question}
                  </Text>
                </View>

                {currentQuestion.code && (
                  <View className='p-2 w-auto'>
                    <CodeBlock
                    code={currentQuestion.code}
                    language={currentQuestion.language}
                  />
                  </View>
                )}
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
              visible={resultSheetVisible}
              onRequestClose={handleContinue}
            >
              <View className="flex-1 justify-end">
                <Animated.View
                  className="absolute inset-0 bg-black/40"
                  style={{ opacity: resultBackdropOpacity }}
                >
                  <Pressable
                    className="flex-1"
                    onPress={handleContinue}
                  />
                </Animated.View>

                <Animated.View
                  style={{ transform: [{ translateY: resultSheetTranslateY }] }}
                  className="rounded-t-3xl bg-white"
                >
                  <View className="p-6">
                    <Text className="text-3xl font-bold text-gray-800">
                      {isCorrect ? "Correct!" : "Incorrect"}
                    </Text>

                    {!isCorrect && (
                      <View className="mt-6">
                        <Text className="text-lg font-semibold text-gray-400">
                          Correct Answer
                        </Text>

                        <Text className="mt-2 text-lg font-semibold">
                          {
                            currentQuestion.questionAnswers.find(
                              (item) => item.isCorrect
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
                        {currentQuestionIndex < questions.length - 1
                          ? "Continue"
                          : "Finish"}
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
                  style={{ transform: [{ translateY: settingSheet.translateY }] }}
                  className="rounded-3xl bg-gray-50 px-4 py-6"
                >
                  <Pressable
                    onPress={() => {
                      settingSheet.close();
                      router.push({
                        pathname: `/questions/create`,
                        params: { lessonId: lessonId }
                      })
                    }}
                    className="flex-row items-center gap-2 p-4 bg-white rounded-t-xl active:bg-gray-100"
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
                        pathname: `/questions/browse`,
                        params: { lessonId: lessonId }
                      })
                    }}
                    className="flex-row items-center gap-2 p-4 bg-white active:bg-gray-100"
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
                    className="flex-row items-center gap-2 p-4 bg-white rounded-b-xl active:bg-gray-100"
                  >
                    <LogOut size={16} />
                    <Text className="text-xl">
                      Give Up
                    </Text>
                  </Pressable>

                  <View style={{ height: insets.bottom }} />
                </Animated.View>
              </View>
            </Modal>
          </KeyboardAwareScrollView>
        </>
      ) : (
        <EmptyStateScreen
          title="No Questions Available"
          icon={<FileQuestionMark color="#4b5563" size={72} />}
          navigate={{
            pathname: "/questions/create",
            params: { lessonId },
          }}
        />
      )}

      {currentQuestion && (
        <KeyboardStickyView
          offset={{ closed: 0, opened: insets.top }}
        >
          <View
            className="gap-4 p-4 bg-white"
            style={{ paddingBottom: insets.bottom }}
          >
            {currentQuestion.type === 'multiple_choice' ? (
              currentQuestion.questionAnswers.map((item) => (
                <Pressable
                  key={item.answer.id}
                  disabled={resultSheetVisible}
                  onPress={() => handleSelectAnswer(item.answer.id)}
                  className="rounded-xl bg-gray-600 p-4 active:bg-gray-700"
                >
                  <Text className="text-center text-lg font-semibold text-white">
                    {item.answer.answer}
                  </Text>
                </Pressable>
              ))
            ) : (
              <>
                <TextInput
                  value={identificationInput}
                  onChangeText={setIdentificationInput}
                  editable={!resultSheetVisible}
                  placeholder="Type your answer"
                  autoCapitalize="none"
                  className="rounded-xl bg-gray-100 px-4 py-4 text-lg font-semibold"
                />

                <Pressable
                  disabled={
                    resultSheetVisible ||
                    !identificationInput.trim()
                  }
                  onPress={handleSubmitIdentification}
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