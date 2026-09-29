import React from 'react';
import { ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Box, Text } from '@/theme/restyleComponents';
import { Touchable } from '@/components/primitives/Touchable';
import { useTheme } from '@shopify/restyle';
import { type Theme } from '@/theme/theme';

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
  visible: boolean;
}

const SUGGESTIONS = [
  { emoji: '🍎', text: "What's safe to eat this week?", gradient: ['#FED7E2', '#FBB6CE'] },
  { emoji: '🤢', text: 'How to manage morning sickness?', gradient: ['#C6F6D5', '#9AE6B4'] },
  { emoji: '💊', text: 'Which vitamins should I take?', gradient: ['#E9D8FD', '#D6BCFA'] },
  { emoji: '🏋️', text: 'Safe exercises for my trimester?', gradient: ['#FFECD2', '#FFD8A8'] },
  { emoji: '😴', text: 'Tips for better sleep?', gradient: ['#E0F7FA', '#B2EBF2'] },
  { emoji: '📊', text: "How is my baby developing?", gradient: ['#FFF8E1', '#FFECB3'] },
];

export function SuggestedQuestions({ onSelect, visible }: SuggestedQuestionsProps) {
  const theme = useTheme<Theme>();

  if (!visible) return null;

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(200)}>
      <Box paddingVertical="s">
        <Box paddingHorizontal="m">
          <Text variant="label" marginBottom="s" color="textSecondary">
            Ask me anything 👇
          </Text>
        </Box>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {SUGGESTIONS.map((suggestion, index) => (
            <Touchable
              key={index}
              onPress={() => onSelect(suggestion.text)}
              activeScale={0.95}
            >
              <Box
                borderRadius="full"
                flexDirection="row"
                alignItems="center"
                style={{ overflow: 'hidden' }}
              >
                <LinearGradient
                  colors={suggestion.gradient as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 9999,
                  }}
                >
                  <Text style={{ fontSize: 16, lineHeight: 20, marginRight: 6 }}>
                    {suggestion.emoji}
                  </Text>
                  <Text variant="bodySmall" color="textPrimary" fontFamily="Inter_500Medium">
                    {suggestion.text}
                  </Text>
                </LinearGradient>
              </Box>
            </Touchable>
          ))}
        </ScrollView>
      </Box>
    </Animated.View>
  );
}
