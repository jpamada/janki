import { EllipsisVertical, ImageOff, ImagePlus, CodeXml, Code, Trash2 } from 'lucide-react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { Animated, Image, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { useCallback, useRef, useState, lazy, Suspense, useEffect } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { QuestionFormData, questionSchema } from '@/schemas/question.schema';
import { type WebViewAPI } from '@actualwave/react-native-codeditor';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { setEditorLanguage } from '@/providers/setEditorLanguage';
import { getEditorHeight } from '@/helpers/codeditor.helper';
import { useBottomSheet } from '@/hooks/UseBottomSheet';
import { zodResolver } from '@hookform/resolvers/zod';

import * as DocumentPicker from 'expo-document-picker';
import LanguagePicker from './LanguagePicker';
import Header from '../shared/Header';
import AnswerRows from './AnswerRows';

const CodeEditor = lazy(() => import ('@actualwave/react-native-codeditor'));

type QuestionFormProps = {
  onCreateSuccess?: boolean;
  defaultValues?: QuestionFormData;
  onDelete?: () => void;
  onSubmit: (data: QuestionFormData) => Promise<void>;
};

export default function QuestionForm({
  onCreateSuccess,
  onSubmit,
  onDelete,
  defaultValues = {
    code: "",
    image: null,
    question: "",
    lessonId: "",
    language: null,
    type: "multiple_choice",
    answers: [
      { answer: "", isCorrect: false },
      { answer: "", isCorrect: false },
    ],
  },
}: QuestionFormProps) {

  const insets = useSafeAreaInsets();
  const editorApiRef = useRef<WebViewAPI | null>(null);

  const {
    backdropOpacity,
    open: openBottomSheet,
    close: closeBottomSheet,
    visible: bottomSheetVisible,
    translateY: bottomSheetTranslateY,
  } = useBottomSheet();

  const [codeVisible, setCodeVisible] = useState(!!defaultValues?.code?.trim());
  const [imageVisible, setImageVisible] = useState(!!defaultValues?.image?.trim());

  const { control, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues,
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'answers',
  });

  const image = useWatch({
    control,
    name: 'image',
  });

  const questionType = useWatch({ 
    control, 
    name: 'type' 
  });

  const handleTypeChange = useCallback((type: QuestionFormData['type']) => {
    setValue('type', type);

    if (type === 'identification') {
      replace([{ answer: fields[0]?.answer ?? '', isCorrect: true }]);

    } else {
      replace([
        { answer: '', isCorrect: false },
        { answer: '', isCorrect: false },
      ]);
    }
  }, [fields, replace, setValue]);

  const handleToggleCode = useCallback(() => {
    const next = !codeVisible;

    if (!next) {
      setValue('code', '');
      setValue('language', null);
    }

    setCodeVisible(next);
  }, [codeVisible, setValue]);

  const handleRemoveImage = () => {
    setValue('image', null, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setImageVisible(false);
  };

  const handleSelectImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        return;
      }

      const image = result.assets[0];

      setValue('image', image.uri, {
        shouldDirty: true,
        shouldValidate: true,
      });

      setImageVisible(true);
    } catch (error) {
      console.error('Failed to select image:', error);
    }
  };

  const handleFormSubmit = async (data: QuestionFormData) => {
    await onSubmit(data);
    setImageVisible(false);
    setCodeVisible(!!data.code);

    reset({
      code: "",
      image: null,
      question: "",
      type: data.type,
      language: data.language ??  null,
      lessonId: data.lessonId,
      answers: data.type === "identification"
      ? [
          { answer: "", isCorrect: true },
        ]
      : [
          { answer: "", isCorrect: false },
          { answer: "", isCorrect: false },
        ],
    });
  };

  useEffect(() => {
    void import("@actualwave/react-native-codeditor");
  }, []);

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

          {imageVisible && image && (
            <View className="gap-2">
              <Text className="text-gray-600 text-sm font-semibold">
                Image
              </Text>

              <Image
                source={{ uri: image }}
                className="h-56 w-full rounded-xl"
                resizeMode="contain"
              />
            </View>
          )}

          {codeVisible && (
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-600 text-sm font-semibold">Code</Text>

                <LanguagePicker
                  control={control}
                  onSelect={(lang) => {
                    setValue('language', lang);
                    void setEditorLanguage(editorApiRef.current, lang);
                  }}
                />
              </View>

              <Controller
                name="code"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <View style={{ 
                    height: getEditorHeight(value ?? ''), 
                    borderRadius: 12,
                    overflow: 'hidden' 
                  }}>
                    <Suspense
                      fallback={
                        <View className="flex-1 bg-gray-100 p-4">
                          <View className="mb-3 h-3 w-24 rounded-full bg-gray-200" />
                          <View className="mb-3 h-3 w-40 rounded-full bg-gray-200" />
                          <View className="mb-3 h-3 w-32 rounded-full bg-gray-200" />
                          <View className="h-3 w-48 rounded-full bg-gray-200" />
                        </View>
                      }
                    >
                      <CodeEditor
                        content={value ?? ''}
                        language="javascript"
                        theme="basic"
                        onInitialized={async (api) => {
                          editorApiRef.current = api;
                          if (defaultValues.language) {
                            await setEditorLanguage(api, defaultValues.language);
                          }
                        }}
                        onContentUpdate={onChange}
                        onHistorySizeUpdate={() => {}}
                        onLog={(...args) => console.log('[editor]', ...args)}
                        onError={(err) => console.error('[editor]', err)}
                      />
                    </Suspense>
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
                <AnswerRows
                  key={field.id}
                  control={control}
                  index={index}
                  errorMessage={errors.answers?.[index]?.answer?.message}
                  onRemove={remove}
                />
              ))}

              <Pressable
                onPress={() => append({ answer: '', isCorrect: false })}
                className='border-2 border-gray-200 border-dashed mx-1 py-2 active:bg-gray-50 mt-2'
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
          <View className="h-12 flex-row items-center bg-gray-600 rounded-xl px-4 mx-2 my-2">
            <Text className="flex-1 text-white font-medium">1 question added</Text>
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
                  closeBottomSheet(() => {
                    handleToggleCode();
                  });
                }}
                className="flex-row items-center gap-2 rounded-3xl p-4 active:bg-gray-100"
              >
                {codeVisible ? (
                  <View className='flex-row items-center gap-2'>
                    <CodeXml size={16} />
                    <Text className="text-xl">Remove code</Text>
                  </View>
                ) : (
                  <View className='flex-row items-center gap-2'>
                    <Code size={16} />
                    <Text className="text-xl">Add code</Text>
                  </View>
                )}
              </Pressable>

              <Pressable
                onPress={() => {
                  closeBottomSheet(() => {
                    if (imageVisible) {
                      handleRemoveImage();
                    } else {
                      void handleSelectImage();
                    } 
                  });
                }}
                className="rounded-3xl p-4 active:bg-gray-100"
              >
                {imageVisible ? (
                  <View className='flex-row items-center gap-2'>
                    <ImageOff size={16} />
                    <Text className="text-xl">Remove image</Text>
                  </View>
                ) : (
                  <View className='flex-row items-center gap-2'>
                    <ImagePlus size={16} />
                    <Text className="text-xl">Add image</Text>
                  </View>
                )}
              </Pressable>

              {onDelete && (
                <Pressable
                  onPress={() => {
                    closeBottomSheet(() => {
                      void onDelete();
                    });
                  }}
                  className="flex-row items-center gap-2 rounded-3xl p-4 active:bg-gray-100"
                >
                  <Trash2 size={16} color="#ef4444" />
                  <Text className="text-xl text-red-500">
                    Delete question
                  </Text>
                </Pressable>
              )}
            </View>

            <View style={{ height: insets.bottom }} />
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}