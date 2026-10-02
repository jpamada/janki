import { initializeSettings } from "@/repositories/settings.repository";
import { useEffect, useState } from "react";

export function useInitializeSettings(success: boolean) {
  const [settingsReady, setSettingsReady] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    if (!success) return;

    let cancelled = false;

    initializeSettings()
      .then(() => {
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