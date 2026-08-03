import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useTheme } from '@shopify/restyle';
import { Box, Text } from '@/theme/restyleComponents';
import { type Theme } from '@/theme/theme';

interface TypingIndicatorProps {
  isVisible: boolean;
}

function AnimatedDot({ delay }: { delay: number }) {
  const theme = useTheme<Theme>();
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 300 }),
          withTiming(0, { duration: 300 })
        ),
        -1,
        false
      )
    );
  }, [delay, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: theme.colors.textMuted,
          marginHorizontal: 3,
        },
        animatedStyle,
      ]}
    />
  );
}

export function TypingIndicator({ isVisible }: TypingIndicatorProps) {
  if (!isVisible) return null;

  return (
    <Box
      flexDirection="row"
      alignItems="center"
      paddingHorizontal="m"
      paddingVertical="s"
      marginBottom="s"
    >
      <Box
        backgroundColor="chatBubbleAI"
        borderRadius="l"
        paddingHorizontal="m"
        paddingVertical="s"
        flexDirection="row"
        alignItems="center"
      >
        <AnimatedDot delay={0} />
        <AnimatedDot delay={150} />
        <AnimatedDot delay={300} />
        <Text variant="caption" marginLeft="s">
          NurtureAI is thinking...
        </Text>
      </Box>
    </Box>
  );
}
