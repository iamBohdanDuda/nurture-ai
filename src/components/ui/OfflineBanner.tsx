import React from 'react';
import { Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Box, Text } from '@/theme/restyleComponents';
import { useTheme } from '@shopify/restyle';
import { type Theme } from '@/theme/theme';

interface OfflineBannerProps {
  visible?: boolean;
  message?: string;
}

export function OfflineBanner({
  visible = true,
  message = 'Offline Mode — Saved locally! Data will sync automatically.',
}: OfflineBannerProps) {
  const theme = useTheme<Theme>();

  if (!visible) return null;

  return (
    <Box
      backgroundColor="secondaryLight"
      paddingVertical="s"
      paddingHorizontal="m"
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      borderBottomWidth={1}
      borderColor="secondary"
    >
      <Ionicons name="cloud-offline-outline" size={18} color={theme.colors.secondary} />
      <Text variant="caption" color="secondary" fontFamily="Inter_600SemiBold" marginLeft="s">
        {message}
      </Text>
    </Box>
  );
}
