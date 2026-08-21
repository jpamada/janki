import { Home, Lightbulb, NotepadText } from 'lucide-react-native';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarIcon: ({ color, size }) => (
            <NotepadText color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="subjects"
        options={{
          title: 'Quiz',
          tabBarIcon: ({ color, size }) => (
            <Lightbulb color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
