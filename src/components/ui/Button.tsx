import React from 'react';
import { type TextStyle, type ViewStyle } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { Box, Text } from '@/theme/restyleComponents';
import { Touchable } from '@/components/primitives/Touchable';
import { type Theme } from '@/theme/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = true,
}: ButtonProps) {
  const theme = useTheme<Theme>();

  const sizeStyles: Record<ButtonSize, { height: number; paddingH: keyof Theme['spacing']; textVariant: 'button' | 'buttonSmall' }> = {
    sm: { height: 36, paddingH: 's', textVariant: 'buttonSmall' },
    md: { height: 48, paddingH: 'm', textVariant: 'button' },
    lg: { height: 56, paddingH: 'l', textVariant: 'button' },
  };

  const variantStyles: Record<ButtonVariant, { bg: keyof Theme['colors']; textColor: keyof Theme['colors']; borderColor?: keyof Theme['colors'] }> = {
    primary: { bg: 'primary', textColor: 'textInverse' },
    secondary: { bg: 'secondaryLight', textColor: 'secondary' },
    ghost: { bg: 'transparent', textColor: 'primary' },
    danger: { bg: 'error', textColor: 'textInverse' },
    outline: { bg: 'transparent', textColor: 'primary', borderColor: 'primary' },
  };

  const { height, paddingH, textVariant } = sizeStyles[size];
  const { bg, textColor, borderColor } = variantStyles[variant];

  return (
    <Touchable
      onPress={onPress}
      disabled={disabled || loading}
      activeScale={0.97}
    >
      <Box
        backgroundColor={bg}
        borderRadius="l"
        height={height}
        paddingHorizontal={paddingH}
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        borderWidth={variant === 'outline' || variant === 'ghost' ? 1 : 0}
        borderColor={borderColor || (variant === 'ghost' ? 'border' : undefined)}
        width={fullWidth ? '100%' : undefined}
        opacity={disabled ? 0.5 : 1}
        style={
          variant === 'primary' && !disabled
            ? {
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.18,
                shadowRadius: 8,
                elevation: 3,
              }
            : undefined
        }
      >
        {icon && <Box marginRight="s">{icon}</Box>}
        <Text variant={textVariant} color={textColor}>
          {loading ? 'Loading...' : title}
        </Text>
      </Box>
    </Touchable>
  );
}
