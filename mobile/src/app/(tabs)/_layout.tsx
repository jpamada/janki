import { Home, Lightbulb, NotepadText } from 'lucide-react-native';
import { Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import { BottomTabBarButtonProps } from 'expo-router/build/react-navigation/bottom-tabs';


export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3d3d4a",
        tabBarShowLabel: false,
        tabBarButton: ({ ref, ...rest }: BottomTabBarButtonProps) => (
          <Pressable {...rest} android_ripple={{ color: 'transparent' }} />
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="notes"
        options={{
          tabBarIcon: ({ color, size }) => (
            <NotepadText color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="subjects"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Lightbulb color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
