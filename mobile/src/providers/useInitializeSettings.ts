// providers/useInitializeSettings.ts
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
        if (cancelled) return;

        // Apply the theme BEFORE marking ready, so colorScheme is already
        // correct by the time the splash screen hides and the real tree
        // (including SettingsProvider) mounts for the first time.
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
    settingsReady,
    initError,
  };
}