import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { type ViewStyle } from 'react-native';
import { GRADIENTS } from '@/theme/theme';

type GradientPreset = keyof typeof GRADIENTS;

interface GradientBoxProps {
  preset?: GradientPreset;
  colors?: readonly string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: ViewStyle;
  children?: React.ReactNode;
}

/**
 * Reusable gradient wrapper component.
 * Use `preset` for predefined gradients from theme or pass custom `colors`.
 */
export function GradientBox({
  preset,
  colors,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  style,
  children,
}: GradientBoxProps) {
  const gradientColors = colors ?? (preset ? GRADIENTS[preset] : GRADIENTS.primary);

  return (
    <LinearGradient
      colors={gradientColors as any}
      start={start}
      end={end}
      style={style}
    >
      {children}
    </LinearGradient>
  );
}

interface GradientButtonProps {
  preset?: GradientPreset;
  colors?: readonly string[];
  onPress?: () => void;
  style?: ViewStyle;
  children?: React.ReactNode;
  height?: number;
  borderRadius?: number;
}

/**
 * Button with gradient background.
 */
export function GradientButton({
  preset = 'primary',
  colors,
  style,
  children,
  height = 56,
  borderRadius = 16,
}: GradientButtonProps) {
  const gradientColors = colors ?? GRADIENTS[preset];

  return (
    <LinearGradient
      colors={gradientColors as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[
        {
          height,
          borderRadius,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          width: '100%' as const,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 4,
        },
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );
}

interface GradientTextBadgeProps {
  preset?: GradientPreset;
  colors?: readonly string[];
  children?: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Small gradient badge (pill shape).
 */
export function GradientBadge({
  preset = 'primary',
  colors,
  children,
  style,
}: GradientTextBadgeProps) {
  const gradientColors = colors ?? GRADIENTS[preset];

  return (
    <LinearGradient
      colors={gradientColors as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[
        {
          borderRadius: 9999,
          paddingHorizontal: 16,
          paddingVertical: 6,
          alignSelf: 'center' as const,
        },
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );
}
