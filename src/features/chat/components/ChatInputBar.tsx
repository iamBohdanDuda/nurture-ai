import React from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '@shopify/restyle';
import { Ionicons } from '@expo/vector-icons';
import { type Theme } from '@/theme/theme';

interface ChatInputBarProps {
  text: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onImagePress: () => void;
  disabled: boolean;
  isSending: boolean;
}

/**
 * Custom chat input bar with image attachment and send button.
 * Replaces default Gifted Chat input for themed styling.
 */
export function ChatInputBar({
  text,
  onChangeText,
  onSend,
  onImagePress,
  disabled,
  isSending,
}: ChatInputBarProps) {
  const theme = useTheme<Theme>();
  const canSend = text.trim().length > 0 && !isSending && !disabled;

  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.container}>
      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: theme.colors.inputBackground,
            borderColor: theme.colors.border,
            borderRadius: theme.borderRadii.xl,
          },
        ]}
      >
        {/* Image attach button */}
        <Pressable
          onPress={onImagePress}
          disabled={disabled}
          style={[styles.iconButton, { opacity: disabled ? 0.4 : 1 }]}
        >
          <Ionicons
            name="image-outline"
            size={24}
            color={theme.colors.textMuted}
          />
        </Pressable>

        {/* Text input */}
        <TextInput
          value={text}
          onChangeText={onChangeText}
          placeholder={
            disabled
              ? 'Message limit reached'
              : 'Ask me anything...'
          }
          placeholderTextColor={theme.colors.inputPlaceholder}
          editable={!disabled}
          multiline
          maxLength={2000}
          style={[
            styles.textInput,
            {
              color: theme.colors.textPrimary,
              fontFamily: 'Inter_400Regular',
            },
          ]}
        />

        {/* Send button */}
        <Pressable
          onPress={onSend}
          disabled={!canSend}
          style={[
            styles.sendButton,
            {
              backgroundColor: canSend
                ? theme.colors.primary
                : theme.colors.border,
              borderRadius: 20,
            },
          ]}
        >
          <Ionicons
            name="arrow-up"
            size={20}
            color={canSend ? '#FFFFFF' : theme.colors.textMuted}
          />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minHeight: 48,
  },
  iconButton: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    maxHeight: 120,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  sendButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
});
