import { Stack } from 'expo-router';

export default function NotesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen 
        name="[id]" 
        options={{
          title: "Notes"
        }}
      />

      <Stack.Screen 
        name="contents/create" 
        options={{
          title: "Create Content"
        }}
      />

      <Stack.Screen 
        name="contents/edit" 
        options={{
          title: "Edit Content"
        }}
      />
    </Stack>
  );
}
