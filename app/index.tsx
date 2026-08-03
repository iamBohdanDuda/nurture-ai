import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasCompletedOnboarding = useAuthStore((s) => s.hasCompletedOnboarding);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
