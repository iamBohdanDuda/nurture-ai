import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@shopify/restyle';
import { Screen } from '@/components/layout/Screen';
import { Box, Text } from '@/theme/restyleComponents';
import { Touchable } from '@/components/primitives/Touchable';
import { useTrackingStore } from '@/stores/trackingStore';
import { useAuthStore } from '@/stores/authStore';
import { type Theme } from '@/theme/theme';

import { TrackingSummaryHeader } from '../components/TrackingSummaryHeader';
import { WeeklyAveragesWidget } from '../components/WeeklyAveragesWidget';
import { WaterTracker } from '../components/WaterTracker';
import { VitaminChecklist } from '../components/VitaminChecklist';
import { SymptomLogger } from '../components/SymptomLogger';
import { WeightLogger } from '../components/WeightLogger';
import { MealScanner } from '../components/MealScanner';
import { KickCounter } from '../components/KickCounter';

const TABS = [
  { id: 'all', label: 'All 📋' },
  { id: 'symptoms', label: 'Symptoms 🤒' },
  { id: 'meals', label: 'Nutrition 🥗' },
  { id: 'water', label: 'Vitamins & Water 💧' },
  { id: 'kicks', label: 'Kicks & Weight 🦶' },
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
    <Screen scrollable safeTop backgroundColor="mainBackground">
      <Box paddingBottom="l">
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <Text variant="h2" marginBottom="xs">Health & Symptoms Hub 📊</Text>
          <Text variant="bodySmall" color="textSecondary" marginBottom="m">
            Track daily metrics to power your AI health advice, {user?.first_name ?? 'Mama'} 🌟
          </Text>
        </Animated.View>

        {/* Daily Summary Rings */}
        <Animated.View entering={FadeInDown.duration(400).delay(150)}>
          <TrackingSummaryHeader />
        </Animated.View>

        {/* 7-Day Averages Widget */}
        <Animated.View entering={FadeInDown.duration(400).delay(180)}>
          <WeeklyAveragesWidget />
        </Animated.View>

        {/* Filter Tabs */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
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
                      backgroundColor={isSelected ? 'primary' : 'inputBackground'}
                      borderRadius="full"
                    >
                      <Text
                        variant="caption"
                        fontFamily={isSelected ? 'Inter_700Bold' : 'Inter_400Regular'}
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
        {(selectedTab === 'all' || selectedTab === 'symptoms') && (
          <Animated.View entering={FadeInDown.duration(400).delay(250)}>
            <SymptomLogger />
          </Animated.View>
        )}

        {(selectedTab === 'all' || selectedTab === 'meals') && (
          <Animated.View entering={FadeInDown.duration(400).delay(300)}>
            <MealScanner />
          </Animated.View>
        )}

        {(selectedTab === 'all' || selectedTab === 'water') && (
          <>
            <Animated.View entering={FadeInDown.duration(400).delay(350)}>
              <WaterTracker />
            </Animated.View>
            <Animated.View entering={FadeInDown.duration(400).delay(400)}>
              <VitaminChecklist />
            </Animated.View>
          </>
        )}

        {(selectedTab === 'all' || selectedTab === 'kicks') && (
          <>
            <Animated.View entering={FadeInDown.duration(400).delay(450)}>
              <KickCounter />
            </Animated.View>
            <Animated.View entering={FadeInDown.duration(400).delay(500)}>
              <WeightLogger />
            </Animated.View>
          </>
        )}

        <Box height={40} />
      </Box>
    </Screen>
  );
}
