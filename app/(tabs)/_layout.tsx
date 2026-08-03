import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { type Theme } from '@/theme/theme';

export default function TabLayout() {
  const theme = useTheme<Theme>();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.tabBarActive,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBackground,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: theme.colors.shadow,
          shadowOpacity: 0.08,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 8,
          height: 85,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="track"
        options={{
          title: 'Track',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
