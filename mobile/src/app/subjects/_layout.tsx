import { Stack } from 'expo-router';

export default function SubjectsLayout() {
  return (
    <Stack 
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="create" />
      <Stack.Screen name="lessons/[subjectId]" />
      <Stack.Screen name="lessons/create" />
    </Stack>
  );
}