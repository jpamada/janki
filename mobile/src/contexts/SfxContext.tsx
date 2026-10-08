import { createContext, useContext, useMemo } from 'react';
import { useSettings } from './SettingsContext';
import { useAudioPlayer } from 'expo-audio';

import * as Haptics from "expo-haptics";

type SfxContextValue = {
  playAnswerSfx: (correct: boolean) => void;
  playCompletedSfx: () => void;
  hapticVibration: () => void;
};

const SfxContext = createContext<SfxContextValue | null>(null);

export function SfxProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const { soundEnabled, hapticsEnabled } = settings;

  const correctPlayer = useAudioPlayer(require('@/assets/sounds/CorrectSfx.mp3'));
  const incorrectPlayer = useAudioPlayer(require('@/assets/sounds/WrongSfx.mp3'));
  const completedPlayer = useAudioPlayer(require('@/assets/sounds/CompletedSfx.mp3'));

  const value = useMemo(
    () => ({
      playAnswerSfx: (correct: boolean) => {
        if (soundEnabled) {
          const player = correct
            ? correctPlayer
            : incorrectPlayer;

          player.seekTo(0);
          player.play();
        }
      },
      playCompletedSfx: () => {
        if (soundEnabled) {
          completedPlayer.seekTo(0);
          completedPlayer.play();
        }
      },
      hapticVibration: () => {
        if (hapticsEnabled) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    }),
    
    [correctPlayer, incorrectPlayer, completedPlayer, soundEnabled, hapticsEnabled],
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