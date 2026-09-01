import { ActivityIndicator, Animated, Modal, Pressable, Text, View } from 'react-native';
import { getQuestionsByLessonIdWithAnswers } from '@/repositories/question.repository';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { FileQuestionMark, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import EmptyStateScreen from '@/components/shared/EmptyState';
import QuizResults from './results';

export type UserAnswer = {
  questionId: string;
  answerId: string;
  isCorrect: boolean;
  correctAnswerId: string;
};

export default function QuizScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const insets = useSafeAreaInsets();

  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const translateY = useRef(new Animated.Value(300)).current;

  const { data: questions = [], isLoading, error } = useQuery({
    queryKey: ['questions', lessonId],
    queryFn: () => getQuestionsByLessonIdWithAnswers(lessonId),
    enabled: !!lessonId,
  });

  const currentQuestion = questions[currentQuestionIndex];

  const progress = questions.length > 0
    ? ((currentQuestionIndex + 1) / questions.length) * 100
    : 0;

  const handleSelectAnswer = (answerId: string) => {
    if (!currentQuestion || showFeedback) {
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
        questionId: currentQuestion.id,
        correctAnswerId: correctAnswer.answer.id,
      },
    ]);

    setShowFeedback(true);
  };

  const handleContinue = () => {
    setShowFeedback(false);

    if (currentQuestionIndex < questions.length - 1) {
      setIsCorrect(null);
      setSelectedAnswerId(null);
      setCurrentQuestionIndex((previous) => previous + 1);
      
    } else {
      setIsFinished(true);
    }
  };

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: showFeedback ? 0 : 300,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [showFeedback, translateY]);

  if (isFinished) {
    return (
      <QuizResults
        questions={questions}
        userAnswers={userAnswers}
      />
    );
  }

  return (
    <View className="flex-1">
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#4b5563" />
        </View>

      ) : error ? (
        <View className="flex-1 items-center justify-center">
          <Text>Failed to load quiz</Text>
        </View>

      ) : questions.length > 0 && currentQuestion ? (
        <View
          className="flex-1 bg-white"
          style={{
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          }}
        >
          <View className="flex-row items-center gap-1 p-1">
            <Pressable 
              onPress={() => router.back()}
              className='p-3 rounded-full active:bg-gray-100'
            >
              <X strokeWidth={4} color="#1f2937" />
            </Pressable>

            <View className="h-3 me-3 flex-1 overflow-hidden rounded-full bg-gray-200">
              <View
                className="h-full bg-gray-800"
                style={{ width: `${progress}%` }}
              />
            </View>
          </View>

          <View className="mb-8 mt-auto rounded-lg bg-gray-100 p-6 mx-4">
            <Text className="text-center text-xl font-semibold">
              {currentQuestion.question}
            </Text>
          </View>

          <View className="mt-auto gap-4 p-4">
            {currentQuestion?.questionAnswers?.map((item) => (
              <Pressable
                key={item?.answer?.id}
                disabled={showFeedback}
                onPress={() => handleSelectAnswer(item?.answer?.id)}
                className="rounded-xl bg-gray-800 p-4 active:bg-gray-700"
              >
                <Text className="text-center text-lg font-semibold text-white">
                  {item?.answer?.answer}
                </Text>
              </Pressable>
            ))}
          </View>

          <Modal
            transparent
            animationType="none"
            visible={showFeedback}
            onRequestClose={handleContinue}
          >
            <View className="flex-1 justify-end bg-black/40">
              <Animated.View
                style={{ transform: [{ translateY }] }}
                className="rounded-t-3xl bg-white p-6"
              >
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
                        currentQuestion?.questionAnswers?.find(
                          (item) => item?.isCorrect
                        )?.answer?.answer
                      }
                    </Text>
                  </View>
                )}

                <Pressable
                  onPress={handleContinue}
                  className="mt-8 rounded-lg bg-gray-800 p-4 active:bg-gray-700"
                >
                  <Text className="text-center text-lg font-semibold text-white">
                    {currentQuestionIndex < questions.length - 1
                      ? "Continue"
                      : "Finish"}
                  </Text>
                </Pressable>
              </Animated.View>
            </View>
          </Modal>
        </View>

      ) : (
        <EmptyStateScreen
          icon={<FileQuestionMark color="#9ca3af" size={72} />}
          navigate={{
            pathname: "/subjects/lessons/questions/create",
            params: { lessonId },
          }}
          title="No Questions Available"
        />
      )}
    </View>
  );
}