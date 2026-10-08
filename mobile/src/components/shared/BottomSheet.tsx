import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Animated, Modal, Pressable, View } from "react-native";
import { type ReactNode } from "react";

type BottomSheetType = {
  sheet: {
    visible: boolean;
    translateY: Animated.Value;
    backdropOpacity: Animated.Value;
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

  const handleBackdropPress = () => {
    if (onBackdropPress) {
      onBackdropPress();
    } else {
      sheet.close();
    }
  };

  const handleRequestClose = () => {
    if (onRequestClose) {
      onRequestClose();
    } else {
      sheet.close();
    }
  };

  return (
    <Modal
      transparent
      animationType="none"
      visible={sheet.visible}
      onRequestClose={handleRequestClose}
    >
      <View className="flex-1 justify-end">
        <Animated.View
          className="absolute inset-0 bg-black/40 dark:bg-black/60"
          style={{ opacity: sheet.backdropOpacity }}
        >
          <Pressable
            className="flex-1"
            onPress={handleBackdropPress}
          />
        </Animated.View>

        <Animated.View
          style={{ transform: [{ translateY: sheet.translateY }] }}
          className={`rounded-t-3xl bg-gray-50 dark:bg-neutral-800 ${className}`}
        >
          {children}

          <View style={{ height: insets.bottom }} />
        </Animated.View>
      </View>
    </Modal>
  );
}