import React from 'react';
import { ActivityIndicator, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTheme } from '@shopify/restyle';
import { Box, Text } from '@/theme/restyleComponents';
import { type Theme } from '@/theme/theme';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  const theme = useTheme<Theme>();

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={{
        ...overlayStyle,
        backgroundColor: theme.colors.overlay,
      }}
    >
      <Box
        backgroundColor="surfaceElevated"
        borderRadius="xl"
        padding="xl"
        alignItems="center"
        justifyContent="center"
        shadowColor="shadow"
        shadowOpacity={0.15}
        shadowOffset={{ width: 0, height: 4 }}
        shadowRadius={16}
        elevation={8}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        {message && (
          <Text variant="bodySmall" marginTop="m" textAlign="center">
            {message}
          </Text>
        )}
      </Box>
    </Animated.View>
  );
}

const overlayStyle: ViewStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
};
