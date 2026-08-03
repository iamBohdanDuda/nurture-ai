import React, { useRef } from 'react';
import { FlatList, Dimensions, ScrollView } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@shopify/restyle';
import { Screen } from '@/components/layout/Screen';
import { Box, Text } from '@/theme/restyleComponents';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CalendarPicker } from '@/components/ui/CalendarPicker';
import { Touchable } from '@/components/primitives/Touchable';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/features/auth/services/authService';
import { DIETARY_PREFERENCES, HEALTH_CONDITIONS } from '@/utils/pregnancy';
import { type Theme } from '@/theme/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
        <Text variant="h1" color="primary" textAlign="center" marginBottom="s">
          Welcome! 👋
        </Text>
        <Text variant="body" textAlign="center" marginBottom="xl" color="textSecondary">
          Let's personalize your experience. What should we call you?
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

    // Step 2: Pregnancy Start Date (Interactive Calendar Picker)
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

    // Step 3: Dietary Preferences
    <Box key="diet" width={SCREEN_WIDTH - 32} paddingHorizontal="m">
      <Animated.View entering={FadeInRight.duration(400)}>
        <Text variant="h2" textAlign="center" marginBottom="s">
          Dietary Preferences 🥗
        </Text>
        <Text variant="bodySmall" textAlign="center" marginBottom="l" color="textSecondary">
          Select all that apply. This helps our AI give better nutrition advice.
        </Text>
        <Box flexDirection="row" flexWrap="wrap" gap="s">
          {DIETARY_PREFERENCES.map((pref) => {
            const selected = data.dietaryPreferences.includes(pref);
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
                  backgroundColor={selected ? 'primaryLight' : 'inputBackground'}
                  borderRadius="full"
                  paddingHorizontal="m"
                  paddingVertical="s"
                  borderWidth={selected ? 1.5 : 0}
                  borderColor={selected ? 'primary' : undefined}
                >
                  <Text
                    variant="bodySmall"
                    color={selected ? 'primary' : 'textSecondary'}
                  >
                    {pref}
                  </Text>
                </Box>
              </Touchable>
            );
          })}
        </Box>
      </Animated.View>
    </Box>,

    // Step 4: Health Conditions
    <Box key="health" width={SCREEN_WIDTH - 32} paddingHorizontal="m">
      <Animated.View entering={FadeInRight.duration(400)}>
        <Text variant="h2" textAlign="center" marginBottom="s">
          Any Health Conditions? 💊
        </Text>
        <Text variant="bodySmall" textAlign="center" marginBottom="l" color="textSecondary">
          This helps us provide safer recommendations.
        </Text>
        <Box flexDirection="row" flexWrap="wrap" gap="s">
          {HEALTH_CONDITIONS.map((condition) => {
            const selected = data.healthConditions.includes(condition);
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
                  backgroundColor={selected ? 'secondaryLight' : 'inputBackground'}
                  borderRadius="full"
                  paddingHorizontal="m"
                  paddingVertical="s"
                  borderWidth={selected ? 1.5 : 0}
                  borderColor={selected ? 'secondary' : undefined}
                >
                  <Text
                    variant="bodySmall"
                    color={selected ? 'secondary' : 'textSecondary'}
                  >
                    {condition}
                  </Text>
                </Box>
              </Touchable>
            );
          })}
        </Box>
      </Animated.View>
    </Box>,

    // Step 5: Emergency & Health Pass Info (Optional)
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
        <Box flexDirection="row" flexWrap="wrap" gap="xs" marginBottom="m">
          {['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'].map((bt) => {
            const isSelected = data.bloodType === bt;
            return (
              <Touchable key={bt} onPress={() => updateData({ bloodType: bt })}>
                <Box
                  backgroundColor={isSelected ? 'primary' : 'inputBackground'}
                  borderRadius="s"
                  paddingHorizontal="m"
                  paddingVertical="xs"
                >
                  <Text variant="caption" color={isSelected ? 'textInverse' : 'textPrimary'}>
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
    <Screen scrollable={false} padded={false} safeBottom={false} backgroundColor="mainBackground">
      {/* Progress dots */}
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
            width={i === currentStep ? 24 : 8}
            height={8}
            borderRadius="full"
            backgroundColor={i === currentStep ? 'primary' : 'border'}
          />
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

      {/* Navigation buttons fixed at bottom with safe area insets */}
      <Box
        paddingHorizontal="m"
        paddingTop="s"
        paddingBottom="m"
        backgroundColor="mainBackground"
        borderTopWidth={1}
        borderColor="border"
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
          <Button
            title={isLastStep ? "Let's Go! 🎉" : 'Continue'}
            onPress={isLastStep ? handleComplete : handleNext}
            disabled={!canProceed}
            variant="primary"
            size="lg"
          />
        </Box>
      </Box>
    </Screen>
  );
}
