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
  const isGroq = selectedProvider === 'groq';
  const isOpenAI = selectedProvider === 'openai';

  // OpenAI is deactivated by user request, but code is preserved intact
  const isOpenAIDeactivated = true;

  return (
    <Box
      flexDirection="row"
      borderRadius="full"
      alignSelf="flex-start"
      marginTop="xs"
      style={styles.container}
    >
      {/* 1. Google Gemini */}
      <TouchableOpacity
        style={[styles.chip, isGemini ? styles.activeChip : styles.inactiveChip]}
        onPress={() => onSelectProvider('gemini', GEMINI_MODEL_ID)}
        activeOpacity={0.8}
      >
        <Ionicons
          name="sparkles"
          size={13}
          color={isGemini ? '#FFFFFF' : '#64748B'}
          style={{ marginRight: 5 }}
        />
        <Text
          variant="caption"
          style={[styles.chipText, isGemini ? styles.activeText : styles.inactiveText]}
        >
          {GEMINI_DISPLAY_NAME}
        </Text>
      </TouchableOpacity>

      {/* 2. Groq: openai/gpt-oss-120b */}
      <TouchableOpacity
        style={[styles.chip, isGroq ? styles.activeChip : styles.inactiveChip]}
        onPress={() => onSelectProvider('groq', 'openai/gpt-oss-120b')}
        activeOpacity={0.8}
      >
        <Ionicons
          name="flash"
          size={13}
          color={isGroq ? '#FFFFFF' : '#64748B'}
          style={{ marginRight: 5 }}
        />
        <Text
          variant="caption"
          style={[styles.chipText, isGroq ? styles.activeText : styles.inactiveText]}
        >
          GPT-OSS 120B
        </Text>
      </TouchableOpacity>

      {/* 3. OpenAI (Preserved in code, deactivated in UI) */}
      <TouchableOpacity
        style={[
          styles.chip,
          isOpenAI ? styles.activeChip : styles.inactiveChip,
          isOpenAIDeactivated && styles.deactivatedChip,
        ]}
        onPress={() => {
          // Deactivated: preserved for future reactivation without deleting code
          if (!isOpenAIDeactivated) {
            onSelectProvider('openai', 'gpt-4o-mini');
          }
        }}
        disabled={isOpenAIDeactivated}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isOpenAIDeactivated ? 'lock-closed-outline' : 'logo-electron'}
          size={12}
          color="#94A3B8"
          style={{ marginRight: 4 }}
        />
        <Text
          variant="caption"
          style={[styles.chipText, styles.deactivatedText]}
        >
          GPT-4o Mini
        </Text>
      </TouchableOpacity>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeChip: {
    backgroundColor: '#ED64A6',
    shadowColor: '#ED64A6',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  inactiveChip: {
    backgroundColor: 'transparent',
  },
  deactivatedChip: {
    opacity: 0.45,
    backgroundColor: 'transparent',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  activeText: {
    color: '#FFFFFF',
  },
  inactiveText: {
    color: '#475569',
  },
  deactivatedText: {
    color: '#94A3B8',
  },
});
