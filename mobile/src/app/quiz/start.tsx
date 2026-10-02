import { updateCaseSensitivity, updateFontSize, updateShowCorrectAnswer, updateShowExplanation, updateSoundEnabled, updateTextAlign } from '@/repositories/settings.repository';
import { AArrowUp, BookCheck, CaseSensitive, FileQuestionMark, Lightbulb, LogOut, Settings, TextAlignStart, Trophy, Volume2 } from 'lucide-react-native';
import { getDueQuestionIds, recordCorrectAnswer, recordIncorrectAnswer, resetProgressForQuestions } from '@/repositories/progress.repository';
import { Animated, ActivityIndicator, Modal, Pressable, Text, TextInput, View, Image, Switch } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createHistory } from '@/repositories/history.repository';
import { getResponseTime, shuffle } from '@/helpers/quiz.helper';
import { type ReviewInterval } from '@/helpers/progress.helper';
import { getQuizData } from '@/repositories/quiz.repository';
import { router, useLocalSearchParams } from 'expo-router';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useBottomSheet } from '@/hooks/UseBottomSheet';
import { Picker } from '@react-native-picker/picker';
import { useSfx } from '@/contexts/SfxContext';

import DebouncedPressable from '@/components/shared/DebouncedPressable';
import EmptyStateScreen from '@/components/shared/EmptyState';
import QuizResultsScreen, { QuizResults } from './results';
import QuizContinueScreen from './continue';

const CodeHighlighter = lazy(
  () => import("react-native-code-highlighter"),
);

