import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  type LayoutChangeEvent,
  Modal,
  Pressable,
  View,
  useWindowDimensions,
} from "react-native";
import { type ReactNode, useMemo } from "react";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

const SNAP_BACK_DURATION = 150;

type BottomSheetType = {
  sheet: {
    visible: boolean;
    translateY: SharedValue<number>;
    backdropOpacity: SharedValue<number>;
    open: () => void;
    close: (callback?: () => void) => void;
  };
  children?: ReactNode;
  className?: string;
  onBackdropPress?: () => void;
  onRequestClose?: () => void;
};

export default function BottomSheet({
  sheet,
  children,
  className,
  onBackdropPress,
  onRequestClose,
}: BottomSheetType) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const { visible, translateY, backdropOpacity, close } = sheet;

  const startY = useSharedValue(0);
  const sheetHeight = useSharedValue(0);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.get(),
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.get() }],
  }));

  const panGesture = useMemo(() =>
    Gesture.Pan()
    .activeOffsetY(8)
    .failOffsetX([-20, 20])
    .onStart(() => {
      startY.set(translateY.get());
    })
    .onUpdate((event) => {
      const range = sheetHeight.get() || height;
      const nextY = Math.max(0, startY.get() + event.translationY);

      translateY.set(nextY);
      backdropOpacity.set(Math.max(0, 1 - nextY / range));
    })
    .onEnd((event) => {
      const range = sheetHeight.get() || height;
      const shouldClose =
        translateY.get() > range * 0.3 || event.velocityY > 800;

      if (shouldClose) {
        scheduleOnRN(close);
        return;
      }

      translateY.set(
        withTiming(0, {
          duration: SNAP_BACK_DURATION,
          easing: Easing.out(Easing.cubic),
        }),
      );
      backdropOpacity.set(
        withTiming(1, {
          duration: SNAP_BACK_DURATION,
          easing: Easing.out(Easing.cubic),
        }),
      );
    }),
    
    [height, startY, sheetHeight, translateY, backdropOpacity, close],
  );

  const handleSheetLayout = (event: LayoutChangeEvent) => {
    sheetHeight.set(event.nativeEvent.layout.height);
  };

  const handleBackdropPress = () => {
    if (onBackdropPress) {
      onBackdropPress();
    } else {
      close();
    }
  };

  const handleRequestClose = () => {
    if (onRequestClose) {
      onRequestClose();
    } else {
      close();
    }
  };

  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      onRequestClose={handleRequestClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className="flex-1 justify-end">
          <Animated.View
            className="absolute inset-0 bg-black/40 dark:bg-black/60"
            style={backdropStyle}
          >
            <Pressable className="flex-1" onPress={handleBackdropPress} />
          </Animated.View>

          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={sheetStyle}
              onLayout={handleSheetLayout}
              className={`rounded-t-3xl bg-gray-50 dark:bg-neutral-800 ${className ?? ""}`}
            >
              <View className="items-center py-4">
                <View className="h-1.5 w-10 rounded-full bg-neutral-300 dark:bg-neutral-600" />
              </View>

              {children}

              <View style={{ height: insets.bottom }} />
            </Animated.View>
          </GestureDetector>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}