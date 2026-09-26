import { Pressable, PressableProps } from "react-native";
import { useRef } from "react";


type DebouncedPressableProps = PressableProps & {
  debounceMs?: number;
};

export default function DebouncedPressable({
  onPress,
  debounceMs = 800,
  ...props
}: DebouncedPressableProps) {
  const lastPressRef = useRef(0);

  const handlePress: PressableProps['onPress'] = (event) => {
    const now = Date.now();
    if (now - lastPressRef.current < debounceMs) return;
    lastPressRef.current = now;
    onPress?.(event);
  };

  return <Pressable {...props} onPress={handlePress} />;
}