import React, { useRef } from 'react';
import { FlatList, Dimensions, ScrollView } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@shopify/restyle';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/layout/Screen';
import { Box, Text } from '@/theme/restyleComponents';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CalendarPicker } from '@/components/ui/CalendarPicker';
import { Touchable } from '@/components/primitives/Touchable';
import { GradientButton } from '@/components/ui/GradientComponents';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/features/auth/services/authService';
import { DIETARY_PREFERENCES, HEALTH_CONDITIONS } from '@/utils/pregnancy';
import { type Theme, GRADIENTS } from '@/theme/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DIET_COLORS = [
  { bg: '#F0FFF4', border: '#9AE6B4' }, // mint
  { bg: '#FFF5F7', border: '#FBB6CE' }, // pink
  { bg: '#FAF5FF', border: '#D6BCFA' }, // lavender
  { bg: '#E0F7FA', border: '#80DEEA' }, // teal
  { bg: '#FFF8E1', border: '#FFD54F' }, // gold
  { bg: '#FFF0ED', border: '#FFC4B4' }, // coral
  { bg: '#FFECD2', border: '#FFD8A8' }, // peach
  { bg: '#EBF8FF', border: '#90CDF4' }, // sky
  { bg: '#F0FFF4', border: '#68D391' }, // green
];

const HEALTH_COLORS = [
  { bg: '#FFF5F7', border: '#FBB6CE' },
  { bg: '#FFF8E1', border: '#FFD54F' },
  { bg: '#EBF8FF', border: '#90CDF4' },
  { bg: '#FAF5FF', border: '#D6BCFA' },
  { bg: '#FFECD2', border: '#FFD8A8' },
  { bg: '#E0F7FA', border: '#80DEEA' },
  { bg: '#F0FFF4', border: '#9AE6B4' },
];

