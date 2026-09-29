import React from 'react';
import { useTheme } from '@shopify/restyle';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, Box, Text } from '@/theme/restyleComponents';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { useTrackingStore } from '@/stores/trackingStore';
import { type Theme } from '@/theme/theme';

export function TrackingSummaryHeader() {
  const theme = useTheme<Theme>();
  const { todayWater, todayCalories, todaySymptoms, vitaminsTaken, todayWeight } = useTrackingStore();

  const waterTarget = 2300;
  const waterPercent = Math.min(100, Math.round((todayWater / waterTarget) * 100));
  const vitaminsPercent = vitaminsTaken.length > 0 ? 100 : 0;
  const caloriesTarget = 2200;
  const caloriesPercent = Math.min(100, Math.round((todayCalories / caloriesTarget) * 100));

  const metrics = [
    {
      label: 'HYDRATION',
      value: `${todayWater}`,
      unit: 'ml',
      percent: waterPercent,
      color: theme.colors.info,
      icon: 'water' as const,
      bgColor: theme.colors.mintLight,
    },
    {
      label: 'VITAMINS',
      value: vitaminsTaken.length > 0 ? 'Done' : 'Pending',
      unit: '',
      percent: vitaminsPercent,
      color: theme.colors.secondary,
      icon: 'medkit' as const,
      bgColor: theme.colors.secondaryLight,
    },
    {
      label: 'CALORIES',
      value: `${todayCalories}`,
      unit: 'kcal',
      percent: caloriesPercent,
      color: theme.colors.accent,
      icon: 'restaurant' as const,
      bgColor: theme.colors.accentLight,
    },
    {
      label: 'WEIGHT',
      value: todayWeight ? `${todayWeight}` : '—',
      unit: todayWeight ? 'kg' : '',
      percent: todayWeight ? 100 : 0,
      color: theme.colors.coral,
      icon: 'fitness' as const,
      bgColor: theme.colors.coralLight,
    },
  ];

  return (
    <Card
      variant="elevated"
      marginBottom="m"
      style={{
        borderRadius: 24,
        overflow: 'hidden',
      }}
    >
      {/* Subtle gradient background */}
      <LinearGradient
        colors={[theme.colors.surfaceElevated, theme.colors.peachSubtle]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 24 }}
      />

      <Text variant="h3" marginBottom="xs">
        Today's Health Summary
      </Text>
      <Text variant="caption" color="textMuted" marginBottom="m">
        Your daily health metric snapshot
      </Text>

      {/* Progress Rings Row */}
      <Box flexDirection="row" justifyContent="space-around" alignItems="center">
        {metrics.map((metric) => (
          <Box key={metric.label} alignItems="center">
            <ProgressRing
              progress={metric.percent}
              size={68}
              strokeWidth={5}
              color={metric.color}
              trackColor={metric.bgColor}
            >
              <Ionicons name={metric.icon} size={20} color={metric.color} />
            </ProgressRing>
            <Text variant="statLabel" marginTop="xs" style={{ textTransform: 'uppercase' }}>
              {metric.label}
            </Text>
            <Text variant="caption" fontFamily="Inter_700Bold" color="textPrimary">
              {metric.value}{metric.unit ? ` ${metric.unit}` : ''}
            </Text>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
