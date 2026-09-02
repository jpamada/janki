import { useCallback, useRef, useState } from "react";
import { Animated } from "react-native";

type UseBottomSheetOptions = {
  height?: number;
  openDuration?: number;
  closeDuration?: number;
};

export function useBottomSheet({
  height = 400,
  openDuration = 250,
  closeDuration = 300,
}: UseBottomSheetOptions = {}) {

  const [visible, setVisible] = useState(false);

  const translateY = useRef(
    new Animated.Value(height)
  ).current;

  const backdropOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const open = useCallback(() => {
    translateY.stopAnimation();
    backdropOpacity.stopAnimation();

    translateY.setValue(height);
    backdropOpacity.setValue(0);

    setVisible(true);

    requestAnimationFrame(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: openDuration,
          useNativeDriver: true,
        }),

        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: openDuration,
          useNativeDriver: true,
        }),
      ]).start();
    });

  }, [
    height,
    openDuration,
    translateY,
    backdropOpacity,
  ]);

  const close = useCallback((callback?: () => void) => {
    translateY.stopAnimation();
    backdropOpacity.stopAnimation();

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: height,
        duration: closeDuration,
        useNativeDriver: true,
      }),

      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: closeDuration,
        useNativeDriver: true,
      }),
    
    ]).start(({ finished }) => {
      if (!finished) return;
      setVisible(false);
      callback?.();
    });

  }, [
    height,
    closeDuration,
    translateY,
    backdropOpacity,
  ]);

  return {
    visible,
    translateY,
    backdropOpacity,
    open,
    close,
  };
}