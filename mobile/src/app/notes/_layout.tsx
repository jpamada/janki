import { Stack } from 'expo-router';

export default function NotesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen 
        name="create" 
        options={{ 
          title: 'New Note' 
        }}  
      />
      <Stack.Screen 
        name="[id]" 
        options={{
          title: "Edit Note"
        }}
      />
    </Stack>
  );
}
