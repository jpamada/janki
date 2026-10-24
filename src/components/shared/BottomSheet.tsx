import { type LayoutChangeEvent, type ScrollViewProps, Modal, Pressable, Text, View, useWindowDimensions } from "react-native";
import Animated, { type SharedValue, Easing, useAnimatedProps, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type ReactNode, useEffect, useMemo } from "react";
import { scheduleOnRN } from "react-native-worklets";

const SNAP_BACK_DURATION = 150;
const ACTIVATE_DISTANCE = 8;
const TOP_TOLERANCE = 1;

type BottomSheetType = {
  sheet: {
    visible: boolean;
    translateY: SharedValue<number>;
    backdropOpacity: SharedValue<number>;
    open: () => void;
    close: (callback?: () => void) => void;
  };
  title?: string;
  children?: ReactNode;
  className?: string;
  onBackdropPress?: () => void;
  onRequestClose?: () => void;
};

export default function BottomSheet({
  sheet,
  title,
  children,
  className,
  onBackdropPress,
  onRequestClose,
}: BottomSheetType) {
  const insets = useSafeAreaInsets();

  const { height } = useWindowDimensions();
  const { visible, translateY, backdropOpacity, close } = sheet;

  const scrollY = useSharedValue(0);
  const scrollEnabled = useSharedValue(true);
  const sheetHeight = useSharedValue(0);
  const touchStartY = useSharedValue(0);
  const prevTouchY = useSharedValue(0);
  const dragAllowed = useSharedValue(false);

  useEffect(() => {
    if (visible) {
      scrollY.set(0);
      scrollEnabled.set(true);
    }
  }, [visible, scrollY, scrollEnabled]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.get(),
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.get() }],
  }));

  const scrollProps = useAnimatedProps<ScrollViewProps>(() => ({
    scrollEnabled: scrollEnabled.get(),
  }));

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.set(event.contentOffset.y);
    },
  });

  const { headerPan, contentPan, scrollGesture } = useMemo(() => {
    const scrollGesture = Gesture.Native();

    const buildPan = (respectScroll: boolean) =>
      Gesture.Pan()
        .manualActivation(true)
        .onTouchesDown((event) => {
          const y = event.changedTouches[0].absoluteY;
          touchStartY.set(y);
          prevTouchY.set(y);
          dragAllowed.set(!respectScroll || scrollY.get() <= TOP_TOLERANCE);
        })
        .onTouchesMove((event, stateManager) => {
          const y = event.changedTouches[0].absoluteY;
          const movingDown = y > prevTouchY.get();
          const pulledEnough = y - touchStartY.get() > ACTIVATE_DISTANCE;
          prevTouchY.set(y);

          if (respectScroll && scrollY.get() > TOP_TOLERANCE) {
            dragAllowed.set(false);
          }

          if (!dragAllowed.get() || !movingDown || !pulledEnough) return;

          stateManager.activate();
        })
        .onStart(() => {
          scrollEnabled.set(false);
        })
        .onChange((event) => {
          const range = sheetHeight.get() || height;
          const nextY = Math.max(0, translateY.get() + event.changeY);

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
        })
        .onFinalize(() => {
          scrollEnabled.set(true);
        });

    return {
      scrollGesture,
      headerPan: buildPan(false),
      contentPan: buildPan(true).simultaneousWithExternalGesture(scrollGesture),
    };
  }, [
    height,
    sheetHeight,
    scrollY,
    scrollEnabled,
    touchStartY,
    prevTouchY,
    dragAllowed,
    translateY,
    backdropOpacity,
    close,
  ]);

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

          <Animated.View
            style={sheetStyle}
            onLayout={handleSheetLayout}
            className={`max-h-[90%] rounded-t-3xl bg-gray-50 dark:bg-neutral-800 ${className ?? ""}`}
          >
            <GestureDetector gesture={headerPan}>
              <View>
                <View className="items-center py-4">
                  <View className="h-1.5 w-10 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                </View>

                {title && (
                  <Text
                    className="
                      mb-4 px-2
                      text-gray-700 font-bold text-lg
                      dark:text-neutral-300
                    "
                  >
                    {title}
                  </Text>
                )}
              </View>
            </GestureDetector>

            <GestureDetector gesture={contentPan}>
              <View style={{ flexShrink: 1 }}>
                <GestureDetector gesture={scrollGesture}>
                  <Animated.ScrollView
                    animatedProps={scrollProps}
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                    bounces={false}
                    overScrollMode="never"
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  >
                    {children}
                  </Animated.ScrollView>
                </GestureDetector>
              </View>
            </GestureDetector>

            <View style={{ height: insets.bottom }} />
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}