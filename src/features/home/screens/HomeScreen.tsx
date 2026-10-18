import React, { useState } from 'react';
import { ScrollView, Modal } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useTheme } from '@shopify/restyle';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/layout/Screen';
import { Box, Text, Card } from '@/theme/restyleComponents';
import { Touchable } from '@/components/primitives/Touchable';
import { GradientBox, GradientBadge } from '@/components/ui/GradientComponents';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { usePregnancyWeek } from '@/hooks/usePregnancyWeek';
import { useAuthStore } from '@/stores/authStore';
import { useTrackingStore } from '@/stores/trackingStore';
import { getWeekInfo } from '@/utils/pregnancy';
import { formatDate, getDueDate, getDueDateWeekRange } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import { type Theme, GRADIENTS } from '@/theme/theme';

export function HomeScreen() {
  const theme = useTheme<Theme>();
  const user = useAuthStore((s) => s.user);
  const { currentWeek, dueDate, progress, daysRemaining } = usePregnancyWeek();
  const { todayCalories, todayWater, vitaminsTaken } = useTrackingStore();
  const weekInfo = getWeekInfo(currentWeek);
  const [showDueModal, setShowDueModal] = useState(false);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <Screen scrollable safeTop padded={false} backgroundColor="mainBackground">
      {/* Gradient Header */}
      <Animated.View entering={FadeInDown.duration(500).delay(100)}>
        <LinearGradient
          colors={GRADIENTS.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 24,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
          }}
        >
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            marginBottom="s"
          >
            <Box flex={1}>
              <Text variant="h2" color="textInverse" style={{ opacity: 0.9 }}>
                {greeting()},
              </Text>
              <Text variant="h1" color="textInverse">
                {user?.first_name ?? 'Mama'} 👋
              </Text>
            </Box>
            <Touchable
              onPress={() => router.push('/(modals)/calendar' as any)}
              activeScale={0.9}
            >
              <Box
                width={44}
                height={44}
                borderRadius="full"
                backgroundColor="surfaceFrosted"
                alignItems="center"
                justifyContent="center"
              >
                <Ionicons name="calendar-outline" size={22} color={theme.colors.textPrimary} />
              </Box>
            </Touchable>
          </Box>
          <Text variant="bodySmall" color="textInverse" style={{ opacity: 0.85 }}>
            Week {currentWeek} · Your baby is a {weekInfo.fruitName.toLowerCase()}{' '}
            {weekInfo.fruitEmoji}
          </Text>
        </LinearGradient>
      </Animated.View>

      <Box paddingHorizontal="m">
        {/* Baby Growth Card */}
        <Animated.View entering={FadeInUp.duration(600).delay(200)}>
          <Card
            variant="elevated"
            marginTop="m"
            marginBottom="m"
            paddingVertical="l"
            style={{
              borderRadius: 24,
              shadowColor: theme.colors.primary,
              shadowOpacity: 0.08,
              shadowOffset: { width: 0, height: 6 },
              shadowRadius: 20,
            }}
          >
            <Box alignItems="center">
              {/* Illustrated Fruit Badge */}
              <Box position="relative" alignItems="center" justifyContent="center" marginBottom="m">
                {/* Organic blob background */}
                <Box
                  width={120}
                  height={120}
                  borderRadius="full"
                  alignItems="center"
                  justifyContent="center"
                  style={{ overflow: 'hidden' }}
                >
                  <LinearGradient
                    colors={[theme.colors.peachLight, theme.colors.primaryLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 9999,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 56, lineHeight: 68, textAlign: 'center' }}>
                      {weekInfo.fruitEmoji}
                    </Text>
                  </LinearGradient>
                </Box>

                {/* Decorative sparkles */}
                <Box style={{ position: 'absolute', top: -2, right: -6 }}>
                  <Ionicons name="sparkles" size={22} color={theme.colors.gold} />
                </Box>
                <Box style={{ position: 'absolute', bottom: 0, left: -6 }}>
                  <Ionicons name="heart" size={16} color={theme.colors.primary} />
                </Box>
              </Box>

              {/* Fruit Badge Pill */}
              <GradientBadge preset="primary" style={{ marginBottom: 8 }}>
                <Text
                  variant="statLabel"
                  color="textInverse"
                  style={{ textTransform: 'uppercase', letterSpacing: 1 }}
                >
                  {weekInfo.fruitName} · WEEK {weekInfo.week}
                </Text>
              </GradientBadge>

              {/* Metrics Row */}
              <Box flexDirection="row" gap="s" alignItems="center" marginTop="xs" marginBottom="xs">
                <Box
                  backgroundColor="peachSubtle"
                  paddingHorizontal="m"
                  paddingVertical="xs"
                  borderRadius="full"
                >
                  <Text variant="caption" color="textPrimary" fontFamily="Inter_500Medium">
                    📏 {weekInfo.babyLength}
                  </Text>
                </Box>
                <Box
                  backgroundColor="mintLight"
                  paddingHorizontal="m"
                  paddingVertical="xs"
                  borderRadius="full"
                >
                  <Text variant="caption" color="textPrimary" fontFamily="Inter_500Medium">
                    ⚖️ {weekInfo.babyWeight}
                  </Text>
                </Box>
              </Box>

              <Text
                variant="bodySmall"
                textAlign="center"
                marginTop="xs"
                color="textSecondary"
                style={{ maxWidth: '85%' }}
              >
                {weekInfo.description}
              </Text>

              {/* Gradient Progress Bar */}
              <Box
                width="100%"
                height={10}
                backgroundColor="border"
                borderRadius="full"
                marginTop="l"
                overflow="hidden"
              >
                <LinearGradient
                  colors={GRADIENTS.progress}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    height: 10,
                    borderRadius: 9999,
                    width: `${progress}%`,
                  }}
                />
              </Box>
              <Box
                flexDirection="row"
                justifyContent="space-between"
                width="100%"
                marginTop="xs"
              >
                <Text variant="caption" fontFamily="Inter_600SemiBold" color="primary">
                  {Math.round(progress)}% complete
                </Text>
                <Text variant="caption" color="textMuted">
                  {daysRemaining} days to go
                </Text>
              </Box>
            </Box>
          </Card>
        </Animated.View>

        {/* Today's Wellness */}
        <Animated.View entering={FadeInUp.duration(500).delay(300)}>
          <Text variant="h3" marginBottom="s">
            Today's Wellness
          </Text>
          <Box flexDirection="row" gap="s" marginBottom="m">
            {/* Water */}
            <Card variant="glass" flex={1} alignItems="center" paddingVertical="m">
              <Box
                width={44}
                height={44}
                borderRadius="full"
                alignItems="center"
                justifyContent="center"
                marginBottom="xs"
                style={{ overflow: 'hidden' }}
              >
                <LinearGradient
                  colors={['#63B3ED', '#4299E1']}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="water" size={22} color="#FFFFFF" />
                </LinearGradient>
              </Box>
              <Text variant="h3" color="textPrimary">
                {todayWater}
              </Text>
              <Text variant="statLabel" color="info">
                ML WATER
              </Text>
            </Card>

            {/* Vitamins */}
            <Card variant="glass" flex={1} alignItems="center" paddingVertical="m">
              <Box
                width={44}
                height={44}
                borderRadius="full"
                alignItems="center"
                justifyContent="center"
                marginBottom="xs"
                style={{ overflow: 'hidden' }}
              >
                <LinearGradient
                  colors={['#68D391', '#48BB78']}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="medkit" size={22} color="#FFFFFF" />
                </LinearGradient>
              </Box>
              <Text variant="h3" color="textPrimary">
                {vitaminsTaken.length}
              </Text>
              <Text variant="statLabel" color="secondary">
                VITAMINS
              </Text>
            </Card>

            {/* Nutrition */}
            <Card variant="glass" flex={1} alignItems="center" paddingVertical="m">
              <Box
                width={44}
                height={44}
                borderRadius="full"
                alignItems="center"
                justifyContent="center"
                marginBottom="xs"
                style={{ overflow: 'hidden' }}
              >
                <LinearGradient
                  colors={['#B794F4', '#9F7AEA']}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="restaurant" size={22} color="#FFFFFF" />
                </LinearGradient>
              </Box>
              <Text variant="h3" color="textPrimary">
                {todayCalories}
              </Text>
              <Text variant="statLabel" color="accent">
                KCAL
              </Text>
            </Card>
          </Box>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInUp.duration(500).delay(400)}>
          <Text variant="h3" marginBottom="s">
            Quick Actions
          </Text>
          <Box flexDirection="row" flexWrap="wrap" justifyContent="space-between" rowGap="s" marginBottom="l">
            {[
              {
                icon: 'chatbubble-ellipses' as const,
                label: 'Ask AI',
                route: '/(tabs)/chat',
                gradient: ['#ED64A6', '#F687B3'] as const,
              },
              {
                icon: 'camera' as const,
                label: 'Scan Meal',
                route: '/(tabs)/track?tab=meals',
                gradient: ['#48BB78', '#68D391'] as const,
              },
              {
                icon: 'fitness' as const,
                label: 'Log Weight',
                route: '/(tabs)/track?tab=kicks',
                gradient: ['#B794F4', '#D6BCFA'] as const,
              },
              {
                icon: 'water' as const,
                label: 'Log Water',
                route: '/(tabs)/track',
                gradient: ['#63B3ED', '#90CDF4'] as const,
              },
            ].map((action) => (
              <Box key={action.label} width="48.5%">
                <Touchable onPress={() => router.push(action.route as any)}>
                  <Card
                    variant="glass"
                    alignItems="center"
                    paddingVertical="m"
                    style={{ borderRadius: 20 }}
                  >
                    <Box
                      width={48}
                      height={48}
                      borderRadius="full"
                      alignItems="center"
                      justifyContent="center"
                      marginBottom="s"
                      style={{ overflow: 'hidden' }}
                    >
                      <LinearGradient
                        colors={action.gradient}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 24,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Ionicons name={action.icon} size={24} color="#FFFFFF" />
                      </LinearGradient>
                    </Box>
                    <Text variant="label" fontFamily="Inter_600SemiBold">
                      {action.label}
                    </Text>
                  </Card>
                </Touchable>
              </Box>
            ))}
          </Box>
        </Animated.View>

        {/* Expected Due Week */}
        <Animated.View entering={FadeInUp.duration(500).delay(500)}>
          <Touchable onPress={() => setShowDueModal(true)} activeScale={0.97}>
            <Card
              variant="elevated"
              marginBottom="l"
              style={{
                borderRadius: 20,
                overflow: 'hidden',
              }}
            >
              <LinearGradient
                colors={[theme.colors.peachSubtle, theme.colors.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
              <Box flexDirection="row" alignItems="center">
                <Box
                  width={52}
                  height={52}
                  borderRadius="full"
                  backgroundColor="coralLight"
                  alignItems="center"
                  justifyContent="center"
                  marginRight="m"
                >
                  <Text style={{ fontSize: 28, lineHeight: 34 }}>🎀</Text>
                </Box>
                <Box flex={1}>
                  <Text variant="statLabel" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                    EXPECTED DUE WEEK
                  </Text>
                  <Text variant="h3" color="textPrimary" marginTop="xs">
                    {user?.pregnancy_start_date
                      ? getDueDateWeekRange(user.pregnancy_start_date)
                      : 'Not set'}
                  </Text>
                </Box>
                <Ionicons name="information-circle-outline" size={22} color={theme.colors.primary} />
              </Box>
            </Card>
          </Touchable>
        </Animated.View>
      </Box>

      {/* Due Date Calculation Modal */}
      <Modal
        visible={showDueModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDueModal(false)}
      >
        <Box flex={1} backgroundColor="overlay" justifyContent="center" alignItems="center" padding="m">
          <Card
            variant="elevated"
            style={{ width: '100%', maxWidth: 360, borderRadius: 24, padding: 20, overflow: 'hidden' }}
          >
            <LinearGradient
              colors={[theme.colors.peachSubtle, theme.colors.surfaceElevated]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />

            <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
              <Box flexDirection="row" alignItems="center">
                <Text style={{ fontSize: 24, marginRight: 8 }}>🎀</Text>
                <Text variant="h3">Due Date Info</Text>
              </Box>
              <Touchable onPress={() => setShowDueModal(false)} hitSlop={10}>
                <Ionicons name="close-circle" size={26} color={theme.colors.textMuted} />
              </Touchable>
            </Box>

            <Text variant="bodySmall" color="textSecondary" marginBottom="m" style={{ lineHeight: 20 }}>
              Here is how your pregnancy timeline and estimated due week are calculated:
            </Text>

            <Box gap="s" marginBottom="m">
              <Box backgroundColor="surfaceFrosted" padding="m" borderRadius="l" borderWidth={1} borderColor="border">
                <Text variant="label" fontFamily="Inter_600SemiBold" color="primary" marginBottom="xs">
                  1. Standard 40-Week Model
                </Text>
                <Text variant="caption" color="textSecondary" style={{ lineHeight: 18 }}>
                  Calculated using Naegele's Rule — 280 days (40 weeks) from your recorded pregnancy start date.
                </Text>
              </Box>

              <Box backgroundColor="surfaceFrosted" padding="m" borderRadius="l" borderWidth={1} borderColor="border">
                <Text variant="label" fontFamily="Inter_600SemiBold" color="coral" marginBottom="xs">
                  2. 7-Day Window Range
                </Text>
                <Text variant="caption" color="textSecondary" style={{ lineHeight: 18 }}>
                  Only ~4% of babies are born on their exact due date! Displaying a 7-day range gives a realistic target window.
                </Text>
              </Box>

              {user?.pregnancy_start_date && (
                <Box backgroundColor="peachLight" padding="m" borderRadius="l">
                  <Text variant="caption" color="textMuted">START DATE</Text>
                  <Text variant="bodySmall" fontFamily="Inter_600SemiBold" marginBottom="xs">
                    {formatDate(user.pregnancy_start_date, 'MMMM d, yyyy')}
                  </Text>

                  <Text variant="caption" color="textMuted" marginTop="xs">ESTIMATED DUE DATE</Text>
                  <Text variant="bodySmall" fontFamily="Inter_700Bold" color="primary" marginBottom="xs">
                    {formatDate(getDueDate(user.pregnancy_start_date), 'MMMM d, yyyy')}
                  </Text>

                  <Text variant="caption" color="textMuted" marginTop="xs">DUE WEEK RANGE</Text>
                  <Text variant="bodySmall" fontFamily="Inter_700Bold" color="coral">
                    {getDueDateWeekRange(user.pregnancy_start_date)}
                  </Text>
                </Box>
              )}
            </Box>

            <Touchable onPress={() => setShowDueModal(false)}>
              <Box
                backgroundColor="primary"
                borderRadius="l"
                paddingVertical="m"
                alignItems="center"
              >
                <Text variant="buttonSmall" color="textInverse">
                  Got it! 💕
                </Text>
              </Box>
            </Touchable>
          </Card>
        </Box>
      </Modal>
    </Screen>
  );
}
