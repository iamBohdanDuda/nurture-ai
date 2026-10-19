import React from 'react';
import { useTheme } from '@shopify/restyle';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, Box, Text } from '@/theme/restyleComponents';
import { GradientBadge } from '@/components/ui/GradientComponents';
import { useTrackingStore } from '@/stores/trackingStore';
import { type Theme, GRADIENTS } from '@/theme/theme';

export function WeeklyAveragesWidget() {
  const theme = useTheme<Theme>();
  const { todayWater, todayCalories, todayWeight, kickLogs, mealLogs } = useTrackingStore();

  // Compute 7-day metrics based on stored logs
  const calculateAverages = () => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Calories: group by date (YYYY-MM-DD)
    const mealDaysMap = new Map<string, number>();
    mealLogs.forEach((m) => {
      const dateStr = (m.logged_at || '').split('T')[0];
      if (dateStr && new Date(dateStr) >= sevenDaysAgo) {
        mealDaysMap.set(dateStr, (mealDaysMap.get(dateStr) || 0) + (m.calories || 0));
      }
    });

    if (todayCalories > 0 && !mealDaysMap.has(todayStr)) {
      mealDaysMap.set(todayStr, todayCalories);
    }

    const totalLoggedCal = Array.from(mealDaysMap.values()).reduce((a, b) => a + b, 0);
    const activeMealDaysCount = mealDaysMap.size;
    const avgCalText = activeMealDaysCount > 0
      ? `${Math.round(totalLoggedCal / activeMealDaysCount)}`
      : '—';

    // 2. Water: group by logged days or today
    const waterDaysMap = new Map<string, number>();
    if (todayWater > 0) {
      waterDaysMap.set(todayStr, todayWater);
    }

    const totalLoggedWater = Array.from(waterDaysMap.values()).reduce((a, b) => a + b, 0);
    const activeWaterDaysCount = waterDaysMap.size;
    const avgWaterText = activeWaterDaysCount > 0
      ? `${Math.round(totalLoggedWater / activeWaterDaysCount)}`
      : '—';

    // 3. Kick sessions
    const recentKicks = kickLogs.filter((k) => new Date(k.logged_at || Date.now()) >= sevenDaysAgo);
    const totalKicks = recentKicks.reduce((acc, k) => acc + (k.kick_count || 0), 0);
    const avgKicksText = recentKicks.length > 0
      ? `${Math.round(totalKicks / recentKicks.length)}`
      : '—';

    // 4. Weight
    const avgWeightText = todayWeight ? `${todayWeight.toFixed(1)} kg` : '—';

    return {
      avgWater: avgWaterText,
      avgCal: avgCalText,
      avgKicks: avgKicksText,
      avgWeight: avgWeightText,
      activeDays: Math.max(activeMealDaysCount, activeWaterDaysCount),
    };
  };

  const averages = calculateAverages();

  const metrics = [
    { label: 'Avg Water', value: averages.avgWater, unit: 'ml/day', icon: 'water-outline' as const, color: theme.colors.info },
    { label: 'Avg Calories', value: averages.avgCal, unit: 'kcal/day', icon: 'restaurant-outline' as const, color: theme.colors.secondary },
    { label: 'Avg Weight', value: averages.avgWeight, unit: '', icon: 'fitness-outline' as const, color: theme.colors.accent },
    { label: 'Avg Kicks', value: averages.avgKicks, unit: '/ session', icon: 'hand-left-outline' as const, color: theme.colors.primary },
  ];

  return (
    <Card
      variant="elevated"
      marginBottom="m"
      padding="m"
      style={{ borderRadius: 24, backgroundColor: '#FFFFFF' }}
    >
      <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="m">
        <Box flexDirection="row" alignItems="center">
          <Box
            width={34}
            height={34}
            borderRadius="full"
            backgroundColor="primaryLight"
            alignItems="center"
            justifyContent="center"
          >
            <Ionicons name="stats-chart" size={16} color={theme.colors.primary} />
          </Box>
          <Text variant="h3" marginLeft="s">7-Day Averages</Text>
        </Box>
        <Box
          backgroundColor="warmSurfaceSoft"
          paddingHorizontal="m"
          paddingVertical="xs"
          borderRadius="full"
          borderWidth={1}
          borderColor="border"
        >
          <Text variant="caption" color="textMuted" style={{ textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 10 }}>
            THIS WEEK
          </Text>
        </Box>
      </Box>

      {/* Grid of 4 Averages */}
      <Box flexDirection="row" flexWrap="wrap" gap="s">
        {metrics.map((metric) => (
          <Box
            key={metric.label}
            width="48%"
            backgroundColor="warmSurfaceSoft"
            padding="m"
            borderWidth={1}
            borderColor="border"
            style={{ borderRadius: 16 }}
          >
            <Box flexDirection="row" alignItems="center" marginBottom="xs">
              <Ionicons name={metric.icon} size={15} color={metric.color} />
              <Text variant="caption" color="textMuted" marginLeft="xs" style={{ fontSize: 11, letterSpacing: 0.3 }}>
                {metric.label}
              </Text>
            </Box>
            <Text variant="h3" color="textPrimary" marginTop="xs">
              {metric.value}{' '}
              {metric.unit ? <Text variant="caption" color="textMuted">{metric.unit}</Text> : null}
            </Text>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
