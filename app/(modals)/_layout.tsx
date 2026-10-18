import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
        animation: 'slide_from_bottom',
      }}
    >
      <Stack.Screen name="paywall" />
      <Stack.Screen name="pregnancy-card" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="calendar" />
    </Stack>
  );
}
