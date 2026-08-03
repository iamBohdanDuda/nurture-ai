import React from 'react';
import { useTheme } from '@shopify/restyle';
import { Ionicons } from '@expo/vector-icons';
import { Card, Box, Text } from '@/theme/restyleComponents';
import { useTrackingStore } from '@/stores/trackingStore';
import { type Theme } from '@/theme/theme';

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

  return (
    <Card variant="elevated" marginBottom="m">
      <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="m">
        <Box flexDirection="row" alignItems="center">
          <Ionicons name="stats-chart" size={22} color={theme.colors.primary} />
          <Text variant="h3" marginLeft="s">7-Day Averages 📊</Text>
        </Box>
        <Box backgroundColor="primaryLight" paddingHorizontal="s" paddingVertical="xs" borderRadius="full">
          <Text variant="caption" color="primary" fontFamily="Inter_700Bold">
            THIS WEEK
          </Text>
        </Box>
      </Box>

      {/* Grid of 4 Averages */}
      <Box flexDirection="row" flexWrap="wrap" gap="s">
        {/* Avg Water */}
        <Box
          width="48%"
          backgroundColor="mainBackground"
          borderRadius="m"
          padding="s"
          borderWidth={1}
          borderColor="border"
        >
          <Box flexDirection="row" alignItems="center" marginBottom="xs">
            <Ionicons name="water-outline" size={16} color={theme.colors.info} />
            <Text variant="caption" color="textMuted" marginLeft="xs">Avg Water</Text>
          </Box>
          <Text variant="h3" color="textPrimary">{averages.avgWater} <Text variant="caption">ml/day</Text></Text>
        </Box>

        {/* Avg Calories */}
        <Box
          width="48%"
          backgroundColor="mainBackground"
          borderRadius="m"
          padding="s"
          borderWidth={1}
          borderColor="border"
        >
          <Box flexDirection="row" alignItems="center" marginBottom="xs">
            <Ionicons name="restaurant-outline" size={16} color={theme.colors.secondary} />
            <Text variant="caption" color="textMuted" marginLeft="xs">Avg Calories</Text>
          </Box>
          <Text variant="h3" color="textPrimary">{averages.avgCal} <Text variant="caption">kcal/day</Text></Text>
        </Box>

        {/* Avg Weight */}
        <Box
          width="48%"
          backgroundColor="mainBackground"
          borderRadius="m"
          padding="s"
          borderWidth={1}
          borderColor="border"
        >
          <Box flexDirection="row" alignItems="center" marginBottom="xs">
            <Ionicons name="fitness-outline" size={16} color={theme.colors.accent} />
            <Text variant="caption" color="textMuted" marginLeft="xs">Avg Weight</Text>
          </Box>
          <Text variant="h3" color="textPrimary">{averages.avgWeight}</Text>
        </Box>

        {/* Avg Kicks */}
        <Box
          width="48%"
          backgroundColor="mainBackground"
          borderRadius="m"
          padding="s"
          borderWidth={1}
          borderColor="border"
        >
          <Box flexDirection="row" alignItems="center" marginBottom="xs">
            <Ionicons name="hand-left-outline" size={16} color={theme.colors.primary} />
            <Text variant="caption" color="textMuted" marginLeft="xs">Avg Kicks</Text>
          </Box>
          <Text variant="h3" color="textPrimary">{averages.avgKicks} <Text variant="caption">/ session</Text></Text>
        </Box>
      </Box>
    </Card>
  );
}
