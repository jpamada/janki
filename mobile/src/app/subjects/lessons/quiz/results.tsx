import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import { QuizQuestion } from '@/mappers/question.mapper';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { UserAnswer } from './play';

type QuizResultsProps = {
  questions: QuizQuestion[];
  userAnswers: UserAnswer[];
};

export default function QuizResults({
  questions,
  userAnswers,
}: QuizResultsProps) {

  const insets = useSafeAreaInsets();

  const score = userAnswers.filter(
    (answer) => answer.isCorrect,
  ).length;

  return (
    <View 
      className="flex-1 bg-white p-4"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom
      }}
    >
      <View className='flex flex-row justify-between items-center pt-4'>
        <Text className="mb-2 text-3xl font-bold">
          Results
        </Text>

        <Pressable
          onPress={() => router.back()}
          className="rounded-lg bg-black px-3 py-2"
        >
          <Text className="text-center font-semibold text-white">
            Finish Quiz
          </Text>
        </Pressable>
      </View>

      <Text className="mb-8 text-xl font-semibold">
        Score: {score} / {questions.length}
      </Text>

      <ScrollView className="flex-1">
        {questions.map((question, index) => {
          const userAnswer = userAnswers.find(
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

                <Text>
                  {userAnswer?.isCorrect
                    ? '✓'
                    : '✕'}
                </Text>
              </View>

              <Text className="mb-4 font-semibold">
                {question.question}
              </Text>

              <View className="gap-2">
                {question.answers.map(
                  (answer) => {
                    const isCorrectAnswer =
                      answer.id ===
                      userAnswer?.correctAnswerId;

                    const isSelected =
                      answer.id ===
                      userAnswer?.answerId;

                    let backgroundClass =
                      'bg-white';

                    if (isCorrectAnswer) {
                      backgroundClass =
                        'bg-green-300';
                    } else if (isSelected) {
                      backgroundClass =
                        'bg-red-300';
                    }

                    return (
                      <View
                        key={answer.id}
                        className={`rounded-lg p-3 ${backgroundClass}`}
                      >
                        <Text className="font-semibold">
                          {answer.answer}
                        </Text>
                      </View>
                    );
                  },
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}