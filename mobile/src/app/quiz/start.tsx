import { AArrowUp, BookCheck, CaseSensitive, FileQuestionMark, Lightbulb, LogOut, Settings, TextAlignStart, Trophy, Volume2 } from 'lucide-react-native';
import { getDueQuestionIds, recordCorrectAnswer, recordIncorrectAnswer, resetProgressForQuestions } from '@/repositories/progress.repository';
import { ActivityIndicator, Pressable, Text, TextInput, View, Image, Switch } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { atomOneLight, atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createHistory } from '@/repositories/history.repository';
import { type ReviewInterval } from '@/helpers/progress.helper';
import { getQuizData } from '@/repositories/quiz.repository';
import { router, useLocalSearchParams } from 'expo-router';
import QuizResultsScreen, { QuizResults } from './results';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useBottomSheet } from '@/hooks/UseBottomSheet';
import { shuffle } from '@/helpers/quiz.helper';
import { useSfx } from '@/contexts/SfxContext';
import { useColorScheme } from 'nativewind';

import DebouncedPressable from '@/components/shared/pressables/DebouncedPressable';
import EmptyStateScreen from '@/components/shared/EmptyState';
import CustomPicker from '@/components/shared/CustomPicker';
import BottomSheet from '@/components/shared/BottomSheet';
import QuizContinueScreen from './continue';

const CodeHighlighter = lazy(
  () => import("react-native-code-highlighter"),
);

