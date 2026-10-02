import { Animated, useAnimatedValue, useWindowDimensions } from "react-native";
import { useCallback, useState } from "react";

type UseBottomSheetOptions = {
  openDuration?: number;
  closeDuration?: number;
};

export function useBottomSheet({
  openDuration = 400,
  closeDuration = 400,
}: UseBottomSheetOptions = {}) {
  const { height } = useWindowDimensions();

  const [visible, setVisible] = useState(false);

  const translateY = useAnimatedValue(height);
  const backdropOpacity = useAnimatedValue(0);

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
  }, [height, openDuration, translateY, backdropOpacity]);

  const close = useCallback(
    (callback?: () => void) => {
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
    },
    [height, closeDuration, translateY, backdropOpacity],
  );

  return {
    open,
    close,
    visible,
    translateY,
    backdropOpacity,
  };
}