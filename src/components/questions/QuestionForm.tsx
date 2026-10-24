import { EllipsisVertical, ImageOff, ImagePlus, CodeXml, Code, Trash2, ListMinus, ListPlus } from 'lucide-react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { NativeStackNavigationProp, useFocusEffect, useNavigation } from 'expo-router';
import { type WebViewAPI, CodeEditor } from '@actualwave/react-native-codeditor';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { QuestionFormData, questionSchema } from '@/schemas/question.schema';
import { Image, Pressable, Text, TextInput, View  } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ParamListBase } from 'expo-router/build/react-navigation';
import { setEditorLanguage } from '@/providers/setEditorLanguage';
import { useBottomSheet } from '@/hooks/UseBottomSheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useRef, useState } from 'react';
import { LANGUAGES } from '@/constants/languages';
import { useColorScheme } from 'nativewind';

import * as DocumentPicker from 'expo-document-picker';
import CustomPicker from '../shared/CustomPicker';
import BottomSheet from '../shared/BottomSheet';
import Header from '../shared/Header';
import AnswerRows from './AnswerRows';

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
    explanation: "",
    type: "multiple_choice",
    answers: [
      { answer: "", isCorrect: false },
      { answer: "", isCorrect: false },
    ],
  },
}: QuestionFormProps) {
  const editorApiRef = useRef<WebViewAPI | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const { colorScheme } = useColorScheme();

  const isLight = colorScheme === "light";

  const editorBackgroundColor = isLight
    ? "#f3f4f6" 
    : "#2B2B2B";

  const editorTheme = isLight 
    ? "basic" 
    : "darcula";

  const questionSheet = useBottomSheet();
  const insets = useSafeAreaInsets();

  const codeRef = useRef(defaultValues.code ?? "");
  const [editorReady, setEditorReady] = useState(false);
  const [codeVisible, setCodeVisible] = useState(!!defaultValues?.code?.trim());
  const [imageVisible, setImageVisible] = useState(!!defaultValues?.image?.trim());
  const [explanationVisible, setExplanationVisible] = useState(!!defaultValues?.explanation?.trim());

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
    codeRef.current = "";
    setImageVisible(false);
    setCodeVisible(!!data.code);

    reset({
      code: "",
      image: null,
      question: "",
      type: data.type,
      explanation: null,
      lessonId: data.lessonId,
      language: data.language ??  null,
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
  
  useFocusEffect(
    useCallback(() => {
      setEditorReady(false);

      const unsubscribe = navigation.addListener(
        'transitionEnd',
        (event) => {
          if (!event.data?.closing) {
            setEditorReady(true);
          }
        }
      );

      return () => {
        unsubscribe();
        setEditorReady(false);
        editorApiRef.current = null;
      };
    }, [navigation])
  );

  const initialCode = "\n".repeat(13);
  
  return (
    <View className="flex-1">
      <Header
        title="Questions"
        back={true}
        right={
          <Pressable 
            onPress={() => questionSheet.open()} 
            className="p-3 rounded-xl active:bg-gray-100 dark:active:bg-neutral-800"
          >
            <EllipsisVertical color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
          </Pressable>
        }
      />

      <KeyboardAwareScrollView
        mode="layout"
        bottomOffset={20}
        extraKeyboardSpace={12}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        className="flex-1"
      >
        <View className='gap-4 bg-white rounded-xl shadow-lg p-4 m-4 pb-8 dark:bg-neutral-800'>
          <View className="flex-row gap-2">
            {(['multiple_choice', 'identification'] as const).map((type) => (
              <Pressable
                key={type}
                onPress={() => handleTypeChange(type)}
                className={`flex-1 rounded-xl py-3 items-center ${questionType === type ? 'bg-gray-600' : 'bg-gray-100 dark:bg-neutral-700'}`}
              >
                <Text className={`font-semibold ${questionType === type ? 'text-white' : 'text-gray-600 dark:text-neutral-300'}`}>
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
                <Text className='text-gray-400 text-sm font-semibold mb-2'>
                  Question
                </Text>

                <TextInput
                  multiline
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Enter question"
                  placeholderTextColor={
                    colorScheme === "dark" ? "#a3a3a3" : "#9ca3af"
                  }
                  className="
                    text-gray-600 text-lg
                    bg-gray-100 rounded-xl px-2 py-4
                    dark:text-neutral-300
                    dark:bg-neutral-700
                  "
                />

                {errors.question && (
                  <Text className="text-red-400">
                    {errors.question.message}
                  </Text>
                )}
              </View>
            )}
          />

          {imageVisible && image && (
            <View className="gap-2">
              <Text className="text-gray-400 text-sm font-semibold">
                Image
              </Text>

              <Pressable
                onPress={() => void handleSelectImage()}
                accessibilityRole="button"
                accessibilityLabel="Change question image"
                className="p-4 rounded-xl bg-gray-100 dark:bg-neutral-700 active:opacity-70"
              >
                <Image
                  source={{ uri: image }}
                  className="h-56 w-full rounded-xl"
                  resizeMode="contain"
                />
              </Pressable>
            </View>
          )}

          {codeVisible && (
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-400 text-sm font-semibold">
                  Code
                </Text>

                <Controller
                  control={control}
                  name="language"
                  render={({ field }) => (
                    <CustomPicker
                      title="Languages"
                      placeholder='Language'
                      selectedValue={field.value}
                      onValueChange={(lang) => {
                        field.onChange(lang);
                        if (lang) {
                          void setEditorLanguage(editorApiRef.current, lang);
                        }
                      }}
                      options={LANGUAGES.map((lang) => ({
                        label: lang,
                        value: lang,
                      }))}
                    />
                  )}
                />
              </View>

              <View
                style={{
                  height: 200,
                  borderRadius: 12,
                  overflow: "hidden",
                }}
                className="bg-gray-100 dark:bg-neutral-800"
              >
                {editorReady ? (
                  <CodeEditor
                    content={codeRef.current || initialCode}
                    language="javascript"
                    theme={editorTheme}
                    backgroundColor={editorBackgroundColor}
                    onInitialized={async (api) => {
                      editorApiRef.current = api;
                      if (defaultValues.language) {
                        await setEditorLanguage(api, defaultValues.language);
                      }
                    }}
                    onContentUpdate={(updatedContent: string) => {
                      codeRef.current = updatedContent;
                      setValue("code", updatedContent, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                    onHistorySizeUpdate={() => {}}
                    onError={(err) => console.error("[editor]", err)}
                    onLog={(...args) => console.log("[editor]", ...args)}
                  />
                  
                ) : (
                  <View className="absolute inset-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-[#2B2B2B]">
                    <Text className="text-[12px] text-neutral-900 dark:text-neutral-300">
                      Initializing, please wait...
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {explanationVisible && (
            <Controller
              name="explanation"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <Text className="mb-2 text-sm font-semibold text-gray-400">
                    Explanation
                  </Text>

                  <TextInput
                    multiline
                    value={value ?? ""}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    textAlignVertical="top"
                    placeholder="Enter explanation"
                    placeholderTextColor={
                      colorScheme === "dark" ? "#a3a3a3" : "#9ca3af"
                    }
                    className="
                      text-gray-600 text-lg
                      bg-gray-100 rounded-xl px-2 py-4
                      dark:text-neutral-300
                      dark:bg-neutral-700
                    "
                  />

                  {errors.explanation && (
                    <Text className="text-red-400">
                      {errors.explanation.message}
                    </Text>
                  )}
                </View>
              )}
            />
          )}

          {errors.answers?.root?.message && (
            <Text className="text-red-400 mb-2">{errors.answers.root.message}</Text>
          )}

          {questionType === 'multiple_choice' ? (
            <View>
              <Text className='text-gray-400 text-sm font-semibold mb-2'>
                Answers
              </Text>

              {errors.answers?.root?.message && (
                <Text className="text-red-400">
                  {errors.answers.root.message}
                </Text>
              )}

              {fields.map((field, index) => (
                <AnswerRows
                  index={index}
                  key={field.id}
                  control={control}
                  onRemove={remove}
                  errorMessage={errors.answers?.[index]?.answer?.message}
                />
              ))}

              <Pressable
                onPress={() => append({ 
                  answer: '', 
                  isCorrect: false 
                })}
                className='
                  mx-1 py-2
                  border-2 border-gray-200 border-dashed  
                  active:bg-gray-50 mt-2 
                  dark:border-neutral-600 dark:active:bg-neutral-700
                '
              >
                <Text className="text-gray-400 text-sm text-center font-semibold">
                  Add answer
                </Text>
              </Pressable>
            </View>

          ) : (
            <Controller
              name="answers.0.answer"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <Text className='text-gray-400 text-sm font-semibold mb-2'>
                    Correct Answer
                  </Text>

                  <TextInput
                    multiline
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="Enter the correct answer"
                    placeholderTextColor={
                      colorScheme === "dark" ? "#a3a3a3" : "#9ca3af"
                    }
                    className="
                      text-gray-600 text-lg
                      bg-gray-100 rounded-xl px-2 py-4
                      dark:text-neutral-300
                      dark:bg-neutral-700
                    "
                  />

                  {errors.answers?.[0]?.answer && (
                    <Text className="text-red-400">
                      {errors.answers[0].answer.message}
                    </Text>
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
            <Text className="flex-1 text-white font-medium">
              1 question added
            </Text>
          </View>
        )}

        <View 
          className="
            flex-row items-center 
            border-gray-200 border-t
            bg-white p-4
            dark:bg-neutral-800 dark:border-neutral-800" 
          style={{ paddingBottom: insets.bottom }}
        >
          <Pressable
            disabled={isSubmitting}
            onPress={handleSubmit(handleFormSubmit)}
            className="
              rounded-full px-4 py-4 w-full
              bg-gray-600  active:bg-gray-500 
              dark:bg-neutral-700 dark:active:bg-neutral-600
            "
          >
            <Text className="text-white text-center text-lg font-semibold">
              Save Changes
            </Text>
          </Pressable>
        </View>
      </KeyboardStickyView>

      <BottomSheet
        sheet={questionSheet}
        className="px-4 pb-8"
        onRequestClose={() => questionSheet.close()} 
      >
        <View className="rounded-3xl bg-white dark:bg-neutral-700">
          <Pressable
            onPress={() => {
              questionSheet.close(() => {
                handleToggleCode();
              });
            }}
            className="
              flex-row items-center gap-2 
              rounded-t-3xl p-4 
              bg-white active:bg-gray-100
              dark:bg-neutral-700 dark:active:bg-neutral-600
            "
          >
            {codeVisible ? (
              <View className='flex-row items-center gap-2'>
                <CodeXml size={16} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
                <Text className="text-xl dark:text-neutral-300">
                  Remove code
                </Text>
              </View>
              
            ) : (
              <View className='flex-row items-center gap-2'>
                <Code size={16} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
                <Text className="text-xl dark:text-neutral-300">
                  Add code
                </Text>
              </View>
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              questionSheet.close(() => {
                if (imageVisible) {
                  handleRemoveImage();
                } else {
                  void handleSelectImage();
                } 
              });
            }}
            className="
              flex-row items-center gap-2 
              p-4 
              bg-white active:bg-gray-100
              dark:bg-neutral-700 dark:active:bg-neutral-600
            "
          >
            {imageVisible ? (
              <View className='flex-row items-center gap-2'>
                <ImageOff size={16} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
                <Text className="text-xl dark:text-neutral-300">
                  Remove image
                </Text>
              </View>

            ) : (
              <View className='flex-row items-center gap-2'>
                <ImagePlus size={16} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
                <Text className="text-xl dark:text-neutral-300">
                  Add image
                </Text>
              </View>
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              questionSheet.close(() => {
                setExplanationVisible((visible) => !visible);
              });
            }}
            className={`
              flex-row items-center gap-2 
              ${onDelete ? "" : "rounded-b-3xl"} p-4 
              bg-white active:bg-gray-100
              dark:bg-neutral-700 dark:active:bg-neutral-600
            `}
          >
            {explanationVisible ? (
              <View className='flex-row items-center gap-2'>
                <ListMinus size={16} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
                <Text className="text-xl dark:text-neutral-300">
                  Remove Explanation
                </Text>
              </View>
              
            ) : (
              <View className='flex-row items-center gap-2'>
                <ListPlus size={16} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
                <Text className="text-xl dark:text-neutral-300">
                  Add Explanation
                </Text>
              </View>
            )}
          </Pressable>

          {onDelete && (
            <Pressable
              onPress={() => {
                questionSheet.close(() => {
                  void onDelete();
                });
              }}
              className="
                flex-row items-center gap-2 
                rounded-b-3xl p-4 
                bg-white active:bg-gray-100
                dark:bg-neutral-700 dark:active:bg-neutral-600
              "
            >
              <Trash2 size={16} color="#ef4444" />
              <Text className="text-xl text-red-500">
                Delete question
              </Text>
            </Pressable>
          )}
        </View>
      </BottomSheet>
    </View>
  );
}