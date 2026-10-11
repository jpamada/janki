import { AArrowUp, BookCheck, CaseSensitive, Palette, TextAlignStart, Vibrate, Volume2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "@/contexts/SettingsContext";
import { ScrollView, Text, View } from "react-native";
import { Switch } from "react-native-gesture-handler";

import CustomPicker from "@/components/shared/CustomPicker";
import Header from "@/components/shared/Header";

export default function AppearanceScreen() {
  const { settings, updateSettings } = useSettings();

  const insets = useSafeAreaInsets();

  return (
    <View 
      className='flex-1 bg-white dark:bg-neutral-900' 
      style={{ paddingBottom: insets.bottom }}
    >
      <Header title="Visuals and Sound" back />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 py-4"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-gray-400 text-sm font-semibold mb-2">
          System
        </Text>

        <View className='
          flex flex-row items-center justify-between gap-4 
          bg-gray-50 rounded-lg p-4 mb-4
          dark:bg-neutral-800
        '>
          <View className="flex-1 flex-row items-center gap-4 min-w-0">
            <View className='bg-white rounded-xl p-2 dark:bg-neutral-700'>
              <Palette color="#9ca3af" />
            </View>

            <View className="flex-1 min-w-0 gap-1">
              <Text className='text-gray-600 font-bold dark:text-neutral-300'>
                Theme
              </Text>
              <Text className="text-gray-400 text-sm">
                Customize the app&apos;s appearance.
              </Text>
            </View>
          </View>

          <View className="rounded-xl">
            <CustomPicker
              title="Theme"
              className="dark:bg-neutral-600"
              selectedValue={settings.theme}
              onValueChange={(value) => updateSettings({ theme: value })}
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
          <View className='
            flex flex-row items-center justify-between gap-4 
          bg-gray-50 rounded-lg p-4 mb-4
          dark:bg-neutral-800
          '>
            <View className="flex-1 flex-row items-center gap-4 min-w-0">
              <View className='bg-white rounded-xl p-2 dark:bg-neutral-700'>
                <AArrowUp color="#9ca3af" />
              </View>

              <View className="flex-1 min-w-0 gap-1">
                <Text className='text-gray-600 font-bold dark:text-neutral-300'>
                  Font Size
                </Text>
                <Text className="text-gray-400 text-sm">
                  Adjusts question font size.
                </Text>
              </View>
            </View>

            <View className="rounded-xl">
              <CustomPicker
                title="Font Size"
                className="dark:bg-neutral-600"
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

          <View className='
            flex flex-row items-center justify-between gap-4 
            bg-gray-50 rounded-lg p-4 mb-4
            dark:bg-neutral-800
          '>
            <View className="flex-1 flex-row items-center gap-4 min-w-0">
              <View className='bg-white rounded-xl p-2 dark:bg-neutral-700'>
                <TextAlignStart color="#9ca3af" />
              </View>

              <View className="flex-1 min-w-0 gap-1">
                <Text className='text-gray-600 font-bold dark:text-neutral-300'>
                  Text Align
                </Text>
                <Text className="text-gray-400 text-sm">
                  Enable to align question texts.
                </Text>
              </View>
            </View>

            <View className="rounded-xl">
              <CustomPicker
                title='Text Alignment'
                className="dark:bg-neutral-600"
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

          <View className='
            flex flex-row items-center justify-between gap-4 
            bg-gray-50 rounded-lg p-4 mb-4
            dark:bg-neutral-800
          '>
            <View className="flex-1 flex-row items-center gap-4 min-w-0">
              <View className='bg-white rounded-xl p-2 dark:bg-neutral-700'>
                <CaseSensitive color="#9ca3af" />
              </View>

              <View className="flex-1 min-w-0 gap-1">
                <Text className='text-gray-600 font-bold dark:text-neutral-300'>
                  Case Sensitive
                </Text>
                <Text className="text-gray-400 text-sm">
                  Match uppercase and lowercase letters.
                </Text>
              </View>
            </View>

            <View className="bg-gray-100 rounded-xl p-1 dark:bg-neutral-600">
              <Switch 
                value={settings.caseSensitive}
                onValueChange={(value) => updateSettings({ caseSensitive: value })}
              />
            </View>
          </View>

          <View className='
            flex flex-row items-center justify-between gap-4 
            bg-gray-50 rounded-lg p-4 mb-4
            dark:bg-neutral-800
          '>
            <View className="flex-1 flex-row items-center gap-4 min-w-0">
              <View className='bg-white rounded-xl p-2 dark:bg-neutral-700'>
                <BookCheck color="#9ca3af" />
              </View>

              <View className="flex-1 min-w-0 gap-1">
                <Text className='text-gray-600 font-bold dark:text-neutral-300'>
                  Show Correct Answer
                </Text>
                <Text className="text-gray-400 text-sm">
                  Show the correct answer after answering the question.
                </Text>
              </View>
            </View>

            <View className="bg-gray-100 rounded-xl p-1 dark:bg-neutral-600">
              <Switch 
                value={settings.showCorrectAnswer}
                onValueChange={(value) => updateSettings({ showCorrectAnswer: value })}
              />
            </View>
          </View>

          <View className='
            flex flex-row items-center justify-between gap-4 
            bg-gray-50 rounded-lg p-4 mb-4
            dark:bg-neutral-800
          '>
            <View className="flex-1 flex-row items-center gap-4 min-w-0">
              <View className='bg-white rounded-xl p-2 dark:bg-neutral-700'>
                <BookCheck color="#9ca3af" />
              </View>

              <View className="flex-1 min-w-0 gap-1">
                <Text className='text-gray-600 font-bold dark:text-neutral-300'>
                  Show Explanation
                </Text>
                <Text className="text-gray-400 text-sm">
                  Show the explanation after answering the question.
                </Text>
              </View>
            </View>

            <View className="bg-gray-100 rounded-xl p-1 dark:bg-neutral-600">
              <Switch 
                value={settings.showExplanation}
                onValueChange={(value) => updateSettings({ showExplanation: value })}
              />
            </View>
          </View>

          <Text className="text-gray-400 text-sm font-semibold mb-2">
            Sounds
          </Text>

          <View className='
            flex flex-row items-center justify-between gap-4 
            bg-gray-50 rounded-lg p-4 mb-4
            dark:bg-neutral-800
          '>
            <View className="flex-1 flex-row items-center gap-4 min-w-0">
              <View className='bg-white rounded-xl p-2 dark:bg-neutral-700'>
                <Volume2 color="#9ca3af" />
              </View>

              <View className="flex-1 min-w-0 gap-1">
                <Text className='text-gray-600 font-bold dark:text-neutral-300'>
                  Enable Sounds
                </Text>
                <Text className="text-gray-400 text-sm">
                  Allow sound affects.
                </Text>
              </View>
            </View>

            <View className="bg-gray-100 rounded-xl p-1 dark:bg-neutral-600">
              <Switch 
                value={settings.soundEnabled}
                onValueChange={(value) => updateSettings({ soundEnabled: value })}
              />
            </View>
          </View>

          <View className='
            flex flex-row items-center justify-between gap-4 
            bg-gray-50 rounded-lg p-4 mb-4
            dark:bg-neutral-800
          '>
            <View className="flex-1 flex-row items-center gap-4 min-w-0">
              <View className='bg-white rounded-xl p-2 dark:bg-neutral-700'>
                <Vibrate color="#9ca3af" />
              </View>

              <View className="flex-1 min-w-0 gap-1">
                <Text className='text-gray-600 font-bold dark:text-neutral-300'>
                  Enable Haptics
                </Text>
                <Text className="text-gray-400 text-sm">
                  Allow haptic vibrations.
                </Text>
              </View>
            </View>

            <View className="bg-gray-100 rounded-xl p-1 dark:bg-neutral-600">
              <Switch 
                value={settings.hapticsEnabled}
                onValueChange={(value) => updateSettings({ hapticsEnabled: value })}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}