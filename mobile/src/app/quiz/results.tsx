import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CircleCheck, CircleX } from 'lucide-react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Text, View } from 'react-native';
import { router } from 'expo-router';

import DebouncedPressable from '@/components/shared/DebouncedPressable';

export type QuizResults = {
  questionId: string;
  answerId: string | null;
  answerText: string;
  isCorrect: boolean;
  correctAnswerId: string | null;
  correctAnswerText: string;
};

type QuizResultsProps = {
  questions: {
    id: string;
    type: 'multiple_choice' | 'identification';
    question: string;
    code: string | null;
    language: string | null;
    questionAnswers: {
      id: string;
      answerId: string;
      isCorrect: boolean;
      answer: {
        id: string;
        answer: string;
      };
    }[];
  }[];
  quizResults: QuizResults[];
};

export default function QuizResultsScreen({
  questions,
  quizResults,
}: QuizResultsProps) {

  const insets = useSafeAreaInsets();

  const score = questions.filter(
    (question) => {
      return [...quizResults].reverse().find(
        (answer) => answer.questionId === question.id,
      )?.isCorrect;
    }
  ).length;

  return (
    <View
      className="flex-1 bg-white p-4"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <View className="flex-row items-center justify-between pt-4">
        <Text className="mb-2 text-3xl font-bold">
          Results
        </Text>

        <DebouncedPressable
          onPress={() => router.back()}
          className="rounded-lg bg-gray-600 px-3 py-2 active:bg-gray-700"
        >
          <Text className="text-center font-semibold text-white">
            Finish Quiz
          </Text>
        </DebouncedPressable>
      </View>

      <Text className="mb-8 text-xl font-semibold">
        Score: {score} / {questions.length}
      </Text>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {questions.map((question, index) => {
          const userAnswer = [...quizResults].reverse().find(
            (answer) => answer.questionId === question.id,
          );

          return (
            <View
              key={question.id}
              className="mb-6 rounded-lg bg-gray-100 p-4"
            >
              <View className="mb-4 flex-row justify-between">
                <Text className="font-bold">
                  Question {index + 1}
                </Text>

                {userAnswer?.isCorrect
                  ? <CircleCheck size={18} />
                  : <CircleX size={18} />}
              </View>

              <Text className="mb-4 font-semibold">
                {question.question}
              </Text>

              {question.code && (
                <View className="mb-8 rounded-lg bg-white p-3">
                  <Text style={{ fontFamily: 'monospace' }} className="text-xs text-gray-700">
                    {question.code}
                  </Text>
                </View>
              )}

              {question.type === 'multiple_choice' ? (
                <View className="gap-2">
                  {question.questionAnswers.map((questionAnswer) => {
                    const isCorrectAnswer = questionAnswer.isCorrect;
                    const isSelected = questionAnswer.answerId === userAnswer?.answerId;
                    let backgroundClass = 'bg-white';
                    let textClass = 'text-black';

                    if (isCorrectAnswer) {
                      backgroundClass = 'bg-gray-600';
                      textClass = 'text-white';

                    } else if (isSelected) {
                      textClass = 'text-red-400';
                    }

                    return (
                      <View
                        key={questionAnswer.id}
                        className={`rounded-lg p-3 ${backgroundClass}`}
                      >
                        <Text className={`font-semibold ${textClass}`}>
                          {questionAnswer.answer.answer}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View className="gap-2">
                  <View className="rounded-lg bg-white p-3">
                    <Text className="text-xs font-semibold text-gray-400">Your answer</Text>
                    <Text className={`font-semibold ${userAnswer?.isCorrect ? 'text-gray-800' : 'text-red-400'}`}>
                      {userAnswer?.answerText || '—'}
                    </Text>
                  </View>

                  {!userAnswer?.isCorrect && (
                    <View className="rounded-lg bg-gray-600 p-3">
                      <Text className="text-xs font-semibold text-gray-200">Correct answer</Text>
                      <Text className="font-semibold text-white">
                        {userAnswer?.correctAnswerText}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}