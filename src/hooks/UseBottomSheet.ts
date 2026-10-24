import { cancelAnimation, useSharedValue, withTiming } from "react-native-reanimated";
import { useCallback, useRef, useState } from "react";
import { scheduleOnRN } from "react-native-worklets";
import { useWindowDimensions } from "react-native";

type UseBottomSheetOptions = {
  openDuration?: number;
  closeDuration?: number;
};

export function useBottomSheet({
  openDuration = 300,
  closeDuration = 300,
}: UseBottomSheetOptions = {}) {
  
  const { height } = useWindowDimensions();

  const [visible, setVisible] = useState(false);

  const translateY = useSharedValue(height);
  const backdropOpacity = useSharedValue(0);

  const isClosingRef = useRef(false);
  const closeCallbackRef = useRef<(() => void) | undefined>(undefined);
  const animationFrameRef = useRef<number | null>(null);

  const finishClose = useCallback(() => {
    isClosingRef.current = false;
    setVisible(false);

    const callback = closeCallbackRef.current;
    closeCallbackRef.current = undefined;

    callback?.();
  }, []);

  const open = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    cancelAnimation(translateY);
    cancelAnimation(backdropOpacity);

    isClosingRef.current = false;
    closeCallbackRef.current = undefined;

    translateY.set(height);
    backdropOpacity.set(0);

    setVisible(true);

    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;

      translateY.set(withTiming(0, { duration: openDuration }));
      backdropOpacity.set(withTiming(1, { duration: openDuration }));
    });
  }, [height, openDuration, translateY, backdropOpacity]);

  const close = useCallback(
    (callback?: () => void) => {
      if (isClosingRef.current) return;

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      isClosingRef.current = true;
      closeCallbackRef.current = callback;

      translateY.set(
        withTiming(height, { duration: closeDuration }, (finished) => {
          if (finished) {
            scheduleOnRN(finishClose);
          }
        }),
      );

      backdropOpacity.set(withTiming(0, { duration: closeDuration }));
    },
    [height, closeDuration, translateY, backdropOpacity, finishClose],
  );

  return {
    open,
    close,
    visible,
    translateY,
    backdropOpacity,
  };
}