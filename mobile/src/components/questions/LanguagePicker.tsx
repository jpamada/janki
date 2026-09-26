import { type QuestionFormData } from '@/schemas/question.schema';
import { useWatch, type Control } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';
import { LANGUAGES } from '@/constants/languages';
import { memo } from 'react';

type LanguagePickerProps = {
  control: Control<QuestionFormData>;
  onSelect: (lang: (typeof LANGUAGES)[number]) => void;
};

function LanguagePicker({ control, onSelect }: LanguagePickerProps) {
  const language = useWatch({ control, name: 'language' });

  return (
    <View className="flex-row gap-2">
      {LANGUAGES.map((lang) => (
        <Pressable
          key={lang}
          onPress={() => onSelect(lang)}
          className={`px-3 py-1 rounded-full ${language === lang ? 'bg-gray-600' : 'bg-gray-100'}`}
        >
          <Text className={`text-xs font-semibold ${language === lang ? 'text-white' : 'text-gray-600'}`}>
            {lang}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export default memo(LanguagePicker);