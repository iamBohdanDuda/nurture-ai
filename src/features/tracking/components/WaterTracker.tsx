import React from 'react';
import { useTheme } from '@shopify/restyle';
import { Ionicons } from '@expo/vector-icons';
import { Card, Box, Text } from '@/theme/restyleComponents';
import { Touchable } from '@/components/primitives/Touchable';
import { useTrackingStore } from '@/stores/trackingStore';
import { trackingService } from '../services/trackingService';
import { useAuthStore } from '@/stores/authStore';
import { type Theme } from '@/theme/theme';

const DAILY_WATER_GOAL = 2000; // ml
const WATER_GLASS_SIZE = 250; // ml

export function WaterTracker() {
  const theme = useTheme<Theme>();
  const user = useAuthStore((s) => s.user);
  const { todayWater, logWater } = useTrackingStore();

  const progress = Math.min((todayWater / DAILY_WATER_GOAL) * 100, 100);

  const handleAddWater = async () => {
    logWater(WATER_GLASS_SIZE);
    
    if (user?.id) {
      trackingService.logWater(user.id, WATER_GLASS_SIZE).catch((err) => {
        console.warn('Failed to sync water log', err);
      });
    }
  };

  return (
    <Card variant="elevated" marginBottom="m">
      <Box flexDirection="row" alignItems="center" justifyContent="space-between">
        <Box flex={1}>
          <Box flexDirection="row" alignItems="center" marginBottom="s">
            <Ionicons name="water" size={24} color={theme.colors.info} />
            <Text variant="h3" marginLeft="s">Water Intake</Text>
          </Box>
          <Text variant="bodySmall" color="textSecondary">
            {todayWater} / {DAILY_WATER_GOAL} ml
          </Text>
        </Box>

        <Touchable onPress={handleAddWater} hitSlop={10}>
          <Box
            backgroundColor="primaryLight"
            padding="m"
            borderRadius="full"
            alignItems="center"
            justifyContent="center"
          >
            <Ionicons name="add" size={24} color={theme.colors.info} />
          </Box>
        </Touchable>
      </Box>

      {/* Progress Bar & Hint */}
      <Box
        width="100%"
        height={8}
        backgroundColor="border"
        borderRadius="full"
        marginTop="m"
        overflow="hidden"
      >
        <Box
          height={8}
          borderRadius="full"
          backgroundColor="info"
          width={`${progress}%`}
        />
      </Box>

      <Text variant="caption" color="textMuted" marginTop="s">
        💡 Hint: 250 ml is approximately 1 typical glass of water (+1 glass per tap).
      </Text>
    </Card>
  );
}
