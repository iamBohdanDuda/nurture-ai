import React from 'react';
import { useTheme } from '@shopify/restyle';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, Box, Text } from '@/theme/restyleComponents';
import { Touchable } from '@/components/primitives/Touchable';
import { ProgressRing } from '@/components/ui/ProgressRing';
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
  const glasses = Math.floor(todayWater / WATER_GLASS_SIZE);

  const handleAddWater = async () => {
    logWater(WATER_GLASS_SIZE);
    const userId = user?.id || 'current-user';
    trackingService.logWater(userId, WATER_GLASS_SIZE).catch((err) => {
      console.warn('Failed to sync water log', err);
    });
  };

  return (
    <Card
      variant="elevated"
      marginBottom="m"
      style={{ borderRadius: 20, overflow: 'hidden' }}
    >
      {/* Subtle blue gradient background */}
      <LinearGradient
        colors={[theme.colors.surfaceElevated, theme.colors.mintLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20 }}
      />

      <Box flexDirection="row" alignItems="center" justifyContent="space-between">
        <Box flex={1}>
          <Box flexDirection="row" alignItems="center" marginBottom="s">
            <Box
              width={36}
              height={36}
              borderRadius="full"
              alignItems="center"
              justifyContent="center"
              style={{ overflow: 'hidden' }}
            >
              <LinearGradient
                colors={['#63B3ED', '#4299E1']}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="water" size={18} color="#FFFFFF" />
              </LinearGradient>
            </Box>
            <Text variant="h3" marginLeft="s">Water Intake</Text>
          </Box>
          <Text variant="bodySmall" color="textSecondary">
            {todayWater} / {DAILY_WATER_GOAL} ml · {glasses} glasses
          </Text>
        </Box>

        {/* Add button with ring */}
        <Touchable onPress={handleAddWater} hitSlop={10} activeScale={0.9}>
          <ProgressRing
            progress={progress}
            size={64}
            strokeWidth={4}
            color={theme.colors.info}
            trackColor={theme.colors.mintLight}
          >
            <Box
              width={42}
              height={42}
              borderRadius="full"
              backgroundColor="info"
              alignItems="center"
              justifyContent="center"
              style={{ opacity: 0.9 }}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </Box>
          </ProgressRing>
        </Touchable>
      </Box>

      {/* Wave-style progress bar */}
      <Box
        width="100%"
        height={8}
        backgroundColor="mintLight"
        borderRadius="full"
        marginTop="m"
        overflow="hidden"
      >
        <LinearGradient
          colors={['#63B3ED', '#4299E1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            height: 8,
            borderRadius: 9999,
            width: `${progress}%`,
          }}
        />
      </Box>

      <Text variant="caption" color="textMuted" marginTop="s">
        💡 250 ml ≈ 1 glass of water (+1 glass per tap)
      </Text>
    </Card>
  );
}
