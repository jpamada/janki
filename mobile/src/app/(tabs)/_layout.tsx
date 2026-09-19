import { BottomTabBarButtonProps } from 'expo-router/build/react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChartColumn, Home, Settings,  } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#3d3d4a",
        tabBarStyle: {
          paddingTop: 8,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 8,
        },
        tabBarButton: ({ ref, ...rest }: BottomTabBarButtonProps) => (
          <Pressable {...rest} android_ripple={{ color: 'transparent' }} />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="statistics"
        options={{
          tabBarIcon: ({ color, size }) => (
            <ChartColumn color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name='settings'
        options={{
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
