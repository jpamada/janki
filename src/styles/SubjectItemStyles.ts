import { FadeInUp, FadeOutUp, LinearTransition } from "react-native-reanimated";
import { StyleSheet } from "react-native";

export const ANIMATION_DURATION = 200;
export const LAYOUT = LinearTransition.duration(ANIMATION_DURATION);
export const ENTERING = FadeInUp.duration(ANIMATION_DURATION);
export const EXITING = FadeOutUp.duration(ANIMATION_DURATION);

export const SubjectItemStyles = StyleSheet.create({
  clip: {
    overflow: "hidden",
  },
});