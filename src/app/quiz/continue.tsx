import { House, RotateCcw, Trophy } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { useColorScheme } from "nativewind";

type Question = {
  id: string;
};

type QuizContinueProps = {
  questions: Question[];
  completedQuestionIds: Set<string>;
  onQuizComplete: () => void;
  onTryAgain: () => void;
  onExit: () => void;
};

export default function QuizContinueScreen({
  questions,
  completedQuestionIds,
  onQuizComplete,
  onTryAgain,
  onExit,
}: QuizContinueProps) {
  const { colorScheme } = useColorScheme();

  const remainingCount = questions.filter(
    (question) => !completedQuestionIds.has(question.id),
  ).length;

  return (
    <View className="flex-1 bg-white items-center justify-center gap-6 p-6 dark:bg-neutral-900">
      <Trophy 
        size={72} 
        color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} 
      />

      <Text className="text-center text-xl font-semibold text-gray-700 dark:text-neutral-300">
        {remainingCount} question{remainingCount === 1 ? '' : 's'} left to get right
      </Text>

      <View className='flex flex-row items-center gap-2'>
        <Pressable
          onPress={onExit}
          className="
            rounded-xl px-8 py-4 
            bg-gray-100 active:bg-gray-200
            dark:bg-neutral-800 dark:active:bg-neutral-700
          "
        >
          <House 
            strokeWidth={2} 
            color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"}  
          />
        </Pressable>

        <Pressable
          onPress={onTryAgain}
          className="
            rounded-xl px-8 py-4 
            bg-gray-100 active:bg-gray-200
            dark:bg-neutral-800 dark:active:bg-neutral-700
          "
        >
          <RotateCcw 
            strokeWidth={2} 
            color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} 
          />
        </Pressable>

        <Pressable
          onPress={onQuizComplete}
          className="
            rounded-xl px-8 py-4 
            bg-gray-100 active:bg-gray-200
            dark:bg-neutral-800 dark:active:bg-neutral-700
          "
        >
          <Trophy 
            strokeWidth={2} 
            color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} 
          />
        </Pressable>
      </View>
    </View>
  );
}