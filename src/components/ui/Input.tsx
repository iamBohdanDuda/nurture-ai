import React, { useState } from 'react';
import { TextInput, type TextInputProps, type ViewStyle } from 'react-native';
import { useTheme } from '@shopify/restyle';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Box, Text } from '@/theme/restyleComponents';
import { type Theme } from '@/theme/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  containerStyle,
  onFocus,
  onBlur,
  ...textInputProps
}: InputProps) {
  const theme = useTheme<Theme>();
  const [isFocused, setIsFocused] = useState(false);
  const borderProgress = useSharedValue(0);

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: borderProgress.value === 1
      ? theme.colors.borderFocused
      : error
        ? theme.colors.error
        : theme.colors.border,
  }));

  const handleFocus = (e: any) => {
    setIsFocused(true);
    borderProgress.value = withTiming(1, { duration: 200 });
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    borderProgress.value = withTiming(0, { duration: 200 });
    onBlur?.(e);
  };

  return (
    <Box marginBottom="m" style={containerStyle}>
      {label && (
        <Text variant="label" marginBottom="xs">
          {label}
        </Text>
      )}

      <Animated.View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.inputBackground,
            borderRadius: theme.borderRadii.l,
            borderWidth: 1.5,
            paddingHorizontal: theme.spacing.m,
            height: 52,
          },
          animatedBorderStyle,
        ]}
      >
        {leftIcon && (
          <Box marginRight="s">{leftIcon}</Box>
        )}
        <TextInput
          {...textInputProps}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={theme.colors.inputPlaceholder}
          style={{
            flex: 1,
            fontFamily: 'Inter_400Regular',
            fontSize: 16,
            color: theme.colors.textPrimary,
          }}
        />
      </Animated.View>

      {error && (
        <Text variant="caption" color="errorDark" marginTop="xs">
          {error}
        </Text>
      )}
      {hint && !error && (
        <Text variant="caption" color="textMuted" marginTop="xs">
          {hint}
        </Text>
      )}
    </Box>
  );
}
