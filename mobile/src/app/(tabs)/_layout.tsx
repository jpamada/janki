import { BottomTabBarButtonProps } from 'expo-router/build/react-navigation/bottom-tabs';
import { Home, Lightbulb, NotepadText, User } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3d3d4a",
        tabBarShowLabel: false,
         tabBarStyle: {
          height: 60,
          paddingTop: 8,
          paddingBottom: 8,
        },
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

      <Tabs.Screen
        name='profile'
        options={{
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
