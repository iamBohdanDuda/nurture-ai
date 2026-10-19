import React, { useState } from 'react';
import { Modal } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useTheme } from '@shopify/restyle';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/layout/Screen';
import { Box, Text, Card } from '@/theme/restyleComponents';
import { Touchable } from '@/components/primitives/Touchable';
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
  const { currentWeek, trimester, progress, daysRemaining } = usePregnancyWeek();
  const { todayCalories, todayWater, vitaminsTaken, logWater, toggleVitamin } = useTrackingStore();
  const weekInfo = getWeekInfo(currentWeek);
  const [showDueModal, setShowDueModal] = useState(false);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const trimesterLabel =
    trimester === 1 ? '1st Trimester' : trimester === 2 ? '2nd Trimester' : '3rd Trimester';

  const waterTarget = 2300;
  const waterPercent = Math.min(100, Math.round((todayWater / waterTarget) * 100));
  const isPrenatalTaken = vitaminsTaken.includes('prenatal');

  return (
    <Screen scrollable safeTop padded={false} backgroundColor="mainBackground">
      {/* Editorial Header */}
      <Animated.View entering={FadeInDown.duration(450).delay(80)}>
        <Box
          paddingHorizontal="m"
          paddingTop="s"
          paddingBottom="m"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box flex={1}>
            <Text variant="caption" color="textSecondary" style={{ letterSpacing: 0.5 }}>
              {greeting()},
            </Text>
            <Text variant="h1" color="textPrimary" marginTop="xs">
              {user?.first_name ?? 'Mama'}
            </Text>
          </Box>

          {/* Calendar & Today Button */}
          <Touchable
            onPress={() => router.push('/(modals)/calendar' as any)}
            activeScale={0.92}
            accessibilityLabel="View pregnancy calendar"
          >
            <Box
              flexDirection="row"
              alignItems="center"
              backgroundColor="surfaceElevated"
              paddingHorizontal="m"
              paddingVertical="s"
              borderRadius="full"
              borderWidth={1}
              borderColor="border"
              style={{
                shadowColor: theme.colors.shadow,
                shadowOpacity: 0.04,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 8,
                elevation: 1,
              }}
            >
              <Ionicons name="calendar-outline" size={17} color={theme.colors.primary} style={{ marginRight: 6 }} />
              <Text variant="caption" fontFamily="Inter_600SemiBold" color="textPrimary">
                Week {currentWeek}
              </Text>
            </Box>
          </Touchable>
        </Box>
      </Animated.View>

      <Box paddingHorizontal="m">
        {/* Baby Growth Milestone Card — Editorial Stage */}
        <Animated.View entering={FadeInUp.duration(550).delay(150)}>
          <Card
            variant="elevated"
            marginBottom="l"
            padding="l"
            style={{
              borderRadius: 28,
              borderWidth: 1,
              borderColor: 'rgba(239, 231, 220, 0.7)',
              backgroundColor: '#FFFFFF',
              overflow: 'hidden',
            }}
          >
            {/* Ambient Background Aura */}
            <LinearGradient
              colors={[theme.colors.peachSubtle, '#FFFFFF', theme.colors.peachSubtle]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />

            <Box alignItems="center">
              {/* Category Pill */}
              <Box
                backgroundColor="peachLight"
                paddingHorizontal="m"
                paddingVertical="xs"
                borderRadius="full"
                marginBottom="m"
              >
                <Text
                  variant="caption"
                  fontFamily="Inter_600SemiBold"
                  color="textSecondary"
                  style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}
                >
                  WEEK {weekInfo.week} · {trimesterLabel}
                </Text>
              </Box>

              {/* Concentric Ambient Stage for Fruit */}
              <Box
                position="relative"
                alignItems="center"
                justifyContent="center"
                marginBottom="m"
              >
                {/* Outer soft glow ring */}
                <Box
                  width={140}
                  height={140}
                  borderRadius="full"
                  backgroundColor="peachLight"
                  style={{ opacity: 0.45, position: 'absolute' }}
                />

                {/* Inner Stage */}
                <Box
                  width={116}
                  height={116}
                  borderRadius="full"
                  backgroundColor="white"
                  borderWidth={1.5}
                  borderColor="border"
                  alignItems="center"
                  justifyContent="center"
                  style={{
                    shadowColor: theme.colors.shadow,
                    shadowOpacity: 0.08,
                    shadowOffset: { width: 0, height: 6 },
                    shadowRadius: 16,
                    elevation: 3,
                  }}
                >
                  <LinearGradient
                    colors={[theme.colors.peachSubtle, '#FFFFFF']}
                    style={{
                      width: 110,
                      height: 110,
                      borderRadius: 55,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 52, lineHeight: 62, textAlign: 'center' }}>
                      {weekInfo.fruitEmoji}
                    </Text>
                  </LinearGradient>
                </Box>
              </Box>

              {/* Fruit Name & Subtitle */}
              <Text variant="caption" color="textSecondary" style={{ letterSpacing: 0.5 }}>
                Your baby is the size of a
              </Text>
              <Text
                variant="h2"
                color="textPrimary"
                fontFamily="Inter_700Bold"
                marginTop="xs"
                marginBottom="s"
              >
                {weekInfo.fruitName}
              </Text>

              {/* Baby Measurements Row */}
              <Box flexDirection="row" gap="s" alignItems="center" marginBottom="m">
                <Box
                  backgroundColor="warmSurfaceSoft"
                  paddingHorizontal="m"
                  paddingVertical="s"
                  borderRadius="full"
                  borderWidth={1}
                  borderColor="border"
                >
                  <Text variant="caption" color="textPrimary" fontFamily="Inter_600SemiBold">
                    📏 {weekInfo.babyLength}
                  </Text>
                </Box>
                <Box
                  backgroundColor="warmSurfaceSoft"
                  paddingHorizontal="m"
                  paddingVertical="s"
                  borderRadius="full"
                  borderWidth={1}
                  borderColor="border"
                >
                  <Text variant="caption" color="textPrimary" fontFamily="Inter_600SemiBold">
                    ⚖️ {weekInfo.babyWeight}
                  </Text>
                </Box>
              </Box>

              {/* Developmental Story */}
              <Text
                variant="bodySmall"
                textAlign="center"
                color="textSecondary"
                style={{ lineHeight: 22, maxWidth: '92%' }}
                marginBottom="l"
              >
                {weekInfo.description}
              </Text>

              {/* Pregnancy Journey Progress Track */}
              <Box width="100%">
                <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="xs">
                  <Text variant="caption" fontFamily="Inter_600SemiBold" color="primary">
                    {Math.round(progress)}% of your journey
                  </Text>
                  <Text variant="caption" color="textMuted">
                    {daysRemaining} days to go
                  </Text>
                </Box>

                {/* Progress bar with milestones */}
                <Box
                  width="100%"
                  height={8}
                  backgroundColor="border"
                  borderRadius="full"
                  overflow="hidden"
                >
                  <LinearGradient
                    colors={GRADIENTS.progress}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      height: 8,
                      borderRadius: 9999,
                      width: `${progress}%`,
                    }}
                  />
                </Box>

                {/* Trimester Milestone Indicators */}
                <Box flexDirection="row" justifyContent="space-between" width="100%" marginTop="xs">
                  <Text variant="caption" color="textMuted" style={{ fontSize: 10 }}>
                    1st Trimester
                  </Text>
                  <Text variant="caption" color="textMuted" style={{ fontSize: 10 }}>
                    2nd Trimester
                  </Text>
                  <Text variant="caption" color="textMuted" style={{ fontSize: 10 }}>
                    3rd Trimester
                  </Text>
                </Box>
              </Box>
            </Box>
          </Card>
        </Animated.View>

        {/* Today's Daily Wellness — Interactive Cards */}
        <Animated.View entering={FadeInUp.duration(500).delay(250)}>
          <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="s">
            <Text variant="h3">Today's Daily Care</Text>
            <Touchable onPress={() => router.push('/(tabs)/track')}>
              <Text variant="caption" color="primary" fontFamily="Inter_600SemiBold">
                View All
              </Text>
            </Touchable>
          </Box>

          <Box flexDirection="row" gap="s" marginBottom="l">
            {/* 1. Interactive Water Card */}
            <Card
              variant="elevated"
              flex={1}
              padding="m"
              style={{
                borderRadius: 22,
                backgroundColor: '#FFFFFF',
              }}
            >
              <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="xs">
                <Box
                  width={34}
                  height={34}
                  borderRadius="full"
                  backgroundColor="mintLight"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Ionicons name="water" size={17} color={theme.colors.info} />
                </Box>
                <Touchable
                  onPress={() => logWater(250)}
                  activeScale={0.88}
                  hitSlop={8}
                  accessibilityLabel="Add 250ml water"
                >
                  <Box
                    backgroundColor="mintLight"
                    paddingHorizontal="s"
                    paddingVertical="xs"
                    borderRadius="full"
                  >
                    <Text variant="caption" color="info" fontFamily="Inter_600SemiBold">
                      +250ml
                    </Text>
                  </Box>
                </Touchable>
              </Box>

              <Text variant="h3" color="textPrimary" marginTop="xs">
                {todayWater}
                <Text variant="caption" color="textMuted"> ml</Text>
              </Text>
              <Text variant="caption" color="textMuted" marginBottom="s">
                {waterPercent}% of 2.3L
              </Text>

              {/* Mini progress line */}
              <Box width="100%" height={4} backgroundColor="border" borderRadius="full" overflow="hidden">
                <Box
                  height={4}
                  borderRadius="full"
                  backgroundColor="info"
                  style={{ width: `${waterPercent}%` }}
                />
              </Box>
            </Card>

            {/* 2. Interactive Vitamins Card */}
            <Card
              variant="elevated"
              flex={1}
              padding="m"
              style={{
                borderRadius: 22,
                backgroundColor: '#FFFFFF',
              }}
            >
              <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="xs">
                <Box
                  width={34}
                  height={34}
                  borderRadius="full"
                  backgroundColor="secondaryLight"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Ionicons name="medkit" size={17} color={theme.colors.secondary} />
                </Box>
                <Touchable
                  onPress={() => toggleVitamin('prenatal')}
                  activeScale={0.88}
                  hitSlop={8}
                  accessibilityLabel="Toggle prenatal vitamin"
                >
                  <Box
                    backgroundColor={isPrenatalTaken ? 'secondary' : 'secondaryLight'}
                    width={24}
                    height={24}
                    borderRadius="full"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Ionicons
                      name="checkmark"
                      size={15}
                      color={isPrenatalTaken ? '#FFFFFF' : theme.colors.secondary}
                    />
                  </Box>
                </Touchable>
              </Box>

              <Text variant="h3" color="textPrimary" marginTop="xs">
                {vitaminsTaken.length}
                <Text variant="caption" color="textMuted"> done</Text>
              </Text>
              <Text variant="caption" color="textMuted" marginBottom="s">
                {isPrenatalTaken ? 'Prenatal taken' : 'Prenatal pending'}
              </Text>

              {/* Status Indicator */}
              <Box width="100%" height={4} backgroundColor="border" borderRadius="full" overflow="hidden">
                <Box
                  height={4}
                  borderRadius="full"
                  backgroundColor="secondary"
                  style={{ width: isPrenatalTaken ? '100%' : '25%' }}
                />
              </Box>
            </Card>

            {/* 3. Nutrition Card */}
            <Touchable
              flex={1}
              onPress={() => router.push('/(tabs)/track?tab=meals')}
              activeScale={0.96}
            >
              <Card
                variant="elevated"
                padding="m"
                style={{
                  borderRadius: 22,
                  backgroundColor: '#FFFFFF',
                }}
              >
                <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="xs">
                  <Box
                    width={34}
                    height={34}
                    borderRadius="full"
                    backgroundColor="coralLight"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Ionicons name="restaurant" size={17} color={theme.colors.coral} />
                  </Box>
                  <Ionicons name="chevron-forward" size={15} color={theme.colors.textMuted} />
                </Box>

                <Text variant="h3" color="textPrimary" marginTop="xs">
                  {todayCalories}
                  <Text variant="caption" color="textMuted"> kcal</Text>
                </Text>
                <Text variant="caption" color="textMuted" marginBottom="s">
                  Daily nutrition
                </Text>

                {/* Progress Line */}
                <Box width="100%" height={4} backgroundColor="border" borderRadius="full" overflow="hidden">
                  <Box
                    height={4}
                    borderRadius="full"
                    backgroundColor="coral"
                    style={{ width: `${Math.min(100, Math.round((todayCalories / 2200) * 100))}%` }}
                  />
                </Box>
              </Card>
            </Touchable>
          </Box>
        </Animated.View>

        {/* Quick Actions — Tactile Grid */}
        <Animated.View entering={FadeInUp.duration(500).delay(350)}>
          <Text variant="h3" marginBottom="s">
            Care Shortcuts
          </Text>
          <Box flexDirection="row" flexWrap="wrap" justifyContent="space-between" rowGap="s" marginBottom="l">
            {[
              {
                icon: 'chatbubble-ellipses' as const,
                title: 'Ask NurtureAI',
                subtitle: 'Doula & Nutrition advice',
                route: '/(tabs)/chat',
                color: theme.colors.primary,
                bg: theme.colors.primaryLight,
              },
              {
                icon: 'camera' as const,
                title: 'Scan Meal',
                subtitle: 'Instant safety check',
                route: '/(tabs)/track?tab=meals',
                color: theme.colors.secondary,
                bg: theme.colors.secondaryLight,
              },
              {
                icon: 'hand-left' as const,
                title: 'Kick Counter',
                subtitle: 'Record baby movement',
                route: '/(tabs)/track?tab=kicks',
                color: theme.colors.accent,
                bg: theme.colors.accentLight,
              },
              {
                icon: 'fitness' as const,
                title: 'Weight & Body',
                subtitle: 'Log pregnancy metrics',
                route: '/(tabs)/track',
                color: theme.colors.coral,
                bg: theme.colors.coralLight,
              },
            ].map((action) => (
              <Box key={action.title} width="48.5%">
                <Touchable onPress={() => router.push(action.route as any)} activeScale={0.96}>
                  <Card
                    variant="elevated"
                    padding="m"
                    style={{
                      borderRadius: 22,
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <Box
                      width={42}
                      height={42}
                      borderRadius="m"
                      alignItems="center"
                      justifyContent="center"
                      marginBottom="s"
                      style={{ backgroundColor: action.bg }}
                    >
                      <Ionicons name={action.icon} size={22} color={action.color} />
                    </Box>
                    <Text variant="label" fontFamily="Inter_600SemiBold">
                      {action.title}
                    </Text>
                    <Text variant="caption" color="textMuted" marginTop="xs">
                      {action.subtitle}
                    </Text>
                  </Card>
                </Touchable>
              </Box>
            ))}
          </Box>
        </Animated.View>

        {/* Expected Due Week — Keepsake Banner */}
        <Animated.View entering={FadeInUp.duration(500).delay(450)}>
          <Touchable onPress={() => setShowDueModal(true)} activeScale={0.97}>
            <Card
              variant="elevated"
              marginBottom="l"
              padding="m"
              style={{
                borderRadius: 24,
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: 'rgba(239, 231, 220, 0.8)',
              }}
            >
              <Box flexDirection="row" alignItems="center">
                <Box
                  width={48}
                  height={48}
                  borderRadius="l"
                  backgroundColor="peachLight"
                  alignItems="center"
                  justifyContent="center"
                  marginRight="m"
                >
                  <Ionicons name="gift-outline" size={24} color={theme.colors.primary} />
                </Box>
                <Box flex={1}>
                  <Text variant="caption" color="textMuted" style={{ letterSpacing: 0.8, textTransform: 'uppercase' }}>
                    EXPECTED DUE WINDOW
                  </Text>
                  <Text variant="h3" color="textPrimary" marginTop="xs">
                    {user?.pregnancy_start_date
                      ? getDueDateWeekRange(user.pregnancy_start_date)
                      : 'Tap to configure'}
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
            style={{ width: '100%', maxWidth: 360, borderRadius: 28, padding: 24, backgroundColor: '#FFFFFF' }}
          >
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
              <Box flexDirection="row" alignItems="center">
                <Box
                  width={36}
                  height={36}
                  borderRadius="full"
                  backgroundColor="peachLight"
                  alignItems="center"
                  justifyContent="center"
                  marginRight="s"
                >
                  <Ionicons name="sparkles" size={18} color={theme.colors.primary} />
                </Box>
                <Text variant="h3">Due Date Guide</Text>
              </Box>
              <Touchable onPress={() => setShowDueModal(false)} hitSlop={10}>
                <Ionicons name="close-circle" size={26} color={theme.colors.textMuted} />
              </Touchable>
            </Box>

            <Text variant="bodySmall" color="textSecondary" marginBottom="m" style={{ lineHeight: 21 }}>
              Here is how your pregnancy timeline and estimated due week are calculated:
            </Text>

            <Box gap="s" marginBottom="m">
              <Box
                backgroundColor="warmSurfaceSoft"
                padding="m"
                borderRadius="l"
                borderWidth={1}
                borderColor="border"
              >
                <Text variant="label" fontFamily="Inter_600SemiBold" color="primary" marginBottom="xs">
                  1. Standard 40-Week Model
                </Text>
                <Text variant="caption" color="textSecondary" style={{ lineHeight: 18 }}>
                  Calculated using Naegele's Rule — 280 days (40 weeks) from your recorded pregnancy start date.
                </Text>
              </Box>

              <Box
                backgroundColor="warmSurfaceSoft"
                padding="m"
                borderRadius="l"
                borderWidth={1}
                borderColor="border"
              >
                <Text variant="label" fontFamily="Inter_600SemiBold" color="coral" marginBottom="xs">
                  2. 7-Day Target Window
                </Text>
                <Text variant="caption" color="textSecondary" style={{ lineHeight: 18 }}>
                  Only ~4% of babies arrive on their exact day. A 7-day range gives you a realistic, stress-free window.
                </Text>
              </Box>

              {user?.pregnancy_start_date && (
                <Box backgroundColor="peachLight" padding="m" borderRadius="l" borderWidth={1} borderColor="border">
                  <Text variant="caption" color="textMuted">RECORDED START DATE</Text>
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

            <Touchable onPress={() => setShowDueModal(false)} activeScale={0.96}>
              <Box
                backgroundColor="primary"
                borderRadius="l"
                paddingVertical="m"
                alignItems="center"
              >
                <Text variant="buttonSmall" color="textInverse">
                  Understood 💕
                </Text>
              </Box>
            </Touchable>
          </Card>
        </Box>
      </Modal>
    </Screen>
  );
}