export default function QuizStartScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { settings, updateSettings } = useSettings();

  const { playAnswerSfx, playCompletedSfx } = useSfx();
  const { colorScheme } = useColorScheme();
  const { showSnackbar } = useSnackbar();

  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const resultSheet = useBottomSheet();
  const settingSheet = useBottomSheet();

  const syncedQuestionIdsRef = useRef<Set<string>>(new Set());

  const [quizSessionInitialized, setQuizSessionInitialized] = useState(false);

  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [isQuizIncomplete, setIsQuizIncomplete] = useState(false);

  const [identificationInput, setIdentificationInput] = useState('');

  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const [completedQuestionIds, setCompletedQuestionIds] = useState<Set<string>>(new Set());
  const [quizResults, setQuizResults] = useState<QuizResults[]>([]);

  const [sessionQuestionIds, setSessionQuestionIds] = useState<string[]>([]);

  const [queuedQuestions, setQueuedQuestions] = useState<string[]>([]);
  const [queuedQuestionIndex, setQueuedQuestionIndex] = useState(0);

  const { data: quizData = [], isLoading, error } = useQuery({
    queryKey: ['quizData', lessonId],
    queryFn: () => getQuizData(lessonId),
    enabled: !!lessonId,
  });

  const questions = useMemo(() =>
    queuedQuestions.flatMap((id) => {
      const question = quizData.find((q) => q.id === id);
      return question ? [question] : [];
    }), [queuedQuestions, quizData],
  );

  const sessionQuestions = useMemo(() =>
    sessionQuestionIds.flatMap((id) => {
      const question = quizData.find((q) => q.id === id);
      return question ? [question] : [];
    }), [sessionQuestionIds, quizData],
  );

  const currentQuestion = questions[queuedQuestionIndex];

  const progress = questions.length > 0
    ? ((queuedQuestionIndex + 1) / questions.length) * 100
    : 0;

  const createHistoryMutation = useMutation({
    mutationFn: createHistory,

    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['heatmap'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['statistics'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['dailyStatistics'] 
      });
       queryClient.invalidateQueries({ 
        queryKey: ['history'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['latestHistory'] 
      });
    },

    onError: (err) => {
      showSnackbar({ 
        message: 'Something went wrong. Please try again.' 
      });
    },
  });

  const recordCorrectMutation = useMutation({
    mutationFn: ({ questionId, interval }: { 
      questionId: string; 
      interval: ReviewInterval 
    }) => recordCorrectAnswer(questionId, interval),

    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['subjects'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['statistics'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['dailyStatistics'] 
      });
    },

    onError: (err) => {
      showSnackbar({ 
        message: 'Something went wrong. Please try again.' 
      });
    },
  });

  const recordIncorrectMutation = useMutation({
    mutationFn: (questionId: string) => 
      recordIncorrectAnswer(questionId),

    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['subjects'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['statistics'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['dailyStatistics'] 
      });
    },

    onError: (err) => {
      showSnackbar({ 
        message: 'Something went wrong. Please try again.' 
      });
    },
  });

  const handleQuizProgress = (completeCurrentQuestion: boolean) => {
    const updatedCompletedQuestionIds = new Set(
      completedQuestionIds,
    );

    if (completeCurrentQuestion && currentQuestion) {
      updatedCompletedQuestionIds.add(currentQuestion.id);
      setCompletedQuestionIds(updatedCompletedQuestionIds);
    }

    if (queuedQuestionIndex < questions.length - 1) {
      setIsCorrect(null);
      setIdentificationInput('');
      setQueuedQuestionIndex((previous) => previous + 1);
      return;
    }

    const remainingQuestions = questions
      .map((question) => question.id)
      .filter((id) => !updatedCompletedQuestionIds.has(id));

    if (remainingQuestions.length === 0) {
      playCompletedSfx();
      setIsQuizComplete(true);

    } else {
      setIsQuizIncomplete(true);
    }
  };

  const handleAnswerResult = (input: {
    correct: boolean;
    answerId: string | null;
    answerText: string;
    correctAnswer: { id: string; answer: string };
  }) => {
    if (!currentQuestion) return;

    playAnswerSfx(input.correct);
    setIsCorrect(input.correct);

    setQuizResults((previous) => [
      ...previous, {
        isCorrect: input.correct,
        questionId: currentQuestion.id,
        answerId: input.answerId,
        answerText: input.answerText,
        correctAnswerId: input.correctAnswer.id,
        correctAnswerText: input.correctAnswer.answer,
      },
    ]);
  };

  const handleSubmitMultipleChoice = async (answerId: string) => {
    if (!currentQuestion || resultSheet.visible) {
      return;
    }

    const selectedAnswer = currentQuestion.questionAnswers.find(
      (item) => item.answer.id === answerId,
    );
    const correctAnswer = currentQuestion.questionAnswers.find(
      (item) => item.isCorrect,
    );

    if (!selectedAnswer || !correctAnswer) {
      return;
    }

    const correct = selectedAnswer.answer.id === correctAnswer.answer.id;

    handleAnswerResult({
      correct,
      answerId: selectedAnswer.answer.id,
      answerText: selectedAnswer.answer.answer,
      correctAnswer: correctAnswer.answer,
    });

    createHistoryMutation.mutateAsync({ 
      questionId: currentQuestion.id, 
      answer: selectedAnswer.answer.answer,
      isCorrect: correct,
    });

    if (!correct) {
      recordIncorrectMutation.mutateAsync(currentQuestion.id);
    }

    resultSheet.open();
  };

  const handleSubmitIdentification = async () => {
    if (!currentQuestion || resultSheet.visible || !identificationInput.trim()) {
      return;
    }

    const correctAnswer = currentQuestion.questionAnswers.find(
      (item) => item.isCorrect,
    );

    if (!correctAnswer) {
      return;
    }

    const trimmedInput = identificationInput.trim();
    const correctAnswerText = correctAnswer.answer.answer.trim();

    const correct = settings?.caseSensitive
      ? trimmedInput === correctAnswerText
      : trimmedInput.toLowerCase() === correctAnswerText.toLowerCase();

    handleAnswerResult({
      correct,
      answerId: null,
      answerText: trimmedInput,
      correctAnswer: correctAnswer.answer,
    });

    createHistoryMutation.mutateAsync({ 
      questionId: currentQuestion.id, 
      answer: trimmedInput,
      isCorrect: correct,
    });

    if (!correct) {
        recordIncorrectMutation.mutateAsync(
        currentQuestion.id
      );
    }

    resultSheet.open();
  };

  const handleSubmitInterval = async (interval: ReviewInterval) => {
    if (!currentQuestion) {
      return;
    }

    try {
      recordCorrectMutation.mutateAsync({
        questionId: currentQuestion.id,
        interval: interval,
      });

      resultSheet.close(() => {
        handleQuizProgress(true);
      });

    } catch {
      showSnackbar({ 
        message: 'Something went wrong. Please try again.' 
      });
    }
  };

  const handleContinueIncorrect = () => {
    resultSheet.close(() => {
      handleQuizProgress(false);
    });
  };

  const handleQuizReset = async () => {
    try {
      const allIds = quizData.map((q) => q.id);
      await resetProgressForQuestions(allIds);

      setQueuedQuestions(shuffle(allIds));
      setSessionQuestionIds(allIds);
      setQueuedQuestionIndex(0);
      setCompletedQuestionIds(new Set());
      setQuizResults([]);
      setIsQuizIncomplete(false);
      setIsQuizComplete(false);
      setIsCorrect(null);
      setIdentificationInput('');

      queryClient.invalidateQueries({ 
        queryKey: ['subjects'] 
      });

    } catch {
      showSnackbar({ 
        message: 'Something went wrong. Please try again.' 
      });
    }
  };

  const handleTryAgain = () => {
    const remainingQuestions = questions
      .map((question) => question.id)
      .filter((id) => !completedQuestionIds.has(id));

    setQueuedQuestions(shuffle(remainingQuestions));
    setQueuedQuestionIndex(0);
    setIsQuizIncomplete(false);
    setIdentificationInput('');
  };

  const handleExitQuiz = () => {
    setIsCorrect(null);
    setQuizResults([]);
    setQueuedQuestions([]);
    setIsQuizComplete(false);
    setSessionQuestionIds([]);
    setQueuedQuestionIndex(0);
    setIsQuizIncomplete(false);
    setIdentificationInput('');
    setQuizSessionInitialized(false);
    setCompletedQuestionIds(new Set());
    syncedQuestionIdsRef.current = new Set();
    router.push("/(tabs)");
  };

  useEffect(() => {
    if (!lessonId || isLoading) {
      return;
    }

    if (quizData.length === 0) {
      syncedQuestionIdsRef.current = new Set();

      setQueuedQuestions((prev) => 
        (prev.length === 0 ? prev : [])
      );

      setQuizSessionInitialized(true);
      return;
    }

    const currentQuestionIds = new Set(
      quizData.map(
        (question) => question.id
      )
    );
    
    const newQuestionIds = quizData
    .map((question) => question.id)
    .filter((id) => !syncedQuestionIdsRef.current.has(id));

    if (!quizSessionInitialized) {
      const initializeSession = async () => {
        try {
          const dueIds = await getDueQuestionIds(
            quizData.map(
              (question) => question.id
            )
          );

          setQueuedQuestions(shuffle(dueIds));
          setSessionQuestionIds(dueIds);
          syncedQuestionIdsRef.current = currentQuestionIds;

        } catch {
          showSnackbar({ 
            message: 'Something went wrong. Please try again.' 
          });

        } finally {
          setQuizSessionInitialized(true);
        }
      };

      initializeSession();
      return;
    }

    if (newQuestionIds.length > 0) {
      const syncNewQuestions = async () => {
        const dueQuestionIds = await getDueQuestionIds(newQuestionIds);

        if (dueQuestionIds.length > 0) {
          setQueuedQuestions(
            (prev) => [...prev, ...shuffle(dueQuestionIds)]
          );
          setSessionQuestionIds(
            (prev) => [...prev, ...dueQuestionIds]
          );
        }

        syncedQuestionIdsRef.current = currentQuestionIds;
      };

      syncNewQuestions();
    }
  }, [lessonId, isLoading, quizSessionInitialized, quizData , showSnackbar]);

  if (isQuizComplete) {
    return (
      <QuizResultsScreen
        questions={sessionQuestions}
        quizResults={quizResults}
      />
    );
  }

  if (isQuizIncomplete) {
    return (
      <QuizContinueScreen
        questions={sessionQuestions}
        completedQuestionIds={completedQuestionIds}
        onTryAgain={handleTryAgain}
        onQuizComplete={() => setIsQuizComplete(true)}
        onExit={handleExitQuiz}
      />
    );
  }

  return (
    <View className={`flex-1 ${currentQuestion?.code ? "bg-gray-100" : "bg-white"} dark:bg-neutral-900`}>
      {isLoading || !quizSessionInitialized ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#4b5563" />
        </View>

      ) : error ? (
        <View className="flex-1 items-center justify-center">
          <Text>Failed to load quiz</Text>
        </View>

      ) : questions.length > 0 && currentQuestion ? (
        <>
          <View className="mt-8 flex-row items-center gap-1 p-1">
            <Pressable
              onPress={() => settingSheet.open()}
              className="rounded-xl p-3 active:bg-gray-100 dark:active:bg-neutral-800"
            >
              <Settings strokeWidth={2} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"}  />
            </Pressable>

            <View className="me-3 h-3 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-400">
              <View className="h-full bg-gray-600" style={{ width: `${progress}%` }} />
            </View>
          </View>

          <KeyboardAwareScrollView
            bottomOffset={20}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            className="bg-white dark:bg-neutral-900"
            contentContainerStyle={{ 
              flexGrow: 1,
            }}
          >
            <View className={`
              ${currentQuestion?.code ? "bg-gray-100" : "bg-white"} dark:bg-neutral-900
            `}>
              <Text
                className="font-semibold px-4 pt-2 pb-4 dark:text-neutral-300"
                style={{
                  textAlign: settings?.questionTextAlign ?? "left",
                  fontSize: settings?.questionFontSize ?? 20,
                }}
              >
                {currentQuestion.question}
              </Text>
            </View>

            {currentQuestion?.image && (
              <Image
                source={{ uri: currentQuestion?.image }}
                className="h-72 w-full rounded-xl mt-4 px-4"
                resizeMode="contain"
              />
            )}

            {currentQuestion?.code && (
              <View className="flex-1 bg-white w-auto dark:bg-neutral-900">
                <Suspense 
                  fallback={
                    <View 
                      className="rounded-xl bg-white dark:bg-neutral-900" 
                    />
                  }
                >
                  <CodeHighlighter
                    hljsStyle={colorScheme === "light" ? atomOneLight : atomOneDark }
                    language={currentQuestion.language ?? "text"}
                    scrollViewProps={{
                      style: {
                        flex: 1,
                        minHeight: 450,
                      },
                      contentContainerStyle: {
                        flexGrow: 1,
                        padding: 16,
                      },
                    }}
                    textStyle={{
                      fontSize: 14,
                      fontFamily: "monospace",
                    }}
                  >
                    {currentQuestion.code}
                  </CodeHighlighter>
                </Suspense>
              </View>
            )}  

            <BottomSheet
              sheet={resultSheet}
              onRequestClose={isCorrect ? undefined : handleContinueIncorrect}
              onBackdropPress={isCorrect ? undefined : handleContinueIncorrect}
            >
              <View className="p-6">
                <Text className="text-3xl font-bold text-gray-800 dark:text-white">
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </Text>

                {!isCorrect && settings?.showCorrectAnswer && (
                  <View className="mt-6">
                    <Text className="text-lg font-semibold text-gray-400">
                      Correct Answer
                    </Text>

                    <Text className="mt-2 text-lg font-semibold dark:text-white">
                      {
                        currentQuestion.questionAnswers.find(
                          (item) => item.isCorrect,
                        )?.answer.answer
                      }
                    </Text>
                  </View>
                )}

                {currentQuestion?.explanation && settings?.showExplanation && (
                  <View className="mt-6">
                    <Text className="text-lg font-semibold text-gray-400">
                      Explanation
                    </Text>

                    <Text className="mt-2 text-lg font-semibold text-gray-500">
                      {currentQuestion.explanation}
                    </Text>
                  </View>
                )}

                {isCorrect ? (
                  <View className="mt-8 gap-2">
                    <Text className="mb-1 text-sm font-semibold text-gray-400">
                      Show this again in:
                    </Text>

                    <View className="flex-row items-center gap-2">
                      <DebouncedPressable
                        disabled={recordCorrectMutation.isPending}
                        onPress={() => handleSubmitInterval('1_day')}
                        className="flex-1 rounded-lg bg-gray-600 px-4 py-2 active:bg-gray-700 disabled:bg-gray-400"
                      >
                        <Text className="text-center text-lg font-semibold text-white">
                          1 Day
                        </Text>
                      </DebouncedPressable>

                      <DebouncedPressable
                        disabled={recordCorrectMutation.isPending}
                        onPress={() => handleSubmitInterval('3_days')}
                        className="flex-1 rounded-lg bg-gray-600 px-4 py-2 active:bg-gray-700 disabled:bg-gray-400"
                      >
                        <Text className="text-center text-lg font-semibold text-white">
                          3 Days
                        </Text>
                      </DebouncedPressable>

                      <DebouncedPressable
                        disabled={recordCorrectMutation.isPending}
                        onPress={() => handleSubmitInterval('7_days')}
                        className="flex-1 rounded-lg bg-gray-600 px-4 py-2 active:bg-gray-700 disabled:bg-gray-400"
                      >
                        <Text className="text-center text-lg font-semibold text-white">
                          7 Days
                        </Text>
                      </DebouncedPressable>
                    </View>
                  </View>
                ) : (
                  <Pressable
                    onPress={handleContinueIncorrect}
                    className="mt-8 rounded-lg bg-gray-600 p-4 active:bg-gray-700"
                  >
                    <Text className="text-center text-lg font-semibold text-white">
                      Continue
                    </Text>
                  </Pressable>
                )}
              </View>
            </BottomSheet>
            
            <BottomSheet
              sheet={settingSheet}
              className="px-4 py-8"
              onRequestClose={() => settingSheet.close()}
            >
              <View className="
                flex-row items-center justify-between 
                bg-white rounded-t-xl p-4 
                dark:bg-neutral-700
              ">
                <View className="flex-row items-center gap-2">
                  <AArrowUp size={16} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
                  <Text className="text-xl dark:text-neutral-300">
                    Font Size
                  </Text>
                </View>

                <View className="bg-gray-100 rounded-xl">
                  <CustomPicker
                    title="Font Size"
                    variant='modal'
                    className="dark:bg-neutral-600 dark:active:bg-neutral-500"
                    selectedValue={settings.questionFontSize}
                    onValueChange={(value) => updateSettings({ questionFontSize: value })}
                    options={[
                      { label: 'Small', value: 14 },
                      { label: 'Default', value: 20 },
                      { label: 'Large', value: 36 },
                    ]}
                  />
                </View>
              </View> 

              <View className="
                flex-row items-center justify-between 
                bg-white p-4 
                dark:bg-neutral-700
              ">
                <View className="flex-row items-center gap-2">
                  <TextAlignStart size={16} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
                  <Text className="text-xl dark:text-neutral-300">
                    Text Alignment
                  </Text>
                </View>

                <View className="bg-gray-100 rounded-xl">
                  <CustomPicker
                    title='Text Alignment'
                    variant='modal'
                    className="dark:bg-neutral-600 dark:active:bg-neutral-500"
                    selectedValue={settings.questionTextAlign}
                    onValueChange={(value) => updateSettings({ questionTextAlign: value })}
                    options={[
                      { label: "Left", value:"left" },
                      { label: "Center", value:"center" },
                      { label: "Justify", value:"justify" },
                    ]}
                  />
                </View>
              </View>

              <View className="
                flex-row items-center justify-between 
                bg-white p-4 
                dark:bg-neutral-700
              ">
                <View className="flex-row items-center gap-2">
                  <CaseSensitive size={16} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
                  <Text className="text-xl dark:text-neutral-300">
                    Case Sensitive
                  </Text>
                </View>

                <View className="bg-gray-100 rounded-xl p-1 dark:bg-neutral-600">
                  <Switch
                    value={settings.caseSensitive}
                    onValueChange={(value) => updateSettings({ caseSensitive: value })}
                  />
                </View>
              </View> 

              <View className="
                flex-row items-center justify-between 
                bg-white p-4 
                dark:bg-neutral-700
              ">
                <View className="flex-row items-center gap-2">
                  <BookCheck size={16} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
                  <Text className="text-xl dark:text-neutral-300">
                    Show Correct Answer
                  </Text>
                </View>

                <View className="bg-gray-100 rounded-xl p-1 dark:bg-neutral-600">
                  <Switch
                    value={settings.showCorrectAnswer}
                    onValueChange={(value) => updateSettings({ showCorrectAnswer: value })}
                  />
                </View>
              </View> 

              <View className="
                flex-row items-center justify-between 
                bg-white p-4 
                dark:bg-neutral-700
              ">
                <View className="flex-row items-center gap-2">
                  <BookCheck size={16} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
                  <Text className="text-xl dark:text-neutral-300">
                    Show Explanation
                  </Text>
                </View>

                <View className="bg-gray-100 rounded-xl p-1 dark:bg-neutral-600">
                  <Switch
                    value={settings.showExplanation}
                    onValueChange={(value) => updateSettings({ showExplanation: value })}
                  />
                </View>
              </View> 

              <View className="
                flex-row items-center justify-between 
                bg-white p-4 
                dark:bg-neutral-700
              ">
                <View className="flex-row items-center gap-2">
                  <Volume2 size={16} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
                  <Text className="text-xl dark:text-neutral-300">
                    Sounds
                  </Text>
                </View>

                <View className="bg-gray-100 rounded-xl p-1 dark:bg-neutral-600">
                  <Switch
                    value={settings.soundEnabled}
                    onValueChange={(value) => updateSettings({ soundEnabled: value })}
                  />
                </View>
              </View> 

              <Pressable
                onPress={() => {
                  settingSheet.close();
                  router.push({ pathname: '/questions/create', params: { lessonId } });
                }}
                className="
                  flex-row items-center gap-2 p-4 
                  bg-white active:bg-gray-100
                  dark:bg-neutral-700 dark:active:bg-neutral-600
                "
              >
                <Lightbulb size={16} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
                <Text className="text-xl dark:text-neutral-300">
                  Add Question
                </Text>
              </Pressable>

              <DebouncedPressable
                onPress={() => {
                  settingSheet.close();
                  router.push({ pathname: '/questions/browse', params: { lessonId } });
                }}
                className="
                  flex-row items-center gap-2 p-4 
                  bg-white active:bg-gray-100
                  dark:bg-neutral-700 dark:active:bg-neutral-600
                "
              >
                <Lightbulb size={16} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
                <Text className="text-xl dark:text-neutral-300">
                  Browse Questions
                </Text>
              </DebouncedPressable>

              <DebouncedPressable
                onPress={() => {
                  settingSheet.close();
                  router.back();
                }}
                className="
                  flex-row items-center gap-2 p-4 rounded-b-3xl
                  bg-white active:bg-gray-100
                  dark:bg-neutral-700 dark:active:bg-neutral-600
                "
              >
                <LogOut size={16} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
                <Text className="text-xl dark:text-neutral-300">
                  Give Up
                </Text>
              </DebouncedPressable>
            </BottomSheet>
          </KeyboardAwareScrollView>
        </>

      ) : quizData.length > 0 ? (
        <View className="flex-1 items-center justify-center gap-6 p-6">
          <Trophy color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} size={72} />

          <Text className="text-center text-xl font-semibold text-gray-700 dark:text-neutral-300">
            You have answered every question correctly
          </Text>

          <DebouncedPressable
            onPress={handleQuizReset}
            className="rounded-xl bg-gray-600 px-8 py-4 active:bg-gray-700 dark:bg-neutral-700 dark:active:bg-neutral-600"
          >
            <Text className="text-center text-lg font-semibold text-white">
              Answer Again
            </Text>
          </DebouncedPressable>
        </View>

      ) : (
        <EmptyStateScreen
          title="No Questions Available"
          icon={<FileQuestionMark color="#4b5563" size={72} />}
          navigate={{ pathname: '/questions/create', params: { lessonId } }}
        />
      )}

      {currentQuestion && (
        <KeyboardStickyView offset={{ closed: 0, opened: insets.top }}>
          <View className="gap-4 bg-gray-100 p-4 dark:bg-neutral-900" style={{ paddingBottom: insets.bottom }}>
            {currentQuestion.type === 'multiple_choice' ? (
              currentQuestion.questionAnswers.map((item) => (
                <Pressable
                  key={item.answer.id}
                  disabled={resultSheet.visible}
                  onPress={() => handleSubmitMultipleChoice(item.answer.id)}
                  className="
                    rounded-xl 
                    bg-gray-600 p-4 active:bg-gray-700 
                    dark:bg-neutral-800 dark:active:bg-neutral-700
                  "
                >
                  <Text className="text-white text-center text-lg font-semibold">
                    {item.answer.answer}
                  </Text>
                </Pressable>
              ))
            ) : (
              <>
                <TextInput
                  value={identificationInput}
                  onChangeText={setIdentificationInput}
                  editable={!resultSheet.visible}
                  placeholder="Type your answer"
                  placeholderTextColor={
                    colorScheme === "dark" ? "#a3a3a3" : "#9ca3af"
                  }
                  autoCapitalize="none"
                  className="
                    rounded-xl px-4 py-4
                    bg-gray-200 text-lg font-semibold 
                    dark:bg-neutral-700 dark:text-neutral-300
                  "
                />

                <Pressable
                  disabled={resultSheet.visible || !identificationInput.trim()}
                  onPress={handleSubmitIdentification}
                  className="
                    rounded-xl p-4
                    bg-gray-600 active:bg-gray-500 disabled:bg-gray-400 
                    dark:disabled:bg-gray-500
                  "
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