export default function QuizStartScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { settings } = useSettings();

  const { playAnswerSfx, playCompletedSfx } = useSfx();
  const { showSnackbar } = useSnackbar();

  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const resultSheet = useBottomSheet();
  const settingSheet = useBottomSheet();

  const questionStartTime = useRef<number | null>(null);
  const syncedQuestionIdsRef = useRef<Set<string>>(new Set());

  const [quizSessionInitialized, setQuizSessionInitialized] = useState(false);

  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [isQuizIncomplete, setIsQuizIncomplete] = useState(false);

  const [identificationInput, setIdentificationInput] = useState('');

  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const [completedQuestionIds, setCompletedQuestionIds] = useState<Set<string>>(new Set());
  const [quizResults, setQuizResults] = useState<QuizResults[]>([]);

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

  const currentQuestion = questions[queuedQuestionIndex];

  const progress = questions.length > 0
    ? ((queuedQuestionIndex + 1) / questions.length) * 100
    : 0;

  const createHistoryMutation = useMutation({
    mutationFn: createHistory,

    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ['heatmap'] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['statistics'] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['dailyStatistics'] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['historyList'] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['latestHistory'] 
      });
    },

    onError: (err) => {
      showSnackbar({ 
        message: 'Something went wrong. Please try again.' 
      });
      console.error(err.message);
    },
  });

  const recordCorrectMutation = useMutation({
    mutationFn: ({ questionId, interval }: { 
      questionId: string; 
      interval: ReviewInterval 
    }) => recordCorrectAnswer(questionId, interval),

    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ['subjects'] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['statistics'] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['dailyStatistics'] 
      });
    },

    onError: (err) => {
      showSnackbar({ 
        message: 'Something went wrong. Please try again.' 
      });
      console.error(err.message);
    },
  });

  const recordIncorrectMutation = useMutation({
    mutationFn: (questionId: string) => recordIncorrectAnswer(questionId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ['subjects'] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['statistics'] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['dailyStatistics'] 
      });
    },

    onError: (err) => {
      showSnackbar({ 
        message: 'Something went wrong. Please try again.' 
      });
      console.error(err.message);
    },
  });

  const updateTextAlignMutation = useMutation({
    mutationFn: updateTextAlign,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["settings"],
      });
    },
  });

  const updateFontSizeMutation = useMutation({
    mutationFn: updateFontSize,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["settings"],
      });
    },
  });

  function useOptimisticToggle<T extends boolean>(
    serverValue: T | undefined,
    mutate: (value: T) => Promise<void>,
    queryKey: readonly unknown[],
  ) {
    const queryClient = useQueryClient();
    const [localValue, setLocalValue] = useState(serverValue ?? (false as T));

    const mutation = useMutation({
      mutationFn: mutate,
      onError: (_err, newValue) => setLocalValue((!newValue) as T),
      onSettled: () => queryClient.invalidateQueries({ queryKey }),
    });

    useEffect(() => {
      if (serverValue !== undefined && !mutation.isPending) {
        setLocalValue(serverValue);
      }
    }, [serverValue, mutation.isPending]);

    const toggle = (value: T) => {
      setLocalValue(value);
      mutation.mutate(value);
    };

    return [localValue, toggle] as const;
  }

  const [caseSensitive, toggleCaseSensitive] = useOptimisticToggle(
    settings?.caseSensitive,
    updateCaseSensitivity,
    ["settings"],
  );

  const [showCorrectAnswer, toggleShowCorrectAnswer] = useOptimisticToggle(
    settings?.showCorrectAnswer,
    updateShowCorrectAnswer,
    ["settings"],
  );

  const [showExplanation, toggleShowExplanation] = useOptimisticToggle(
    settings?.showExplanation,
    updateShowExplanation,
    ["settings"],
  );

  const [soundEnabled, toggleSoundEnabled] = useOptimisticToggle(
    settings?.soundEnabled,
    updateSoundEnabled,
    ["settings"],
  );

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
      .map(
        (question) => question.id
      ).filter(
        (id) => !updatedCompletedQuestionIds.has(id),
      );

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

    const responseTime = getResponseTime(questionStartTime);

    const correct = selectedAnswer.answer.id === correctAnswer.answer.id;

    handleAnswerResult({
      correct,
      answerId: selectedAnswer.answer.id,
      answerText: selectedAnswer.answer.answer,
      correctAnswer: correctAnswer.answer,
    });

    await createHistoryMutation.mutateAsync({ 
      questionId: currentQuestion.id, 
      responseTime: responseTime,
      answer: selectedAnswer.answer.answer,
      isCorrect: correct,
    });

    if (!correct) {
      await recordIncorrectMutation.mutateAsync(currentQuestion.id);
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

    const responseTime = getResponseTime(questionStartTime);

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

    await createHistoryMutation.mutateAsync({ 
      questionId: currentQuestion.id, 
      responseTime: responseTime,
      answer: trimmedInput,
      isCorrect: correct,
    });

    if (!correct) {
      await recordIncorrectMutation.mutateAsync(
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
      await recordCorrectMutation.mutateAsync({
        questionId: currentQuestion.id,
        interval: interval,
      });

      resultSheet.close(() => {
        handleQuizProgress(true);
      });

    } catch (err) {
      console.error(err);
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
      setQueuedQuestionIndex(0);
      setCompletedQuestionIds(new Set());
      setIsQuizIncomplete(false);
      setIsQuizComplete(false);
      setIsCorrect(null);
      setIdentificationInput('');

      await queryClient.invalidateQueries({ 
        queryKey: ['subjects'] 
      });

    } catch (err) {
      showSnackbar({ 
        message: 'Something went wrong. Please try again.' 
      });
      console.error(err);
    }
  };

  const handleTryAgain = () => {
    const remainingQuestions = questions
    .map(
      (question) => question.id
    ).filter(
      (id) => !completedQuestionIds.has(id)
    );

    setQueuedQuestions(shuffle(remainingQuestions));
    setQueuedQuestionIndex(0);
    setIsQuizIncomplete(false);
    setIdentificationInput('');
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
    .map(
      (question) => question.id
    ).filter(
      (id) => !syncedQuestionIdsRef.current.has(id)
    );

    if (!quizSessionInitialized) {
      const initializeSession = async () => {
        try {
          const dueIds = await getDueQuestionIds(
            quizData.map(
              (question) => question.id
            )
          );

          setQueuedQuestions(shuffle(dueIds));
          syncedQuestionIdsRef.current = currentQuestionIds;

        } catch (error) {
          showSnackbar({ 
            message: 'Something went wrong. Please try again.' 
          });
          console.error(error);

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
        }

        syncedQuestionIdsRef.current = currentQuestionIds;
      };

      syncNewQuestions();
    }
  }, [lessonId, isLoading, quizSessionInitialized, quizData , showSnackbar]);

  useEffect(() => {
    questionStartTime.current = Date.now();
  }, [currentQuestion?.id]);

  if (isQuizComplete) {
    return (
      <QuizResultsScreen
        questions={questions}
        quizResults={quizResults}
      />
    );
  }

  if (isQuizIncomplete) {
    return (
      <QuizContinueScreen
        questions={questions}
        completedQuestionIds={completedQuestionIds}
        onTryAgain={handleTryAgain}
        onQuizComplete={() => setIsQuizComplete(true)}
      />
    );
  }

  return (
    <View className={`flex-1 ${currentQuestion?.code ? "bg-gray-50" : "bg-white"}`}>
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
              className="rounded-xl p-3 active:bg-gray-100"
            >
              <Settings strokeWidth={2} color="#4a5462" />
            </Pressable>

            <View className="me-3 h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
              <View className="h-full bg-gray-600" style={{ width: `${progress}%` }} />
            </View>
          </View>

          <KeyboardAwareScrollView
            bottomOffset={20}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            className="bg-white"
            contentContainerStyle={{ 
              flexGrow: 1,
            }}
          >
            <View className={`rounded-lg ${currentQuestion?.code ? "bg-gray-50" : "bg-white"}`}>
              <Text
                className="font-semibold px-4 pt-2 pb-4"
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
              <View className="flex-1 bg-white w-auto">
                <Suspense 
                  fallback={
                    <View 
                      className="rounded-xl bg-white" 
                    />
                  }
                >
                  <CodeHighlighter
                    hljsStyle={atomOneLight}
                    language={currentQuestion.language ?? "text"}
                    scrollViewProps={{
                      style: {
                        flex: 1,
                        minHeight: 420,
                        backgroundColor: "transparent",
                      },
                      contentContainerStyle: {
                        flexGrow: 1,
                        backgroundColor: "transparent",
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

            <Modal
              transparent
              animationType="none"
              visible={resultSheet.visible}
              onRequestClose={isCorrect ? undefined : handleContinueIncorrect}
            >
              <View className="flex-1 justify-end">
                <Animated.View
                  className="absolute inset-0 bg-black/40"
                  style={{ opacity: resultSheet.backdropOpacity }}
                >
                  {!isCorrect && (
                    <Pressable className="flex-1" onPress={handleContinueIncorrect} />
                  )}
                </Animated.View>

                <Animated.View
                  style={{ transform: [{ translateY: resultSheet.translateY }] }}
                  className="rounded-t-3xl bg-white"
                >
                  <View className="p-6">
                    <Text className="text-3xl font-bold text-gray-800">
                      {isCorrect ? 'Correct!' : 'Incorrect'}
                    </Text>

                    {!isCorrect && settings?.showCorrectAnswer && (
                      <View className="mt-6">
                        <Text className="text-lg font-semibold text-gray-400">
                          Correct Answer
                        </Text>
                        <Text className="mt-2 text-lg font-semibold">
                          {currentQuestion.questionAnswers.find((item) => item.isCorrect)?.answer.answer}
                        </Text>
                      </View>
                    )}

                    {currentQuestion?.explanation && settings?.showExplanation && (
                       <View className="mt-6">
                        <Text className="text-lg font-semibold text-gray-400">
                          Explanation
                        </Text>

                         <Text className="mt-2 text-lg font-semibold text-gray-500">
                          {currentQuestion?.explanation}
                        </Text>
                      </View>
                     
                    )}

                    {isCorrect ? (
                      <View className="mt-8 gap-2">
                        <Text className="text-sm font-semibold text-gray-400 mb-1">
                          Show this again in:
                        </Text>

                        <View className="flex-row items-center gap-2">
                          <DebouncedPressable
                            key={"1_day"}
                            disabled={recordCorrectMutation.isPending}
                            onPress={() => handleSubmitInterval("1_day")}
                            className="flex-1 rounded-lg bg-gray-600 px-4 py-2 active:bg-gray-700 disabled:bg-gray-400"
                          >
                            <Text className="text-center text-lg font-semibold text-white">
                              1 Day
                            </Text>
                          </DebouncedPressable>

                          <DebouncedPressable
                            key={"3_days"}
                            disabled={recordCorrectMutation.isPending}
                            onPress={() => handleSubmitInterval("3_days")}
                            className="flex-1 rounded-lg bg-gray-600 px-4 py-2 active:bg-gray-700 disabled:bg-gray-400"
                          >
                            <Text className="text-center text-lg font-semibold text-white">
                              3 Days
                            </Text>
                          </DebouncedPressable>

                          <DebouncedPressable
                            key={"7_days"}
                            disabled={recordCorrectMutation.isPending}
                            onPress={() => handleSubmitInterval("7_days")}
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
                  <Pressable className="flex-1" onPress={() => settingSheet.close()} />
                </Animated.View>

                <Animated.View
                  style={{ transform: [{ translateY: settingSheet.translateY }] }}
                  className="rounded-3xl bg-gray-50 px-4 py-6"
                >
                  <View className="flex-row items-center justify-between rounded-t-xl bg-white p-4">
                    <View className="flex-row items-center gap-2">
                      <AArrowUp size={16} />
                      <Text className='text-xl'>Font Size</Text>
                    </View>

                    <View className="bg-gray-100 rounded-xl">
                      <Picker
                        selectedValue={settings?.questionFontSize ?? 20}
                        onValueChange={(value) =>
                          updateFontSizeMutation.mutate(value)
                        }
                        style={{ 
                          width: 120, 
                          height: 50
                        }}
                      >
                        <Picker.Item 
                          label="Small" 
                          value={14}
                          style={{
                            fontSize: 16,
                            color: "#6b7280",
                          }} 
                        />
                        <Picker.Item  
                          label="Default" 
                          value={20}
                          style={{
                            fontSize: 16,
                            color: "#6b7280",
                          }}
                        />
                        <Picker.Item  
                          label="Large" 
                          value={36}
                          style={{
                            fontSize: 16,
                            color: "#6b7280",
                          }}
                        />
                      </Picker>
                    </View>
                  </View> 

                  <View className="flex-row items-center justify-between rounded-t-xl bg-white p-4">
                    <View className="flex-row items-center gap-2">
                      <TextAlignStart size={16} />
                      <Text className='text-xl'>Text Alignment</Text>
                    </View>

                    <View className="bg-gray-100 rounded-xl">
                      <Picker
                        selectedValue={settings?.questionTextAlign ?? "left"}
                        onValueChange={(value) =>
                          updateTextAlignMutation.mutate(value)
                        }
                        style={{ 
                          width: 120, 
                          height: 50
                        }}
                      >
                        <Picker.Item 
                          label="Left" 
                          value="left" 
                          style={{
                            fontSize: 16,
                            color: "#6b7280",
                          }} 
                        />
                        <Picker.Item  
                          label="Center" 
                          value="center" 
                          style={{
                            fontSize: 16,
                            color: "#6b7280",
                          }}
                        />
                        <Picker.Item  
                          label="Justify" 
                          value="justify" 
                          style={{
                            fontSize: 16,
                            color: "#6b7280",
                          }}
                        />
                      </Picker>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between rounded-t-xl bg-white p-4">
                    <View className="flex-row items-center gap-2">
                      <CaseSensitive size={16} />
                      <Text className='text-xl'>Case Sensitive</Text>
                    </View>

                    <View className="bg-gray-100 rounded-xl p-1">
                      <Switch
                        value={caseSensitive}
                        onValueChange={toggleCaseSensitive}
                      />
                    </View>
                  </View> 

                  <View className="flex-row items-center justify-between rounded-t-xl bg-white p-4">
                    <View className="flex-row items-center gap-2">
                      <BookCheck size={16} />
                      <Text className='text-xl'>Show Correct Answer</Text>
                    </View>

                    <View className="bg-gray-100 rounded-xl p-1">
                      <Switch
                        value={showCorrectAnswer}
                        onValueChange={toggleShowCorrectAnswer}
                      />
                    </View>
                  </View> 

                  <View className="flex-row items-center justify-between rounded-t-xl bg-white p-4">
                    <View className="flex-row items-center gap-2">
                      <BookCheck size={16} />
                      <Text className='text-xl'>Show Explanation</Text>
                    </View>

                    <View className="bg-gray-100 rounded-xl p-1">
                      <Switch
                        value={showExplanation}
                        onValueChange={toggleShowExplanation}
                      />
                    </View>
                  </View> 

                  <View className="flex-row items-center justify-between rounded-t-xl bg-white p-4">
                    <View className="flex-row items-center gap-2">
                      <Volume2 size={16} />
                      <Text className='text-xl'>Sounds</Text>
                    </View>

                    <View className="bg-gray-100 rounded-xl p-1">
                      <Switch
                        value={soundEnabled}
                        onValueChange={toggleSoundEnabled}
                      />
                    </View>
                  </View> 

                  <Pressable
                    onPress={() => {
                      settingSheet.close();
                      router.push({ pathname: '/questions/create', params: { lessonId } });
                    }}
                    className="flex-row items-center gap-2 rounded-t-xl bg-white p-4 active:bg-gray-100"
                  >
                    <Lightbulb size={16} />
                    <Text className="text-xl">Add Question</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      settingSheet.close();
                      router.push({ pathname: '/questions/browse', params: { lessonId } });
                    }}
                    className="flex-row items-center gap-2 bg-white p-4 active:bg-gray-100"
                  >
                    <Lightbulb size={16} />
                    <Text className="text-xl">Browse Questions</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      settingSheet.close();
                      router.back();
                    }}
                    className="flex-row items-center gap-2 rounded-b-xl bg-white p-4 active:bg-gray-100"
                  >
                    <LogOut size={16} />
                    <Text className="text-xl">Give Up</Text>
                  </Pressable>

                  <View style={{ height: insets.bottom }} />
                </Animated.View>
              </View>
            </Modal>
          </KeyboardAwareScrollView>
        </>

      ) : quizData.length > 0 ? (
        <View className="flex-1 items-center justify-center gap-6 p-6">
          <Trophy color="#4b5563" size={72} />
          <Text className="text-center text-xl font-semibold text-gray-700">
            You have answered every question correctly
          </Text>

          <DebouncedPressable
            onPress={handleQuizReset}
            className="rounded-xl bg-gray-600 px-8 py-4 active:bg-gray-700"
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
          <View className="gap-4 bg-white p-4" style={{ paddingBottom: insets.bottom }}>
            {currentQuestion.type === 'multiple_choice' ? (
              currentQuestion.questionAnswers.map((item) => (
                <Pressable
                  key={item.answer.id}
                  disabled={resultSheet.visible}
                  onPress={() => handleSubmitMultipleChoice(item.answer.id)}
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
                  editable={!resultSheet.visible}
                  placeholder="Type your answer"
                  autoCapitalize="none"
                  className="rounded-xl bg-gray-100 px-4 py-4 text-lg font-semibold"
                />

                <Pressable
                  disabled={resultSheet.visible || !identificationInput.trim()}
                  onPress={handleSubmitIdentification}
                  className="rounded-xl bg-gray-600 p-4 active:bg-gray-700 disabled:bg-gray-300"
                >
                  <Text className="text-center text-lg font-semibold text-white">Submit</Text>
                </Pressable>
              </>
            )}
          </View>
        </KeyboardStickyView>
      )}
    </View>
  );
}