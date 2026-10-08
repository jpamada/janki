import { Pressable, PressableProps } from "react-native";

type DebouncedPressableProps = PressableProps & {
  debounceMs?: number;
};

let lastPressAt = 0;

export default function DebouncedPressable({
  onPress,
  debounceMs = 800,
  ...props
}: DebouncedPressableProps) {
  const handlePress: PressableProps['onPress'] = (event) => {
    if (!onPress) return;

    const now = Date.now();
    if (now - lastPressAt < debounceMs) return;
    lastPressAt = now;
    onPress(event);
  };

  return <Pressable {...props} onPress={handlePress} />;
}