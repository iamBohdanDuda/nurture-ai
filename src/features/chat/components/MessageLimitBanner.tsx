import React from 'react';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { Box, Text } from '@/theme/restyleComponents';
import { Touchable } from '@/components/primitives/Touchable';
import { FREE_MESSAGE_LIMIT } from '@/core/constants';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { type Theme } from '@/theme/theme';

interface MessageLimitBannerProps {
  messageCount: number;
  messageLimit: number;
  isPremium: boolean;
}

export function MessageLimitBanner({
  messageCount,
  messageLimit,
  isPremium,
}: MessageLimitBannerProps) {
  const theme = useTheme<Theme>();

  if (isPremium) return null;

  const remaining = messageLimit - messageCount;
  const isWarning = remaining <= 3 && remaining > 0;
  const isBlocked = remaining <= 0;

  if (!isWarning && !isBlocked) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      exiting={FadeOutUp.duration(200)}
    >
      <Box
        backgroundColor={isBlocked ? 'error' : 'warning'}
        borderRadius="m"
        paddingHorizontal="m"
        paddingVertical="s"
        marginHorizontal="m"
        marginBottom="s"
        flexDirection="row"
        alignItems="center"
      >
        <Ionicons
          name={isBlocked ? 'lock-closed' : 'alert-circle'}
          size={20}
          color={isBlocked ? '#FFFFFF' : '#7C5A00'}
          style={{ marginRight: 8 }}
        />
        <Box flex={1}>
          {isBlocked ? (
            <Text variant="bodySmall" color="textInverse">
              Weekly message limit reached ({messageLimit}/{messageLimit})
            </Text>
          ) : (
            <Text variant="bodySmall" color="textPrimary">
              {remaining} message{remaining !== 1 ? 's' : ''} remaining this week
            </Text>
          )}
        </Box>

        <Touchable
          onPress={() => router.push('/(modals)/paywall')}
          activeScale={0.95}
        >
          <Box
            backgroundColor={isBlocked ? 'primaryBackground' : 'primary'}
            borderRadius="full"
            paddingHorizontal="m"
            paddingVertical="xs"
          >
            <Text
              variant="buttonSmall"
              color={isBlocked ? 'primary' : 'textInverse'}
            >
              Upgrade
            </Text>
          </Box>
        </Touchable>
      </Box>
    </Animated.View>
  );
}
