import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@shopify/restyle';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/layout/Screen';
import { Box, Text } from '@/theme/restyleComponents';
import { Touchable } from '@/components/primitives/Touchable';
import { useTrackingStore } from '@/stores/trackingStore';
import { useAuthStore } from '@/stores/authStore';
import { type Theme, GRADIENTS } from '@/theme/theme';

import { TrackingSummaryHeader } from '../components/TrackingSummaryHeader';
import { WeeklyAveragesWidget } from '../components/WeeklyAveragesWidget';
import { WaterTracker } from '../components/WaterTracker';
import { VitaminChecklist } from '../components/VitaminChecklist';
import { SymptomLogger } from '../components/SymptomLogger';
import { WeightLogger } from '../components/WeightLogger';
import { MealScanner } from '../components/MealScanner';
import { KickCounter } from '../components/KickCounter';

const TABS = [
  { id: 'all', label: 'All', icon: '📋' },
  { id: 'symptoms', label: 'Symptoms', icon: '🤒' },
  { id: 'meals', label: 'Nutrition', icon: '🥗' },
  { id: 'kicks', label: 'Kicks & Weight', icon: '🦶' },
];

export function TrackScreen() {
  const theme = useTheme<Theme>();
  const user = useAuthStore((s) => s.user);
  const { checkAndResetIfNewDay } = useTrackingStore();
  const params = useLocalSearchParams<{ tab?: string }>();
  const [selectedTab, setSelectedTab] = useState(params.tab || 'all');

  useEffect(() => {
    if (params.tab) {
      setSelectedTab(params.tab);
    }
  }, [params.tab]);

  useEffect(() => {
    checkAndResetIfNewDay();
  }, [checkAndResetIfNewDay]);

  return (
    <Screen scrollable safeTop padded={false} backgroundColor="mainBackground">
      <Box paddingBottom="l">
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <Box paddingHorizontal="m" marginBottom="m">
            <Text variant="h2" marginBottom="xs">Health & Wellness Hub</Text>
            {/* Gradient accent line */}
            <Box width={60} height={4} borderRadius="full" overflow="hidden" marginBottom="s">
              <LinearGradient
                colors={GRADIENTS.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              />
            </Box>
            <Text variant="bodySmall" color="textSecondary">
              Track daily metrics to power your AI health advice, {user?.first_name ?? 'Mama'} 🌟
            </Text>
          </Box>
        </Animated.View>

        {/* Daily Summary Rings */}
        <Animated.View entering={FadeInUp.duration(400).delay(150)}>
          <Box paddingHorizontal="m">
            <TrackingSummaryHeader />
          </Box>
        </Animated.View>

        {/* 7-Day Averages Widget */}
        <Animated.View entering={FadeInUp.duration(400).delay(180)}>
          <Box paddingHorizontal="m">
            <WeeklyAveragesWidget />
          </Box>
        </Animated.View>

        {/* Top-Level Tracking */}
        <Animated.View entering={FadeInUp.duration(400).delay(190)}>
          <Box paddingHorizontal="m">
            <WaterTracker />
          </Box>
        </Animated.View>
        <Animated.View entering={FadeInUp.duration(400).delay(195)}>
          <Box paddingHorizontal="m">
            <VitaminChecklist />
          </Box>
        </Animated.View>

        {/* Filter Tabs */}
        <Animated.View entering={FadeInUp.duration(400).delay(200)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingRight: 32 }}
            style={{ marginBottom: 16 }}
          >
            <Box flexDirection="row" gap="xs">
              {TABS.map((tab) => {
                const isSelected = selectedTab === tab.id;
                return (
                  <Touchable key={tab.id} onPress={() => setSelectedTab(tab.id)}>
                    <Box
                      paddingVertical="s"
                      paddingHorizontal="m"
                      borderRadius="full"
                      style={{ overflow: 'hidden' }}
                    >
                      {isSelected ? (
                        <LinearGradient
                          colors={GRADIENTS.primary}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            borderRadius: 9999,
                          }}
                        />
                      ) : (
                        <Box
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: theme.colors.inputBackground,
                            borderRadius: 9999,
                          }}
                        />
                      )}
                      <Text
                        variant="caption"
                        fontFamily={isSelected ? 'Inter_700Bold' : 'Inter_500Medium'}
                        color={isSelected ? 'textInverse' : 'textSecondary'}
                      >
                        {tab.label}
                      </Text>
                    </Box>
                  </Touchable>
                );
              })}
            </Box>
          </ScrollView>
        </Animated.View>

        {/* Trackers List based on Active Tab */}
        <Box paddingHorizontal="m">
          {(selectedTab === 'all' || selectedTab === 'symptoms') && (
            <Animated.View entering={FadeInUp.duration(400).delay(250)}>
              <SymptomLogger />
            </Animated.View>
          )}

          {(selectedTab === 'all' || selectedTab === 'meals') && (
            <Animated.View entering={FadeInUp.duration(400).delay(300)}>
              <MealScanner />
            </Animated.View>
          )}

          {(selectedTab === 'all' || selectedTab === 'kicks') && (
            <>
              <Animated.View entering={FadeInUp.duration(400).delay(450)}>
                <KickCounter />
              </Animated.View>
              <Animated.View entering={FadeInUp.duration(400).delay(500)}>
                <WeightLogger />
              </Animated.View>
            </>
          )}
        </Box>

        <Box height={40} />
      </Box>
    </Screen>
  );
}
