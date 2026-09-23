import { createContext, useContext, useMemo } from 'react';
import { useAudioPlayer } from 'expo-audio';

type SfxContextValue = {
  playAnswerSfx: (correct: boolean) => void;
  playCompletedSfx: () => void;
};

const SfxContext = createContext<SfxContextValue | null>(null);

export function SfxProvider({ children }: { children: React.ReactNode }) {
  const correctPlayer = useAudioPlayer(require('@/assets/sounds/CorrectSfx.mp3'));
  const incorrectPlayer = useAudioPlayer(require('@/assets/sounds/WrongSfx.mp3'));
  const completedPlayer = useAudioPlayer(require('@/assets/sounds/CompletedSfx.mp3'));

  const value = useMemo(
    () => ({
      playAnswerSfx: (correct: boolean) => {
        const player = correct ? correctPlayer : incorrectPlayer;
        player.seekTo(0);
        player.play();
      },
      playCompletedSfx: () => {
        completedPlayer.seekTo(0);
        completedPlayer.play();
      },
    }),
    [correctPlayer, incorrectPlayer, completedPlayer],
  );

  return (
    <SfxContext.Provider value={value}>
      {children}
    </SfxContext.Provider>
  );
}

export function useSfx() {
  const ctx = useContext(SfxContext);
  if (!ctx) {
    throw new Error('useQuizSfx must be used within SfxProvider');
  }
  return ctx;
}