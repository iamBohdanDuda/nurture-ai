import React from 'react';
import { Pressable, type ViewStyle, type Insets } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@shopify/restyle';
import { type Theme } from '@/theme/theme';
import { Box, type BoxProps } from '@/theme/restyleComponents';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TouchableProps extends BoxProps {
  onPress?: () => void;
  disabled?: boolean;
  activeScale?: number;
  children?: React.ReactNode;
  style?: ViewStyle;
  hitSlop?: null | Insets | number;
}

export function Touchable({
  onPress,
  disabled = false,
  activeScale = 0.97,
  children,
  style,
  hitSlop,
  ...boxProps
}: TouchableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(activeScale, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      hitSlop={hitSlop}
      style={[animatedStyle, { opacity: disabled ? 0.5 : 1 }, style]}
    >
      <Box {...boxProps}>{children}</Box>
    </AnimatedPressable>
  );
}
