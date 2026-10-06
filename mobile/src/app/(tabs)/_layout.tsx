import { BottomTabBarButtonProps } from 'expo-router/build/react-navigation/bottom-tabs';
import { ChartColumn, Home, Settings,  } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from "nativewind";
import { Pressable } from 'react-native';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          paddingTop: 8,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 8,
          backgroundColor: colorScheme === "light" ? "#ffffff" : "#171717",
          borderTopColor: colorScheme === "light" ? "#e5e7eb" : "#374151",
        },
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colorScheme === "light" ? "#3d3d4a" : "#ffffff",
        tabBarInactiveTintColor: colorScheme === "light" ? "#6b7280" : "#9ca3af",
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
