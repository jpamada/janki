import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getSettings,
  updateSettings as saveSettings,
  type Settings,
} from "@/repositories/settings.repository";
import { colorScheme } from "nativewind";

type SettingsContextValue = {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
};

const SettingsContext = createContext<
  SettingsContextValue | undefined
>(undefined);

type SettingsProviderProps = {
  children: ReactNode;
  initialSettings: Settings;
};

export function SettingsProvider({
  children,
  initialSettings,
}: SettingsProviderProps) {
  const [settings, setSettings] = useState(initialSettings);

  const updateSettings = useCallback(
    async (updates: Partial<Settings>) => {
      setSettings((current) => ({ ...current, ...updates }));

      if (updates.theme) {
        colorScheme.set(updates.theme);
      }

      try {
        await saveSettings(updates);
      } catch {
        const saved = await getSettings();

        setSettings(saved);
        colorScheme.set(saved.theme);
      }
    },
    [],
  );

  const value = useMemo(
    () => ({ settings, updateSettings }),
    [settings, updateSettings],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error(
      "useSettings must be used inside SettingsProvider",
    );
  }

  return context;
}