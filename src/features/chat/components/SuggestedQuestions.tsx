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
  { emoji: '🍎', text: "What's safe to eat this week?" },
  { emoji: '🤢', text: 'How to manage morning sickness?' },
  { emoji: '💊', text: 'Which vitamins should I take?' },
  { emoji: '🏋️', text: 'Safe exercises for my trimester?' },
  { emoji: '😴', text: 'Tips for better sleep?' },
  { emoji: '📊', text: "How is my baby developing?" },
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
                backgroundColor="primaryLight"
                borderRadius="full"
                paddingHorizontal="m"
                paddingVertical="s"
                flexDirection="row"
                alignItems="center"
                borderWidth={1}
                borderColor="primary"
              >
                <Text style={{ fontSize: 16, lineHeight: 20, marginRight: 6 }}>
                  {suggestion.emoji}
                </Text>
                <Text variant="bodySmall" color="primary">
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
