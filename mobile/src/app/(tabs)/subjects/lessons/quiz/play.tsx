import { getQuestionsByLessonIdWithAnswers } from '@/repositories/question.repository';
import { ActivityIndicator, Animated, Modal, Pressable, Text, View } from 'react-native';
import { mapQuestionsWithAnswers } from '@/mappers/question.mapper';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import QuizResults from './results';

type UserAnswer = {
  questionId: string;
  answerId: string;
  isCorrect: boolean;
  correctAnswerId: string;
};

export default function QuizScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();

  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const translateY = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: showFeedback ? 0 : 300,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [showFeedback, translateY]);

  const { data: rows = [], isPending, isError, error } = useQuery({
    queryKey: ['playQuestions', lessonId],
    queryFn: () => getQuestionsByLessonIdWithAnswers(lessonId),
    enabled: !!lessonId,
  });

  const questions = mapQuestionsWithAnswers(rows);
  const currentQuestion = questions[currentQuestionIndex];

  const progress = questions.length > 0
    ? ((currentQuestionIndex + 1) / questions.length) * 100
    : 0;

  function handleSelectAnswer(answerId: string) {
    if (!currentQuestion || showFeedback) {
      return;
    }

    const selectedAnswer = currentQuestion.answers.find((answer) => answer.id === answerId);
    const correctAnswer = currentQuestion.answers.find((answer) => answer.isCorrect);

    if (!selectedAnswer || !correctAnswer) {
      return;
    }

    const correct = selectedAnswer.id === correctAnswer.id;

    setSelectedAnswerId(answerId);
    setIsCorrect(correct);
    setUserAnswers((previous) => [
      ...previous,
      {
        questionId: currentQuestion.id,
        answerId: selectedAnswer.id,
        isCorrect: correct,
        correctAnswerId: correctAnswer.id,
      },
    ]);
    setShowFeedback(true);
  }

  function handleContinue() {
    setShowFeedback(false);

    if (currentQuestionIndex < questions.length - 1) {
      setSelectedAnswerId(null);
      setIsCorrect(null);
      setCurrentQuestionIndex((previous) => previous + 1);
    } else {
      setIsFinished(true);
    }
  }

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="mt-4">Loading quiz...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-lg font-semibold">Failed to load quiz</Text>
        <Text className="mt-2 text-red-500">{error.message}</Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-xl font-semibold">No Questions Available</Text>
        <Text className="mt-2 text-gray-500">This lesson doesn't have any questions yet.</Text>
      </View>
    );
  }

  if (isFinished) {
    return <QuizResults questions={questions} userAnswers={userAnswers} />;
  }

  return (
    <View className="flex-1 bg-white p-4">
      <View className="mb-8">
        <View className="h-3 overflow-hidden rounded-full bg-gray-200">
          <View className="h-full bg-purple-800" style={{ width: `${progress}%` }} />
        </View>
      </View>

      <View className="mt-auto mb-8 rounded-lg bg-gray-100 p-6">
        <Text className="text-center text-xl font-semibold">{currentQuestion.question}</Text>
      </View>

      <View className="mt-auto gap-4">
        {currentQuestion.answers.map((answer) => {
          const isSelected = answer.id === selectedAnswerId;
          let backgroundClass = 'bg-purple-800';

          if (showFeedback) {
            if (isSelected && isCorrect) {
              backgroundClass = 'bg-green-600';
            } else if (isSelected && !isCorrect) {
              backgroundClass = 'bg-red-600';
            } else {
              backgroundClass = 'bg-gray-300';
            }
          }

          return (
            <Pressable
              key={answer.id}
              disabled={showFeedback}
              onPress={() => handleSelectAnswer(answer.id)}
              className={`rounded-lg p-5 ${backgroundClass}`}
            >
              <Text className="text-center text-lg font-semibold text-white">{answer.answer}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Feedback sheet: plain Modal + Animated, no native module involved */}
      <Modal visible={showFeedback} transparent animationType="none" onRequestClose={handleContinue}>
        <View className="flex-1 justify-end bg-black/40">
          <Animated.View
            style={{ transform: [{ translateY }] }}
            className="rounded-t-3xl bg-white p-6"
          >
            <Text className={`text-3xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </Text>

            {!isCorrect && (
              <View className="mt-6">
                <Text className="text-lg font-bold text-red-600">Correct Answer</Text>
                <Text className="mt-2 text-lg font-semibold">
                  {currentQuestion.answers.find((answer) => answer.isCorrect)?.answer}
                </Text>
              </View>
            )}

            <Pressable
              onPress={handleContinue}
              className={`mt-8 rounded-lg p-4 ${isCorrect ? 'bg-green-600' : 'bg-red-600'}`}
            >
              <Text className="text-center text-lg font-semibold text-white">
                {currentQuestionIndex < questions.length - 1 ? 'Continue' : 'Finish'}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}