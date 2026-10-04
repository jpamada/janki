import { House, RotateCcw, Trophy } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

type Question = {
  id: string;
};

type QuizContinueProps = {
  questions: Question[];
  completedQuestionIds: Set<string>;
  onTryAgain: () => void;
  onQuizComplete: () => void;
  onExit: () => void;
};

export default function QuizContinueScreen({
  completedQuestionIds,
  questions,
  onTryAgain,
  onQuizComplete,
  onExit,
}: QuizContinueProps) {

  const remainingCount = questions.filter(
    (q) => !completedQuestionIds.has(q.id),
  ).length;

  return (
    <View className="flex-1 bg-white items-center justify-center gap-6 p-6">
      <Trophy color="#4b5563" size={72} />

      <Text className="text-center text-xl font-semibold text-gray-700">
        {remainingCount} question{remainingCount === 1 ? '' : 's'} left to get right
      </Text>

      <View className='flex flex-row items-center gap-2'>
        <Pressable
          onPress={onExit}
          className="rounded-xl px-8 py-4 bg-gray-100 active:bg-gray-200"
        >
          <House strokeWidth={3} color="#4b5563"  />
        </Pressable>

        <Pressable
          onPress={onTryAgain}
          className="rounded-xl bg-gray-600 px-8 py-4 active:bg-gray-700"
        >
          <RotateCcw strokeWidth={3} color="#ffffff" />
        </Pressable>

        <Pressable
          onPress={onQuizComplete}
          className="rounded-xl bg-gray-100 px-8 py-4 active:bg-gray-200"
        >
          <Trophy strokeWidth={3} color="#4b5563" />
        </Pressable>
      </View>
    </View>
  );
}