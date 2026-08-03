import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@shopify/restyle';
import { QueryClientProvider } from '@tanstack/react-query';
import { theme } from '@/theme';
import { queryClient } from '@/services/api';
import { useRevenueCat } from '@/hooks/useRevenueCat';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  useRevenueCat();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider theme={theme} children={
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            {children}
          </SafeAreaProvider>
        </QueryClientProvider>
      } />
    </GestureHandlerRootView>
  );
}
