import { getSettings, type Settings } from "@/repositories/settings.repository";
import { colorScheme } from "nativewind";
import { useEffect, useState } from "react";

export function useInitializeSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function initialize() {
      try {
        const loaded = await getSettings();

        colorScheme.set(loaded.theme);

        setSettings(loaded);
      } catch (error) {
        setError(
          error instanceof Error
            ? error
            : new Error("Failed to initialize settings"),
        );
      }
    }

    void initialize();
  }, []);

  return {
    error: error,
    settings: settings,
  };
}