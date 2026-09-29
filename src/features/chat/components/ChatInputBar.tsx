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
  onImagePress: () => void;
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
            backgroundColor: theme.colors.surfaceElevated,
            borderColor: theme.colors.border,
            borderRadius: 28,
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowOffset: { width: 0, height: -2 },
            shadowRadius: 8,
            elevation: 3,
          },
        ]}
      >
        {/* Camera attach button */}
        <Pressable
          onPress={onImagePress}
          disabled={disabled}
          style={[styles.iconButton, { opacity: disabled ? 0.4 : 1 }]}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: theme.colors.peachSubtle,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name="camera"
              size={20}
              color={theme.colors.primary}
            />
          </View>
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
  iconButton: {
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    maxHeight: 120,
    paddingHorizontal: 8,
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
