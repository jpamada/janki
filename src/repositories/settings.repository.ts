import AsyncStorage from "@react-native-async-storage/async-storage";

export type Settings = {
  soundEnabled: boolean;
  caseSensitive: boolean;
  hapticsEnabled: boolean;
  showExplanation: boolean;
  questionFontSize: number;
  showCorrectAnswer: boolean;
  theme: "system" | "light" | "dark";
  questionTextAlign: "left" | "center" | "justify";
};

const SETTINGS_KEY = "settings";

export const defaultSettings: Settings = {
  soundEnabled: true,
  caseSensitive: false,
  hapticsEnabled: true,
  showExplanation: true,
  questionFontSize: 20,
  showCorrectAnswer: true,
  theme: "light",
  questionTextAlign: "left",
};

export async function getSettings(): Promise<Settings> {
  const value = await AsyncStorage.getItem(SETTINGS_KEY);

  if (!value) {
    return defaultSettings;
  }

  try {
    return { ...defaultSettings, ...JSON.parse(value) };
    
  } catch {
    return defaultSettings;
  }
}

let writeQueue: Promise<unknown> = Promise.resolve();

export function updateSettings(
  updates: Partial<Settings>,
): Promise<Settings> {
  const result = writeQueue.then(async () => {
    const newSettings = { ...(await getSettings()), ...updates };

    await AsyncStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(newSettings),
    );

    return newSettings;
  });

  writeQueue = result.catch(() => undefined);

  return result;
}