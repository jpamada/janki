import { Stack } from "expo-router";

export default function QuestionsLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      animation: "slide_from_right",
    }}>
      <Stack.Screen name="[id]" />
      <Stack.Screen name="browse" />
      <Stack.Screen name="create" />
    </Stack>
  )
}