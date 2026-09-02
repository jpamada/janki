import { Stack } from "expo-router";

export default function CategoriesLayout() {
  return (
    <Stack
       screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Edit Categories' 
        }}  
      />
    </Stack>
  )
}