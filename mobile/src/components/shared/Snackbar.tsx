import { useEffect } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SnackbarProps = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  duration: number;
  onDismiss: () => void;
};

const SWIPE_THRESHOLD = 80;
const TAB_BAR_BASE_HEIGHT = 60;

export default function Snackbar({
  message,
  actionLabel,
  onAction,
  duration,
  onDismiss,
}: SnackbarProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const tabBarHeight = TAB_BAR_BASE_HEIGHT + insets.bottom;

  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.85);

  // Pop-in entrance — quick ease-out, no overshoot
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) });
    scale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) });
  }, []);

  const handleDismiss = () => {
    onDismiss();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 150 }, (finished) => {
        if (finished) runOnJS(handleDismiss)();
      });
      scale.value = withTiming(0.9, { duration: 150 });
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      translateX.value = e.translationX;
      opacity.value = interpolate(
        Math.abs(e.translationX),
        [0, width],
        [1, 0.3],
        Extrapolation.CLAMP
      );
    })
    .onEnd((e) => {
      const shouldDismiss = Math.abs(e.translationX) > SWIPE_THRESHOLD;

      if (shouldDismiss) {
        const direction = e.translationX > 0 ? 1 : -1;
        translateX.value = withTiming(direction * width, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 }, (finished) => {
          if (finished) runOnJS(handleDismiss)();
        });
      } else {
        translateX.value = withTiming(0, { duration: 150, easing: Easing.out(Easing.ease) });
        opacity.value = withTiming(1, { duration: 150 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          {
            position: "absolute",
            left: 16,
            right: 16,
            bottom: tabBarHeight > 0 ? tabBarHeight + 12 : insets.bottom + 16,
          },
          animatedStyle,
        ]}
        className="flex-row items-center justify-between rounded-xl bg-gray-600 p-4 shadow-lg"
      >
        <Text className="flex-1 text-white font-medium mr-3" numberOfLines={2}>
          {message}
        </Text>

        {actionLabel && (
          <Pressable
            onPress={() => {
              onAction?.();
              handleDismiss();
            }}
            className="px-2 py-1 active:opacity-60"
          >
            <Text className="text-blue-300 font-semibold">{actionLabel}</Text>
          </Pressable>
        )}
      </Animated.View>
    </GestureDetector>
  );
}