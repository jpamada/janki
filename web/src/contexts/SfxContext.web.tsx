import { createContext, useContext } from 'react';

type SfxContextValue = {
  playAnswerSfx: (correct: boolean) => void;
  playCompletedSfx: () => void;
  hapticVibration: () => void;
};

const SfxContext = createContext<SfxContextValue | null>(null);

export function SfxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value: SfxContextValue = {
    playAnswerSfx: () => {},
    playCompletedSfx: () => {},
    hapticVibration: () => {},
  };

  return (
    <SfxContext.Provider value={value}>
      {children}
    </SfxContext.Provider>
  );
}

export function useSfx() {
  const ctx = useContext(SfxContext);

  if (!ctx) {
    throw new Error('useSfx must be used within SfxProvider');
  }

  return ctx;
}