import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CircleCheck, CircleX } from 'lucide-react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { UserAnswer } from './play';

type QuizResultsProps = {
  questions: {
    id: string;
    question: string;
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
        paddingBottom: insets.bottom,
      }}
    >
      <View className="flex-row items-center justify-between pt-4">
        <Text className="mb-2 text-3xl font-bold">
          Results
        </Text>

        <Pressable
          onPress={() => router.back()}
          className="rounded-lg bg-gray-600 px-3 py-2 active:bg-gray-700"
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
                    ? <CircleCheck size={18}/>
                    : <CircleX size={18} />}
                </Text>
              </View>

              <Text className="mb-4 font-semibold">
                {question.question}
              </Text>

              <View className="gap-2">
                {question.questionAnswers.map((questionAnswer) => {
                  const isCorrectAnswer = questionAnswer.isCorrect;
                  const isSelected = questionAnswer.answerId === userAnswer?.answerId;
                  let backgroundClass = 'bg-white';
                  let textClass = 'text-black'

                  if (isCorrectAnswer) {
                    backgroundClass = 'bg-gray-600';
                    textClass = "text-white"
                    
                  } else if (isSelected) {
                    textClass = "text-red-400"
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
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}