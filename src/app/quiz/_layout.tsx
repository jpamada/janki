import { Stack } from "expo-router";

export default function QuizLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="start" />
      <Stack.Screen name="results" />
    </Stack>
  )
}