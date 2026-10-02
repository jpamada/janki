import { updateCaseSensitivity, updateFontSize, updateHapticsEnabled, updateShowCorrectAnswer, updateShowExplanation, updateSoundEnabled, updateTextAlign, updateTheme } from "@/repositories/settings.repository";
import { AArrowUp, BookCheck, CaseSensitive, Palette, TextAlignStart, Vibrate, Volume2 } from "lucide-react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";
import { useSettings } from "@/contexts/SettingsContext";
import { ScrollView, Text, View } from "react-native";
import { Switch } from "react-native-gesture-handler";

import Header from "@/components/shared/Header";
import CustomPicker from "@/components/shared/CustomPicker";

export default function AppearanceScreen() {
  const { settings } = useSettings();

  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const updateThemeMutation = useMutation({
    mutationFn: updateTheme,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["settings"],
      });
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

  const [hapticsEnabled, toggleHapticsEnabled] = useOptimisticToggle(
    settings?.hapticsEnabled,
    updateHapticsEnabled,
    ["settings"],
  );

  return (
    <View className='flex-1 bg-white'>
      <Header title="Visuals and Sound" back />

      <ScrollView
        className="flex-1 px-6 py-4"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-8"
        contentContainerStyle={{
          paddingBottom: insets.bottom + 24,
        }}
      >
        <Text className="text-gray-400 text-sm font-semibold mb-2">
          System
        </Text>

        <View className='flex flex-row items-center  justify-between gap-4 p-4 bg-gray-50 rounded-lg mb-4'>
          <View className="flex-1 flex-row items-center gap-4 min-w-0">
            <View className='bg-white rounded-xl p-2'>
              <Palette color="#9ca3af" />
            </View>

            <View className="flex-1 min-w-0 gap-1">
              <Text className='text-gray-600 font-bold'>
                Theme
              </Text>
              <Text className="text-gray-400 text-sm">
                Change the theme of the app.
              </Text>
            </View>
          </View>

          <View className="bg-gray-100 rounded-xl">
            <CustomPicker
              title="Theme"
              selectedValue={settings?.theme ?? "light"}
              onValueChange={(value) => updateThemeMutation.mutate(value)}
              options={[
                { label: 'Light', value: "light" },
                { label: 'Dark', value: "dark" },
              ]}
            />
          </View>
        </View>

        <Text className="text-gray-400 text-sm font-semibold mb-2">
          Quiz
        </Text>

        <View className="flex flex-col">
          <View className='flex-row items-center  justify-between gap-4 p-4 bg-gray-50 rounded-lg mb-4'>
            <View className="flex-1 flex-row items-center gap-4 min-w-0">
              <View className='bg-white rounded-xl p-2'>
                <AArrowUp color="#9ca3af" />
              </View>

              <View className="flex-1 min-w-0 gap-1">
                <Text className='text-gray-600 font-bold'>
                  Font Size
                </Text>
                <Text className="text-gray-400 text-sm">
                  Adjusts question font size.
                </Text>
              </View>
            </View>

            <View className="bg-gray-100 rounded-xl">
              <CustomPicker
                title="Font Size"
                selectedValue={settings?.questionFontSize ?? 20}
                onValueChange={(value) => updateFontSizeMutation.mutate(value)}
                options={[
                  { label: 'Small', value: 14 },
                  { label: 'Default', value: 20 },
                  { label: 'Large', value: 36 },
                ]}
              />
            </View>
          </View>

          <View className='flex flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg mb-4'>
            <View className="flex-1 flex-row items-center gap-4 min-w-0">
              <View className='bg-white rounded-xl p-2'>
                <TextAlignStart color="#9ca3af" />
              </View>

              <View className="flex-1 min-w-0 gap-1">
                <Text className='text-gray-600 font-bold'>
                  Text Align
                </Text>
                <Text className="text-gray-400 text-sm">
                  Enable to align question texts.
                </Text>
              </View>
            </View>

            <View className="bg-gray-100 rounded-xl">
              <CustomPicker
                title='Text Alignment'
                selectedValue={settings?.questionTextAlign ?? "left"}
                onValueChange={(value) => updateTextAlignMutation.mutate(value)}
                options={[
                  { label: "Left", value:"left" },
                  { label: "Center", value:"center" },
                  { label: "Justify", value:"justify" },
                ]}
              />
            </View>
          </View>

          <View className='flex flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg mb-4'>
            <View className="flex-1 flex-row items-center gap-4 min-w-0">
              <View className='bg-white rounded-xl p-2'>
                <CaseSensitive color="#9ca3af" />
              </View>

              <View className="flex-1 min-w-0 gap-1">
                <Text className='text-gray-600 font-bold'>
                  Case Sensitive
                </Text>
                <Text className="text-gray-400 text-sm">
                  Enable to make answers more accurate.
                </Text>
              </View>
            </View>

            <View className="bg-gray-100 rounded-xl p-1">
              <Switch 
                value={caseSensitive}
                onValueChange={toggleCaseSensitive}
              />
            </View>
          </View>

          <View className='flex flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg mb-4'>
            <View className="flex-1 flex-row items-center gap-4 min-w-0">
              <View className='bg-white rounded-xl p-2'>
                <BookCheck color="#9ca3af" />
              </View>

              <View className="flex-1 min-w-0 gap-1">
                <Text className='text-gray-600 font-bold'>
                  Show Correct Answer
                </Text>
                <Text className="text-gray-400 text-sm">
                  Show the correct answer after answering the question.
                </Text>
              </View>
            </View>

            <View className="bg-gray-100 rounded-xl p-1">
              <Switch 
                value={showCorrectAnswer}
                onValueChange={toggleShowCorrectAnswer}
              />
            </View>
          </View>

          <View className='flex flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg mb-4'>
            <View className="flex-1 flex-row items-center gap-4 min-w-0">
              <View className='bg-white rounded-xl p-2'>
                <BookCheck color="#9ca3af" />
              </View>

              <View className="flex-1 min-w-0 gap-1">
                <Text className='text-gray-600 font-bold'>
                  Show Explanation
                </Text>
                <Text className="text-gray-400 text-sm">
                  Show the explanation after answering the question.
                </Text>
              </View>
            </View>

            <View className="bg-gray-100 rounded-xl p-1">
              <Switch 
                value={showExplanation}
                onValueChange={toggleShowExplanation}
              />
            </View>
          </View>

          <Text className="text-gray-400 text-sm font-semibold mb-2">
            Sounds
          </Text>

          <View className='flex flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg mb-4'>
            <View className="flex-1 flex-row items-center gap-4 min-w-0">
              <View className='bg-white rounded-xl p-2'>
                <Volume2 color="#9ca3af" />
              </View>

              <View className="flex-1 min-w-0 gap-1">
                <Text className='text-gray-600 font-bold'>
                  Enable Sounds
                </Text>
                <Text className="text-gray-400 text-sm">
                  Allow sound affects.
                </Text>
              </View>
            </View>

            <View className="bg-gray-100 rounded-xl p-1">
              <Switch 
                value={soundEnabled}
                onValueChange={toggleSoundEnabled}
              />
            </View>
          </View>

          <View className='flex flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg mb-4'>
            <View className="flex-1 flex-row items-center gap-4 min-w-0">
              <View className='bg-white rounded-xl p-2'>
                <Vibrate color="#9ca3af" />
              </View>

              <View className="flex-1 min-w-0 gap-1">
                <Text className='text-gray-600 font-bold'>
                  Enable Haptics
                </Text>
                <Text className="text-gray-400 text-sm">
                  Allow haptic vibrations.
                </Text>
              </View>
            </View>

            <View className="bg-gray-100 rounded-xl p-1">
              <Switch 
                value={hapticsEnabled}
                onValueChange={toggleHapticsEnabled}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}