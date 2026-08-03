import React from 'react';
import { ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useTheme } from '@shopify/restyle';
import { Screen } from '@/components/layout/Screen';
import { Box, Text, Card } from '@/theme/restyleComponents';
import { Touchable } from '@/components/primitives/Touchable';
import { usePregnancyWeek } from '@/hooks/usePregnancyWeek';
import { useAuthStore } from '@/stores/authStore';
import { useTrackingStore } from '@/stores/trackingStore';
import { getWeekInfo } from '@/utils/pregnancy';
import { formatDate, getDueDateWeekRange } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import { type Theme } from '@/theme/theme';

export function HomeScreen() {
  const theme = useTheme<Theme>();
  const user = useAuthStore((s) => s.user);
  const { currentWeek, dueDate, progress, daysRemaining } = usePregnancyWeek();
  const { todayCalories, todayWater, vitaminsTaken } = useTrackingStore();
  const weekInfo = getWeekInfo(currentWeek);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <Screen scrollable safeTop backgroundColor="mainBackground">
      {/* Greeting */}
      <Animated.View entering={FadeInDown.duration(500).delay(100)}>
        <Box marginBottom="l">
          <Text variant="h2">
            {greeting()}, {user?.first_name ?? 'Mama'} 👋
          </Text>
          <Text variant="bodySmall" marginTop="xs">
            Week {currentWeek} · Your baby is a {weekInfo.fruitName.toLowerCase()}{' '}
            {weekInfo.fruitEmoji}
          </Text>
        </Box>
      </Animated.View>

      {/* Baby Growth Card */}
      <Animated.View entering={FadeInDown.duration(500).delay(200)}>
        <Card variant="elevated" marginBottom="m" paddingVertical="l">
          <Box alignItems="center">
            {/* Styled Illustration Badge */}
            <Box
              position="relative"
              alignItems="center"
              justifyContent="center"
              marginBottom="m"
            >
              {/* Outer Pulsing Glow Circle */}
              <Box
                width={110}
                height={110}
                borderRadius="full"
                backgroundColor="primaryLight"
                alignItems="center"
                justifyContent="center"
                borderWidth={3}
                borderColor="primary"
                style={{
                  shadowColor: theme.colors.primary,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.25,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <Text style={{ fontSize: 52, lineHeight: 62, textAlign: 'center' }}>
                  {weekInfo.fruitEmoji}
                </Text>
              </Box>

              {/* Decorative Corner Sparkles */}
              <Box style={{ position: 'absolute', top: -4, right: -4 }}>
                <Ionicons name="sparkles" size={20} color={theme.colors.primary} />
              </Box>
              <Box style={{ position: 'absolute', bottom: -2, left: -4 }}>
                <Ionicons name="heart" size={16} color={theme.colors.secondary} />
              </Box>
            </Box>

            {/* Fruit & Week Pill Badge */}
            <Box
              backgroundColor="primaryLight"
              borderRadius="full"
              paddingHorizontal="m"
              paddingVertical="xs"
              marginBottom="xs"
            >
              <Text variant="caption" color="primary" fontFamily="Inter_700Bold">
                {weekInfo.fruitName.toUpperCase()} SIZE · WEEK {weekInfo.week}
              </Text>
            </Box>

            {/* Metrics Row */}
            <Box flexDirection="row" gap="s" alignItems="center" marginTop="xs" marginBottom="xs">
              <Box backgroundColor="inputBackground" paddingHorizontal="s" paddingVertical="xs" borderRadius="s">
                <Text variant="caption" color="textPrimary">📏 {weekInfo.babyLength}</Text>
              </Box>
              <Box backgroundColor="inputBackground" paddingHorizontal="s" paddingVertical="xs" borderRadius="s">
                <Text variant="caption" color="textPrimary">⚖️ {weekInfo.babyWeight}</Text>
              </Box>
            </Box>

            <Text variant="bodySmall" textAlign="center" marginTop="xs" color="textSecondary" style={{ maxWidth: '85%' }}>
              {weekInfo.description}
            </Text>

            {/* Progress bar */}
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
                backgroundColor="primary"
                width={`${progress}%`}
              />
            </Box>
            <Text variant="caption" marginTop="xs">
              {Math.round(progress)}% · {daysRemaining} days to go
            </Text>
          </Box>
        </Card>
      </Animated.View>

      {/* Today's Tracking Summary */}
      <Animated.View entering={FadeInDown.duration(500).delay(300)}>
        <Text variant="h3" marginBottom="s">
          Today's Progress
        </Text>
        <Box flexDirection="row" gap="s" marginBottom="m">
          <Card flex={1} alignItems="center" paddingVertical="s">
            <Text style={{ fontSize: 28, lineHeight: 36, textAlign: 'center' }}>💧</Text>
            <Text variant="h3" marginTop="xs">
              {todayWater}
            </Text>
            <Text variant="caption">ml water</Text>
          </Card>
          <Card flex={1} alignItems="center" paddingVertical="s">
            <Text style={{ fontSize: 28, lineHeight: 36, textAlign: 'center' }}>💊</Text>
            <Text variant="h3" marginTop="xs">
              {vitaminsTaken.length}
            </Text>
            <Text variant="caption">vitamins</Text>
          </Card>
          <Card flex={1} alignItems="center" paddingVertical="s">
            <Text style={{ fontSize: 28, lineHeight: 36, textAlign: 'center' }}>🥗</Text>
            <Text variant="h3" marginTop="xs">
              {todayCalories}
            </Text>
            <Text variant="caption">kcal</Text>
          </Card>
        </Box>
      </Animated.View>

      {/* Quick Actions */}
      <Animated.View entering={FadeInDown.duration(500).delay(400)}>
        <Text variant="h3" marginBottom="s">
          Quick Actions
        </Text>
        <Box flexDirection="row" flexWrap="wrap" justifyContent="space-between" rowGap="s" marginBottom="l">
          {[
            { icon: 'chatbubble-ellipses', label: 'Ask AI', route: '/(tabs)/chat', color: theme.colors.primary },
            { icon: 'camera', label: 'Scan Meal', route: '/(tabs)/track?tab=meals', color: theme.colors.secondary },
            { icon: 'fitness', label: 'Log Weight', route: '/(tabs)/track?tab=kicks', color: theme.colors.accent },
            { icon: 'water', label: 'Log Water', route: '/(tabs)/track?tab=water', color: theme.colors.info },
          ].map((action) => (
            <Box key={action.label} width="48.5%">
              <Touchable onPress={() => router.push(action.route as any)}>
                <Card variant="outlined" alignItems="center" paddingVertical="m">
                  <Ionicons
                    name={action.icon as any}
                    size={28}
                    color={action.color}
                  />
                  <Text variant="label" marginTop="s">
                    {action.label}
                  </Text>
                </Card>
              </Touchable>
            </Box>
          ))}
        </Box>
      </Animated.View>

      {/* Expected Due Week */}
      <Animated.View entering={FadeInDown.duration(500).delay(500)}>
        <Card variant="elevated" marginBottom="l">
          <Box flexDirection="row" alignItems="center">
            <Text style={{ fontSize: 32, marginRight: 12 }}>🎀</Text>
            <Box flex={1}>
              <Text variant="label">Expected Due Week</Text>
              <Text variant="h3">
                {user?.pregnancy_start_date ? getDueDateWeekRange(user.pregnancy_start_date) : 'Not set'}
              </Text>
            </Box>
          </Box>
        </Card>
      </Animated.View>
    </Screen>
  );
}
