import React from 'react';
import { useTheme } from '@shopify/restyle';
import { Ionicons } from '@expo/vector-icons';
import { Card, Box, Text } from '@/theme/restyleComponents';
import { useTrackingStore } from '@/stores/trackingStore';
import { type Theme } from '@/theme/theme';

export function TrackingSummaryHeader() {
  const theme = useTheme<Theme>();
  const { todayWater, todayCalories, todaySymptoms, vitaminsTaken, todayWeight } = useTrackingStore();

  const waterTarget = 2300; // 2.3L target
  const waterPercent = Math.min(100, Math.round((todayWater / waterTarget) * 100));
  const vitaminsPercent = vitaminsTaken.length > 0 ? 100 : 0;

  return (
    <Card variant="elevated" marginBottom="m" backgroundColor="cardBackground">
      <Text variant="h3" marginBottom="xs">
        Today's Health Summary 📊
      </Text>
      <Text variant="caption" color="textMuted" marginBottom="m">
        Your daily health metric snapshot
      </Text>

      {/* Progress Cards Grid */}
      <Box flexDirection="row" flexWrap="wrap" gap="s">
        {/* Hydration Metric */}
        <Box
          width="48%"
          backgroundColor="secondaryLight"
          borderRadius="m"
          padding="s"
          flexDirection="row"
          alignItems="center"
        >
          <Box
            width={38}
            height={38}
            borderRadius="full"
            backgroundColor="secondary"
            alignItems="center"
            justifyContent="center"
            marginRight="s"
          >
            <Ionicons name="water" size={20} color="white" />
          </Box>
          <Box flex={1}>
            <Text variant="caption" color="secondary" fontFamily="Inter_600SemiBold">
              Hydration
            </Text>
            <Text variant="bodySmall" fontFamily="Inter_700Bold" color="textPrimary">
              {todayWater} ml ({waterPercent}%)
            </Text>
          </Box>
        </Box>

        {/* Vitamins Metric */}
        <Box
          width="48%"
          backgroundColor="primaryLight"
          borderRadius="m"
          padding="s"
          flexDirection="row"
          alignItems="center"
        >
          <Box
            width={38}
            height={38}
            borderRadius="full"
            backgroundColor="primary"
            alignItems="center"
            justifyContent="center"
            marginRight="s"
          >
            <Ionicons name="medkit" size={20} color="white" />
          </Box>
          <Box flex={1}>
            <Text variant="caption" color="primary" fontFamily="Inter_600SemiBold">
              Vitamins
            </Text>
            <Text variant="bodySmall" fontFamily="Inter_700Bold" color="textPrimary">
              {vitaminsTaken.length > 0 ? 'Taken ✅' : 'Pending ⏳'}
            </Text>
          </Box>
        </Box>

        {/* Nutrition / Calories Metric */}
        <Box
          width="48%"
          backgroundColor="accentLight"
          borderRadius="m"
          padding="s"
          flexDirection="row"
          alignItems="center"
        >
          <Box
            width={38}
            height={38}
            borderRadius="full"
            backgroundColor="accent"
            alignItems="center"
            justifyContent="center"
            marginRight="s"
          >
            <Ionicons name="restaurant" size={20} color="white" />
          </Box>
          <Box flex={1}>
            <Text variant="caption" color="accent" fontFamily="Inter_600SemiBold">
              Calories Logged
            </Text>
            <Text variant="bodySmall" fontFamily="Inter_700Bold" color="textPrimary">
              {todayCalories} kcal
            </Text>
          </Box>
        </Box>

        {/* Weight Metric */}
        <Box
          width="48%"
          backgroundColor="inputBackground"
          borderRadius="m"
          padding="s"
          flexDirection="row"
          alignItems="center"
        >
          <Box
            width={38}
            height={38}
            borderRadius="full"
            backgroundColor="textMuted"
            alignItems="center"
            justifyContent="center"
            marginRight="s"
          >
            <Ionicons name="fitness" size={20} color="white" />
          </Box>
          <Box flex={1}>
            <Text variant="caption" color="textSecondary" fontFamily="Inter_600SemiBold">
              Latest Weight
            </Text>
            <Text variant="bodySmall" fontFamily="Inter_700Bold" color="textPrimary">
              {todayWeight ? `${todayWeight} kg` : 'Not logged'}
            </Text>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
