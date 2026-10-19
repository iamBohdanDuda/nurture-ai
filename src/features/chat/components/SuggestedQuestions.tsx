import React from 'react';
import { ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Box, Text } from '@/theme/restyleComponents';
import { Touchable } from '@/components/primitives/Touchable';
import { useTheme } from '@shopify/restyle';
import { type Theme } from '@/theme/theme';

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
  visible: boolean;
}

const SUGGESTIONS = [
  { icon: '🍎', text: "What's safe to eat this week?" },
  { icon: '✨', text: 'How to soothe morning sickness?' },
  { icon: '💊', text: 'Which vitamins should I take today?' },
  { icon: '🧘', text: 'Safe stretches for my trimester' },
  { icon: '🌙', text: 'Tips for peaceful sleep' },
  { icon: '👶', text: "How is my baby growing?" },
];

export function SuggestedQuestions({ onSelect, visible }: SuggestedQuestionsProps) {
  const theme = useTheme<Theme>();

  if (!visible) return null;

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(150)}>
      <Box paddingVertical="s">
        <Box paddingHorizontal="m" marginBottom="xs">
          <Text variant="caption" color="textMuted" style={{ letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Suggested questions
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
              activeScale={0.96}
            >
              <Box
                borderRadius="full"
                flexDirection="row"
                alignItems="center"
                backgroundColor="surfaceElevated"
                paddingHorizontal="m"
                paddingVertical="s"
                borderWidth={1}
                borderColor="border"
                style={{
                  shadowColor: theme.colors.shadow,
                  shadowOpacity: 0.03,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 6,
                  elevation: 1,
                }}
              >
                <Text style={{ fontSize: 14, marginRight: 6 }}>
                  {suggestion.icon}
                </Text>
                <Text variant="caption" color="textPrimary" fontFamily="Inter_500Medium">
                  {suggestion.text}
                </Text>
              </Box>
            </Touchable>
          ))}
        </ScrollView>
      </Box>
    </Animated.View>
  );
}

