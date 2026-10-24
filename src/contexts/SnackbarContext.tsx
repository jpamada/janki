import { createContext, useCallback, useContext, useRef, useState } from "react";
import Snackbar from "@/components/shared/Snackbar";

type SnackbarOptions = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
};

type SnackbarContextValue = {
  showSnackbar: (options: SnackbarOptions) => void;
};

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<(SnackbarOptions & { id: number }) | null>(null);
  const idRef = useRef(0);

  const showSnackbar = useCallback((options: SnackbarOptions) => {
    idRef.current += 1;
    setCurrent({ ...options, id: idRef.current });
  }, []);

  const dismiss = useCallback(() => setCurrent(null), []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      {current && (
        <Snackbar
          key={current.id}
          message={current.message}
          actionLabel={current.actionLabel}
          onAction={current.onAction}
          duration={current.duration ?? 3000}
          onDismiss={dismiss}
        />
      )}
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error("useSnackbar must be used within SnackbarProvider");
  return ctx;
}