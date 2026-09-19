import { useAudioPlayer } from 'expo-audio';

export function useQuizSfx() {
  const correctPlayer = useAudioPlayer(
    require('@/assets/sounds/CorrectSfx.mp3'),
  );

  const incorrectPlayer = useAudioPlayer(
    require('@/assets/sounds/WrongSfx.mp3'),
  );

  const playAnswerSfx = (correct: boolean) => {
    const player = correct
      ? correctPlayer
      : incorrectPlayer;

    player.seekTo(0);
    player.play();
  };

  return {
    playAnswerSfx,
  };
}