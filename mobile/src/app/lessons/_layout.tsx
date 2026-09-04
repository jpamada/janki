import { Stack } from "expo-router";

export default function LessonsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      
      <Stack.Screen name="questions/[id]" />
      <Stack.Screen name="questions/browse" />
      <Stack.Screen name="questions/create" />

      <Stack.Screen name="quiz/play" />
      <Stack.Screen name="quiz/results" />
    </Stack>
  );
}