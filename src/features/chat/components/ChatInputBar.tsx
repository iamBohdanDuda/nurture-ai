import React from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@shopify/restyle';
import { Ionicons } from '@expo/vector-icons';
import { type Theme, GRADIENTS } from '@/theme/theme';

interface ChatInputBarProps {
  text: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  disabled: boolean;
  isSending: boolean;
}

/**
 * Premium chat input bar with gradient send button.
 */
export function ChatInputBar({
  text,
  onChangeText,
  onSend,
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
            backgroundColor: theme.colors.surfaceElevated,
            borderColor: theme.colors.border,
            borderWidth: 1,
            borderRadius: 28,
            shadowColor: theme.colors.shadow,
            shadowOpacity: 0.05,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 10,
            elevation: 2,
          },
        ]}
      >
        {/* Text only: the chat model never receives images; meal photos go through the Meal Scanner */}
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

        {/* Gradient send button */}
        <Pressable
          onPress={onSend}
          disabled={!canSend}
          style={styles.sendButtonContainer}
        >
          <View style={{ borderRadius: 20, overflow: 'hidden' }}>
            {canSend ? (
              <LinearGradient
                colors={GRADIENTS.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendButton}
              >
                <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
              </LinearGradient>
            ) : (
              <View
                style={[
                  styles.sendButton,
                  { backgroundColor: theme.colors.border },
                ]}
              >
                <Ionicons
                  name="arrow-up"
                  size={20}
                  color={theme.colors.textMuted}
                />
              </View>
            )}
          </View>
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
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 4,
    minHeight: 52,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    maxHeight: 120,
    paddingLeft: 14,
    paddingRight: 8,
    paddingTop: 8,
    paddingBottom: 8,
    textAlignVertical: 'center',
    alignSelf: 'center',
  },
  sendButtonContainer: {
    marginLeft: 4,
    alignSelf: 'center',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
