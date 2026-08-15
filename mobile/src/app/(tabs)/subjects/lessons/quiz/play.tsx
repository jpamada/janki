import { getQuestionsByLessonIdWithAnswers } from '@/repositories/question.repository';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { mapQuestionsWithAnswers } from '@/mappers/question.mapper';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import QuizResults from './results';
import { useState } from 'react';

export type UserAnswer = {
  questionId: string;
  answerId: string;
  isCorrect: boolean;
  correctAnswerId: string;
};

export default function QuizScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();

  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

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

    const selectedAnswer = currentQuestion.answers.find(
      (answer) => answer.id === answerId,
    );

    const correctAnswer = currentQuestion.answers.find(
      (answer) => answer.isCorrect,
    );

    if (!selectedAnswer || !correctAnswer) {
      return;
    }

    const correct = selectedAnswer.id === correctAnswer.id;

    setSelectedAnswerId(answerId);
    setIsCorrect(correct);
    setShowFeedback(true);

    setUserAnswers((previous) => [
      ...previous, 
      {
        questionId: currentQuestion.id,
        answerId: selectedAnswer.id,
        isCorrect: correct,
        correctAnswerId: correctAnswer.id,
      },
    ]);
  }

  function handleContinue() {
    setShowFeedback(false);
    setSelectedAnswerId(null);
    setIsCorrect(null);

    if (
      currentQuestionIndex <
      questions.length - 1

    ) {
      setCurrentQuestionIndex(
        (previous) => previous + 1,
      );

    } else {
      setIsFinished(true);
    }
  }

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />

        <Text className="mt-4">
          Loading quiz...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-lg font-semibold">
          Failed to load quiz
        </Text>

        <Text className="mt-2 text-red-500">
          {error.message}
        </Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-xl font-semibold">
          No Questions Available
        </Text>

        <Text className="mt-2 text-gray-500">
          This lesson doesn't have any questions yet.
        </Text>
      </View>
    );
  }

  if (isFinished) {
    return (
      <QuizResults
        questions={questions}
        userAnswers={userAnswers}
      />
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <View className="mb-8">
        <View className="h-3 overflow-hidden rounded-full bg-gray-200">
          <View
            className="h-full bg-purple-800"
            style={{
              width: `${progress}%`,
            }}
          />
        </View>
      </View>

      <View className="mb-8 rounded-lg bg-gray-100 p-6 mt-auto">
        <Text className="text-center text-xl font-semibold">
          {currentQuestion.question}
        </Text>
      </View>

      <View className="gap-4 mt-auto">
        {currentQuestion.answers.map((answer) => {
          const isSelected =
            answer.id === selectedAnswerId;

          let backgroundClass =
            'bg-purple-800';

          if (showFeedback) {
            if (isSelected && isCorrect) {
              backgroundClass =
                'bg-green-600';
            } else if (isSelected && !isCorrect) {
              backgroundClass =
                'bg-red-600';
            } else {
              backgroundClass =
                'bg-gray-300';
            }
          }

          return (
            <Pressable
              key={answer.id}
              disabled={showFeedback}
              onPress={() =>
                handleSelectAnswer(answer.id)
              }
              className={`rounded-lg p-5 ${backgroundClass}`}
            >
              <Text className="text-center text-lg font-semibold text-white">
                {answer.answer}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {showFeedback && (
        <View className="mt-auto pt-8">
          <View
            className={`mb-4 rounded-lg p-4 ${
              isCorrect
                ? 'bg-green-100'
                : 'bg-red-100'
            }`}
          >
            <Text
              className={`text-xl font-bold ${
                isCorrect
                  ? 'text-green-700'
                  : 'text-red-700'
              }`}
            >
              {isCorrect
                ? 'Correct!'
                : 'Incorrect'}
            </Text>

            {!isCorrect && (
              <Text className="mt-2 text-red-700">
                Correct answer:{' '}
                {
                  currentQuestion.answers.find(
                    (answer) =>
                      answer.isCorrect,
                  )?.answer
                }
              </Text>
            )}
          </View>

          <Pressable
            onPress={handleContinue}
            className="rounded-lg bg-black p-4"
          >
            <Text className="text-center font-semibold text-white">
              {currentQuestionIndex <
              questions.length - 1
                ? 'Continue'
                : 'Finish'}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}