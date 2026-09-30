import { createContext, useContext, type ReactNode } from "react";
import { getSettings } from "@/repositories/settings.repository";
import { useQuery } from "@tanstack/react-query";

type Settings = {
  theme: "system" | "light" | "dark";
  questionFontSize: number;
  questionTextAlign: "left" | "center" | "justify";
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  caseSensitive: boolean;
  showCorrectAnswer: boolean;
};

type SettingsContextValue = {
  settings: Settings | null;
};

const SettingsContext = createContext<
  SettingsContextValue | undefined
>(undefined);

type SettingsProviderProps = {
  children: ReactNode;
};

export function SettingsProvider({
  children,
}: SettingsProviderProps) {

  const { data: settings = null } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  return (
    <SettingsContext.Provider value={{ settings }}>
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