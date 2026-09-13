import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { QuestionFormData, questionSchema } from '@/schemas/question.schema';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EllipsisVertical, Square, SquareCheck, Trash2, Code2 } from 'lucide-react-native';
import { Animated, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { lazy, Suspense } from "react";

const CodeEditor = lazy(() => import('@actualwave/react-native-codeditor'));
import type { WebViewAPI } from '@actualwave/react-native-codeditor';

import Header from '../shared/Header';
import { useBottomSheet } from '@/hooks/UseBottomSheet';
import { LANGUAGES } from '@/constants/languages';

type QuestionFormProps = {
  onCreateSuccess?: boolean;
  onSubmit: (data: QuestionFormData) => Promise<void>;
  defaultValues?: QuestionFormData;
};

export default function QuestionForm({
  onCreateSuccess,
  onSubmit,
  defaultValues = {
    type: "multiple_choice",
    question: "",
    code: "",
    language: null,
    lessonId: "",
    answers: [
      { answer: "", isCorrect: false },
      { answer: "", isCorrect: false },
    ],
  },
}: QuestionFormProps) {

  const insets = useSafeAreaInsets();
  const editorApiRef = useRef<WebViewAPI | null>(null);

  const [codeVisible, setCodeVisible] = useState(!!defaultValues?.code?.trim());

  const {
    backdropOpacity,
    open: openBottomSheet,
    close: closeBottomSheet,
    visible: bottomSheetVisible,
    translateY: bottomSheetTranslateY,
  } = useBottomSheet();

  const { control, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues,
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'answers',
  });

  const questionType = useWatch({ control, name: 'type' });
  const language = useWatch({ control, name: 'language' });

  const handleTypeChange = (type: QuestionFormData['type']) => {
    setValue('type', type);

    if (type === 'identification') {
      replace([{ answer: fields[0]?.answer ?? '', isCorrect: true }]);

    } else {
      replace([
        { answer: '', isCorrect: false },
        { answer: '', isCorrect: false },
      ]);
    }
  };

  const handleToggleCode = () => {
    setCodeVisible((prev) => {
      const next = !prev;
      if (!next) {
        setValue('code', '');
        setValue('language', null);
      }
      return next;
    });
  };

  const handleFormSubmit = async (data: QuestionFormData) => {
  await onSubmit(data);

  setCodeVisible(false);

  reset({
    type: data.type,
    question: "",
    code: "",
    language: null,
    lessonId: data.lessonId,

    answers:
      data.type === "identification"
        ? [
            {
              answer: "",
              isCorrect: true,
            },
          ]
        : [
            {
              answer: "",
              isCorrect: false,
            },
            {
              answer: "",
              isCorrect: false,
            },
          ],
  });
};

  return (
    <View className="flex-1">
      <Header
        title="Questions"
        back={true}
        right={
          <Pressable onPress={openBottomSheet} className="p-3 rounded-xl active:bg-gray-100">
            <EllipsisVertical />
          </Pressable>
        }
      />

      <KeyboardAwareScrollView
        bottomOffset={20}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        className="flex-1 mb-2 pb-32"
      >
        <View className='gap-4 bg-white rounded-xl shadow-lg p-4 m-4 pb-8'>

          <View className="flex-row gap-2">
            {(['multiple_choice', 'identification'] as const).map((type) => (
              <Pressable
                key={type}
                onPress={() => handleTypeChange(type)}
                className={`flex-1 rounded-xl py-3 items-center ${questionType === type ? 'bg-gray-600' : 'bg-gray-100'}`}
              >
                <Text className={`font-semibold ${questionType === type ? 'text-white' : 'text-gray-600'}`}>
                  {type === 'multiple_choice' ? 'Multiple Choice' : 'Identification'}
                </Text>
              </Pressable>
            ))}
          </View>

          <Controller
            name="question"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <Text className='text-gray-600 text-sm font-semibold mb-2'>
                  Question
                </Text>

                <TextInput
                  multiline
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Enter question"
                  className='bg-gray-100 rounded-xl font-semibold px-2 py-4'
                />

                {errors.question && (
                  <Text className="text-red-400">{errors.question.message}</Text>
                )}
              </View>
            )}
          />

          {codeVisible && (
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-600 text-sm font-semibold">Code</Text>

                <View className="flex-row gap-2">
                  {LANGUAGES.map((lang) => (
                    <Pressable
                      key={lang}
                      onPress={() => {
                        setValue('language', lang);
                        void editorApiRef.current?.editor.setLanguage(lang);
                      }}
                      className={`px-3 py-1 rounded-full ${language === lang ? 'bg-gray-600' : 'bg-gray-100'}`}
                    >
                      <Text className={`text-xs font-semibold ${language === lang ? 'text-white' : 'text-gray-600'}`}>
                        {lang}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Controller
                name="code"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <View style={{ height: 240, borderRadius: 12, overflow: 'hidden' }}>
                    <CodeEditor
                      content={value ?? ''}
                      language={defaultValues.language ?? 'javascript'}
                      theme="basic"
                      onInitialized={(api) => { editorApiRef.current = api; }}
                      onContentUpdate={onChange}
                      onHistorySizeUpdate={() => {}}
                      onLog={(...args) => console.log('[editor]', ...args)}
                      onError={(err) => console.error('[editor]', err)}
                    />
                  </View>
                )}
              />
            </View>
          )}

          {errors.answers?.root?.message && (
            <Text className="text-red-400 mb-2">{errors.answers.root.message}</Text>
          )}

          {questionType === 'multiple_choice' ? (
            <View>
              <Text className='text-gray-600 text-sm font-semibold mb-2'>
                Answers
              </Text>

              {errors.answers?.root?.message && (
                <Text className="text-red-400">{errors.answers.root.message}</Text>
              )}

              {fields.map((field, index) => (
                <View key={field.id} className='px-1 py-2'>
                  <View className='flex flex-row justify-between items-center mb-1'>
                    <Text className='text-gray-600 text-lg font-semibold'>{index + 1}</Text>

                    <View className='flex flex-row'>
                      <Controller
                        name={`answers.${index}.isCorrect`}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Pressable onPress={() => onChange(!value)} className='p-2 rounded-xl active:bg-gray-100'>
                            {value ? (
                              <View className='flex flex-row items-center gap-1'>
                                <Text className='text-gray-600 font-semibold'>Correct</Text>
                                <SquareCheck color="#4b5563" size={24} />
                              </View>
                            ) : (
                              <View className='flex flex-row items-center gap-1'>
                                <Text className='text-gray-600 font-semibold'>Incorrect</Text>
                                <Square color="#4b5563" size={24} />
                              </View>
                            )}
                          </Pressable>
                        )}
                      />

                      <Pressable onPress={() => remove(index)} className='p-2 rounded-xl active:bg-gray-100'>
                        <Trash2 color="#4b5563" size={24} />
                      </Pressable>
                    </View>
                  </View>

                  <Controller
                    name={`answers.${index}.answer`}
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View>
                        <TextInput
                          multiline
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          placeholder="Enter answer"
                          className='bg-gray-100 rounded-xl font-semibold px-2 py-4'
                        />

                        {errors.answers?.[index]?.answer && (
                          <Text className="text-red-400">{errors.answers[index].answer.message}</Text>
                        )}
                      </View>
                    )}
                  />
                </View>
              ))}

              <Pressable
                onPress={() => append({ answer: '', isCorrect: false })}
                className='border-2 border-gray-200 border-dashed mx-1 py-2 active:bg-gray-50'
              >
                <Text className="text-gray-300 text-sm text-center font-semibold">Add answer</Text>
              </Pressable>
            </View>
          ) : (
            <Controller
              name="answers.0.answer"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <Text className='text-gray-600 text-sm font-semibold mb-2'>Correct Answer</Text>

                  <TextInput
                    multiline
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="Enter the correct answer"
                    className='bg-gray-100 rounded-xl font-semibold px-2 py-4'
                  />

                  {errors.answers?.[0]?.answer && (
                    <Text className="text-red-400">{errors.answers[0].answer.message}</Text>
                  )}
                </View>
              )}
            />
          )}
        </View>
      </KeyboardAwareScrollView>

      <KeyboardStickyView offset={{ closed: 0, opened: insets.top }}>
        {onCreateSuccess && (
          <View className="h-12 flex-row items-center bg-gray-100 rounded-xl px-4 mx-2 my-2">
            <Text className="text-gray-600 font-medium">1 question added</Text>
          </View>
        )}

        <View className="flex-row items-center border-t border-gray-200 bg-white px-4 py-6" style={{ paddingBottom: insets.bottom }}>
          <Pressable
            disabled={isSubmitting}
            onPress={handleSubmit(handleFormSubmit)}
            className="bg-gray-600 rounded-full px-4 py-4 w-full active:bg-gray-500"
          >
            <Text className="text-white text-center text-lg font-semibold">Save Changes</Text>
          </Pressable>
        </View>
      </KeyboardStickyView>

      <Modal transparent animationType="none" visible={bottomSheetVisible} onRequestClose={() => closeBottomSheet()}>
        <View className="flex-1 justify-end">
          <Animated.View className="absolute inset-0 bg-black/40" style={{ opacity: backdropOpacity }}>
            <Pressable className="flex-1" onPress={() => closeBottomSheet()} />
          </Animated.View>

          <Animated.View style={{ transform: [{ translateY: bottomSheetTranslateY }] }} className="rounded-t-3xl bg-gray-50 px-4 py-8">
            <View className="rounded-3xl bg-white">
              <Pressable
                onPress={() => {
                  handleToggleCode();
                  closeBottomSheet();
                }}
                className="flex-row items-center gap-2 rounded-3xl p-4 active:bg-gray-100"
              >
                <Code2 size={16} />
                <Text className="text-xl">{codeVisible ? 'Remove code' : 'Add code'}</Text>
              </Pressable>
            </View>

            <View style={{ height: insets.bottom }} />
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}