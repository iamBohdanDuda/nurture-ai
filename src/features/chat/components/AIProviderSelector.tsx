import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Box, Text } from '@/theme/restyleComponents';
import { type AIProvider } from '@/types/common';
import { Ionicons } from '@expo/vector-icons';

interface AIProviderSelectorProps {
  selectedProvider: AIProvider;
  selectedModel: string;
  onSelectProvider: (provider: AIProvider, model?: string) => void;
}

const GEMINI_MODEL_ID = process.env.EXPO_PUBLIC_GEMINI_MODEL || 'gemini-3.1-flash-lite';
const GEMINI_DISPLAY_NAME = GEMINI_MODEL_ID
  .split('-')
  .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

export function AIProviderSelector({
  selectedProvider,
  selectedModel,
  onSelectProvider,
}: AIProviderSelectorProps) {
  const isGemini = selectedProvider === 'gemini';

  return (
    <Box
      flexDirection="row"
      backgroundColor="surfaceFrosted"
      borderRadius="full"
      padding="xs"
      alignSelf="flex-start"
      marginTop="xs"
      style={styles.container}
    >
      <TouchableOpacity
        style={[styles.chip, isGemini && styles.activeChip]}
        onPress={() => onSelectProvider('gemini', GEMINI_MODEL_ID)}
        activeOpacity={0.8}
      >
        <Ionicons
          name="sparkles"
          size={13}
          color={isGemini ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)'}
          style={{ marginRight: 4 }}
        />
        <Text
          variant="caption"
          style={[styles.chipText, isGemini ? styles.activeText : styles.inactiveText]}
        >
          {GEMINI_DISPLAY_NAME}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.chip, !isGemini && styles.activeChip]}
        onPress={() => onSelectProvider('openai', 'gpt-4o-mini')}
        activeOpacity={0.8}
      >
        <Ionicons
          name="flash"
          size={13}
          color={!isGemini ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)'}
          style={{ marginRight: 4 }}
        />
        <Text
          variant="caption"
          style={[styles.chipText, !isGemini ? styles.activeText : styles.inactiveText]}
        >
          GPT-4o Mini
        </Text>
      </TouchableOpacity>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  activeChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: '#FFFFFF',
  },
  inactiveText: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
});
