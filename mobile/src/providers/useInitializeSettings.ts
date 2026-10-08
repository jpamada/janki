import { initializeSettings, getSettings } from "@/repositories/settings.repository";
import { useEffect, useState } from "react";
import { colorScheme } from 'nativewind';

export function useInitializeSettings(success: boolean) {
  const [settingsReady, setSettingsReady] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    if (!success) return;

    let cancelled = false;

    initializeSettings()
      .then(async () => {
        if (cancelled) {
          return;
        }

        const settings = await getSettings();

        if (!cancelled && settings?.theme) {
          colorScheme.set(settings.theme);
        }

        if (!cancelled) {
          setSettingsReady(true);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setInitError(
            e instanceof Error ? e : new Error(String(e)),
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [success]);

  return {
    initError: initError,
    settingsReady: settingsReady,
  };
}