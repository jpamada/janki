import { updateCaseSensitivity, updateFontSize, updateHapticsEnabled, updateShowCorrectAnswer, updateSoundEnabled, updateTextAlign, updateTheme } from "@/repositories/settings.repository";
import { AArrowUp, BookCheck, CaseSensitive, Palette, TextAlignStart, Vibrate, Volume2 } from "lucide-react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, Text, View } from "react-native";
import { Switch } from "react-native-gesture-handler";
import { Picker } from "@react-native-picker/picker";

import Header from "@/components/shared/Header";
import { useSettings } from "@/contexts/SettingsContext";

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

  const updateCaseSensitivityMutation = useMutation({
    mutationFn: updateCaseSensitivity,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["settings"],
      });
    },
  });

  const updateShowCorrectAnswerMutation = useMutation({
    mutationFn: updateShowCorrectAnswer,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["settings"],
      });
    },
  });

  const updateSoundEnabledMutation = useMutation({
    mutationFn: updateSoundEnabled,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["settings"],
      });
    },
  });

  const updateHapticsEnabledMutation = useMutation({
    mutationFn: updateHapticsEnabled,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["settings"],
      });
    },
  });

  const toggleCaseSensitivity = (value: boolean) => {
    updateCaseSensitivityMutation.mutate(value);
  };

  const toggleShowCorrectAnswer = (value: boolean) => {
    updateShowCorrectAnswerMutation.mutate(value);
  };

  const toggleSoundEnabled = (value: boolean) => {
    updateSoundEnabledMutation.mutate(value);
  };

  const toggleHapticsEnabled = (value: boolean) => {
    updateHapticsEnabledMutation.mutate(value);
  };

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

        <View className='flex flex-row items-center  justify-between gap-4 p-4 bg-gray-50 rounded-lg mb-4 active:bg-gray-100'>
          <View className="flex flex-row items-center gap-2">
            <View className='bg-white rounded-xl p-2'>
              <Palette color="#9ca3af" />
            </View>

            <Text className='text-gray-600 font-bold'>
              Theme
            </Text>
          </View>

          <View className="bg-gray-100 rounded-xl">
            <Picker
              selectedValue={settings?.theme ?? "light"}
              onValueChange={(value) =>
                updateThemeMutation.mutate(value)
              }
              style={{ 
                width: 120, 
                height: 50
              }}
            >
              <Picker.Item 
                label="Light" 
                value="light" 
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                }} 
              />
              <Picker.Item  
                label="Dark" 
                value="dark" 
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                }}
              />
            </Picker>
          </View>
        </View>

        <Text className="text-gray-400 text-sm font-semibold mb-2">
          Quiz
        </Text>

        <View className="flex flex-col">
          <View className='flex flex-row items-center  justify-between gap-4 p-4 bg-gray-50 rounded-lg mb-4 active:bg-gray-100'>
            <View className="flex flex-row items-center gap-2">
              <View className='bg-white rounded-xl p-2'>
                <AArrowUp color="#9ca3af" />
              </View>

              <Text className='text-gray-600 font-bold'>
                Font Size
              </Text>
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
                    fontSize: 12,
                    color: "#6b7280",
                  }} 
                />
                <Picker.Item  
                  label="Default" 
                  value={20}
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                  }}
                />
                <Picker.Item  
                  label="Large" 
                  value={36}
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                  }}
                />
              </Picker>
            </View>
          </View>

          <View className='flex flex-row items-center  justify-between gap-4 p-4 bg-gray-50 rounded-lg mb-4 active:bg-gray-100'>
            <View className="flex flex-row items-center gap-2">
              <View className='bg-white rounded-xl p-2'>
                <TextAlignStart color="#9ca3af" />
              </View>

              <Text className='text-gray-600 font-bold'>
                Text Align
              </Text>
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
                    fontSize: 12,
                    color: "#6b7280",
                  }} 
                />
                <Picker.Item  
                  label="Center" 
                  value="center" 
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                  }}
                />
                <Picker.Item  
                  label="Justify" 
                  value="justify" 
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                  }}
                />
              </Picker>
            </View>
          </View>

          <View className='flex flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg mb-4 active:bg-gray-100'>
            <View className="flex-1 flex-row items-center gap-4 min-w-0">
              <View className='bg-white rounded-xl p-2'>
                <CaseSensitive color="#9ca3af" />
              </View>

              <View className="flex-1 min-w-0 gap-1">
                <Text className='text-gray-600 font-bold'>
                  Case Sensitive
                </Text>
                <Text className="text-gray-400 text-sm">
                  
                </Text>
              </View>
            </View>

            <View className="bg-gray-100 rounded-xl p-1">
              <Switch 
                value={settings?.caseSensitive}
                onValueChange={toggleCaseSensitivity}
              />
            </View>
          </View>

          <View className='flex flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg mb-4 active:bg-gray-100'>
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
                value={settings?.showCorrectAnswer}
                onValueChange={toggleShowCorrectAnswer}
              />
            </View>
          </View>

          <Text className="text-gray-400 text-sm font-semibold mb-2">
            Sounds
          </Text>

          <View className='flex flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg mb-4 active:bg-gray-100'>
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
                value={settings?.soundEnabled}
                onValueChange={toggleSoundEnabled}
              />
            </View>
          </View>

          <View className='flex flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg mb-4 active:bg-gray-100'>
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
                value={settings?.hapticsEnabled}
                onValueChange={toggleHapticsEnabled}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}