export function OnboardingScreen() {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const { currentStep, totalSteps, data, updateData, nextStep, prevStep, complete } =
    useOnboardingStore();
  const { setUser, setOnboardingComplete } = useAuthStore();

  const goToStep = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      nextStep();
      goToStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      prevStep();
      goToStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      const session = useAuthStore.getState().session;
      if (!session?.user) return;

      const startDate = data.pregnancyStartDate ?? new Date();
      const profile = await authService.createUserProfile({
        id: session.user.id,
        email: session.user.email ?? '',
        first_name: data.firstName,
        pregnancy_start_date: startDate.toISOString().split('T')[0],
        blood_type: data.bloodType || null,
        emergency_contact: data.emergencyContact || null,
      });

      await authService.initUserMemory(session.user.id);
      setUser(profile);
      setOnboardingComplete(true);
      complete();
      router.replace('/(tabs)/home');
    } catch (err) {
      console.error('Onboarding completion failed:', err);
    }
  };

  const steps = [
    // Step 1: Welcome + Name
    <Box key="name" width={SCREEN_WIDTH - 32} paddingHorizontal="m">
      <Animated.View entering={FadeInRight.duration(400)}>
        {/* Botanical illustration placeholder */}
        <Box alignItems="center" marginBottom="l">
          <Box
            width={140}
            height={140}
            borderRadius="full"
            alignItems="center"
            justifyContent="center"
            style={{ overflow: 'hidden' }}
          >
            <LinearGradient
              colors={GRADIENTS.headerSubtle}
              style={{
                width: 140,
                height: 140,
                borderRadius: 70,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 72, lineHeight: 84, textAlign: 'center' }}>🌸</Text>
            </LinearGradient>
          </Box>
        </Box>

        <Text variant="h1" color="primary" textAlign="center" marginBottom="s">
          Welcome! 💖
        </Text>
        <Text variant="body" textAlign="center" marginBottom="xl" color="textSecondary">
          Let's personalize your journey. What should we call you?
        </Text>
        <Input
          label="Your Name"
          placeholder="e.g. Sarah"
          value={data.firstName}
          onChangeText={(text) => updateData({ firstName: text })}
          autoFocus
        />
      </Animated.View>
    </Box>,

    // Step 2: Pregnancy Start Date
    <Box key="date" width={SCREEN_WIDTH - 32} paddingHorizontal="m">
      <Animated.View entering={FadeInRight.duration(400)}>
        <Text variant="h2" textAlign="center" marginBottom="xs">
          When did your pregnancy begin? 🗓️
        </Text>
        <Text variant="bodySmall" textAlign="center" marginBottom="m" color="textSecondary">
          Select date on the calendar below. We'll calculate your due date.
        </Text>
        <CalendarPicker
          selectedDate={data.pregnancyStartDate}
          onSelectDate={(date) => updateData({ pregnancyStartDate: date })}
        />
      </Animated.View>
    </Box>,

    // Step 3: Dietary Preferences (multi-hue chips)
    <Box key="diet" width={SCREEN_WIDTH - 32} paddingHorizontal="m">
      <Animated.View entering={FadeInRight.duration(400)}>
        <Text variant="h2" textAlign="center" marginBottom="s">
          Dietary Preferences 🥗
        </Text>
        <Text variant="bodySmall" textAlign="center" marginBottom="l" color="textSecondary">
          Select all that apply. This helps our AI give better nutrition advice.
        </Text>
        <Box flexDirection="row" flexWrap="wrap" gap="s">
          {DIETARY_PREFERENCES.map((pref, index) => {
            const selected = data.dietaryPreferences.includes(pref);
            const colorPair = DIET_COLORS[index % DIET_COLORS.length];
            return (
              <Touchable
                key={pref}
                onPress={() => {
                  const updated = selected
                    ? data.dietaryPreferences.filter((p) => p !== pref)
                    : [...data.dietaryPreferences, pref];
                  updateData({ dietaryPreferences: updated });
                }}
              >
                <Box
                  borderRadius="full"
                  paddingHorizontal="m"
                  paddingVertical="s"
                  borderWidth={selected ? 2 : 1}
                  style={{
                    backgroundColor: selected ? colorPair.border : colorPair.bg,
                    borderColor: colorPair.border,
                  }}
                >
                  <Text
                    variant="bodySmall"
                    fontFamily={selected ? 'Inter_600SemiBold' : 'Inter_400Regular'}
                    style={{
                      color: selected ? '#FFFFFF' : theme.colors.textPrimary,
                    }}
                  >
                    {selected ? `✓ ${pref}` : pref}
                  </Text>
                </Box>
              </Touchable>
            );
          })}
        </Box>
      </Animated.View>
    </Box>,

    // Step 4: Health Conditions (multi-hue chips)
    <Box key="health" width={SCREEN_WIDTH - 32} paddingHorizontal="m">
      <Animated.View entering={FadeInRight.duration(400)}>
        <Text variant="h2" textAlign="center" marginBottom="s">
          Any Health Conditions? 💊
        </Text>
        <Text variant="bodySmall" textAlign="center" marginBottom="l" color="textSecondary">
          This helps us provide safer recommendations.
        </Text>
        <Box flexDirection="row" flexWrap="wrap" gap="s">
          {HEALTH_CONDITIONS.map((condition, index) => {
            const selected = data.healthConditions.includes(condition);
            const colorPair = HEALTH_COLORS[index % HEALTH_COLORS.length];
            return (
              <Touchable
                key={condition}
                onPress={() => {
                  const updated = selected
                    ? data.healthConditions.filter((c) => c !== condition)
                    : [...data.healthConditions, condition];
                  updateData({ healthConditions: updated });
                }}
              >
                <Box
                  borderRadius="full"
                  paddingHorizontal="m"
                  paddingVertical="s"
                  borderWidth={selected ? 2 : 1}
                  style={{
                    backgroundColor: selected ? colorPair.border : colorPair.bg,
                    borderColor: colorPair.border,
                  }}
                >
                  <Text
                    variant="bodySmall"
                    fontFamily={selected ? 'Inter_600SemiBold' : 'Inter_400Regular'}
                    style={{
                      color: selected ? '#FFFFFF' : theme.colors.textPrimary,
                    }}
                  >
                    {selected ? `✓ ${condition}` : condition}
                  </Text>
                </Box>
              </Touchable>
            );
          })}
        </Box>
      </Animated.View>
    </Box>,

    // Step 5: Emergency & Health Pass Info
    <Box key="health_card" width={SCREEN_WIDTH - 32} paddingHorizontal="m">
      <Animated.View entering={FadeInRight.duration(400)}>
        <Text variant="h2" textAlign="center" marginBottom="s">
          Pregnancy Card Info 💳
        </Text>
        <Text variant="bodySmall" textAlign="center" marginBottom="m" color="textSecondary">
          Optional emergency details for your digital health pass.
        </Text>

        <Text variant="label" marginBottom="xs" color="textSecondary">
          Blood Type
        </Text>
        <Box flexDirection="row" flexWrap="wrap" gap="s" marginBottom="m">
          {['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'].map((bt) => {
            const isSelected = data.bloodType === bt;
            return (
              <Touchable key={bt} onPress={() => updateData({ bloodType: bt })}>
                <Box
                  width={56}
                  height={48}
                  borderRadius="m"
                  alignItems="center"
                  justifyContent="center"
                  borderWidth={isSelected ? 2 : 1}
                  style={{
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.inputBackground,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  }}
                >
                  <Text
                    variant="label"
                    fontFamily="Inter_600SemiBold"
                    color={isSelected ? 'textInverse' : 'textPrimary'}
                  >
                    {bt}
                  </Text>
                </Box>
              </Touchable>
            );
          })}
        </Box>

        <Input
          label="Emergency Contact Phone"
          placeholder="e.g. +1 (555) 019-2831"
          value={data.emergencyContact ?? ''}
          onChangeText={(text) => updateData({ emergencyContact: text })}
          keyboardType="phone-pad"
        />

        <Touchable onPress={handleComplete} style={{ marginTop: 12, alignItems: 'center' }}>
          <Text variant="caption" color="textMuted">
            Skip this step ⏭️
          </Text>
        </Touchable>
      </Animated.View>
    </Box>,
  ];

  const isLastStep = currentStep === totalSteps - 1;
  const canProceed =
    (currentStep === 0 && data.firstName.length > 0) ||
    (currentStep === 1 && data.pregnancyStartDate !== null) ||
    currentStep >= 2;

  return (
    <Screen scrollable={false} padded={false} safeBottom={false} hasTabBar={false} backgroundColor="mainBackground">
      {/* Animated Progress Dots */}
      <Box
        flexDirection="row"
        justifyContent="center"
        paddingTop="l"
        paddingBottom="s"
        gap="s"
      >
        {Array.from({ length: totalSteps }).map((_, i) => (
          <Box
            key={i}
            height={6}
            borderRadius="full"
            style={{
              width: i === currentStep ? 28 : 8,
              overflow: 'hidden',
            }}
          >
            {i === currentStep ? (
              <LinearGradient
                colors={GRADIENTS.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1, borderRadius: 9999 }}
              />
            ) : (
              <Box
                flex={1}
                borderRadius="full"
                backgroundColor={i < currentStep ? 'primaryLight' : 'border'}
              />
            )}
          </Box>
        ))}
      </Box>

      {/* Steps List */}
      <Box flex={1}>
        <FlatList
          ref={flatListRef}
          data={steps}
          renderItem={({ item }) => (
            <ScrollView
              style={{ width: SCREEN_WIDTH }}
              contentContainerStyle={{
                flexGrow: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 16,
              }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {item}
            </ScrollView>
          )}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
        />
      </Box>

      {/* Navigation buttons */}
      <Box
        paddingHorizontal="m"
        paddingTop="s"
        paddingBottom="m"
        backgroundColor="mainBackground"
        style={{ paddingBottom: Math.max(insets.bottom + 8, 16) }}
        flexDirection="row"
        gap="m"
      >
        {currentStep > 0 && (
          <Box flex={1}>
            <Button title="Back" onPress={handleBack} variant="ghost" />
          </Box>
        )}
        <Box flex={currentStep > 0 ? 1 : undefined} width={currentStep === 0 ? '100%' : undefined}>
          <Touchable
            onPress={isLastStep ? handleComplete : handleNext}
            disabled={!canProceed}
            activeScale={0.97}
          >
            <Box style={{ overflow: 'hidden', borderRadius: 16, opacity: canProceed ? 1 : 0.5 }}>
              <GradientButton preset="primary" height={56} borderRadius={16}>
                <Text variant="button" color="textInverse">
                  {isLastStep ? "Let's Go! 🎉" : 'Continue'}
                </Text>
              </GradientButton>
            </Box>
          </Touchable>
        </Box>
      </Box>
    </Screen>
  );
}
