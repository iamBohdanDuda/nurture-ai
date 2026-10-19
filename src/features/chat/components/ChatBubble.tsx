import React from 'react';
import { View, StyleSheet, Text as RNText } from 'react-native';
import { Bubble, type BubbleProps, type IMessage } from 'react-native-gifted-chat';
import { useTheme } from '@shopify/restyle';
import { type Theme } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { MarkdownMessage } from './MarkdownMessage';

/**
 * Custom chat bubble that renders blush pink for user and gray/white for AI with Markdown support
 * and a minimal tool call hint pill above AI responses.
 */
export function ChatBubble(props: BubbleProps<IMessage>) {
  const theme = useTheme<Theme>();
  const toolHint = (props.currentMessage as any)?.toolCallHint;
  const isAI = props.currentMessage?.user?._id !== 'current-user';
  const isMemoryHint = toolHint?.toLowerCase().includes('memory') || toolHint?.toLowerCase().includes('notes');

  return (
    <View
      style={{ flexShrink: 1, maxWidth: '100%', alignItems: isAI ? 'flex-start' : 'flex-end' }}
    >
      {isAI && !!toolHint && (
        <View
          style={[
            styles.hintPill,
            isMemoryHint && {
              backgroundColor: theme.colors.primaryLight || '#FED7E2',
              borderColor: 'rgba(213, 63, 140, 0.2)',
              borderWidth: 1,
            },
          ]}
        >
          <Ionicons
            name={isMemoryHint ? 'sparkles' : 'build-outline'}
            size={11}
            color={isMemoryHint ? (theme.colors.primaryDark || '#D53F8C') : theme.colors.textMuted}
            style={{ marginRight: 4 }}
          />
          <RNText
            style={[
              styles.hintText,
              { color: isMemoryHint ? (theme.colors.primaryDark || '#D53F8C') : theme.colors.textMuted },
            ]}
          >
            {toolHint}
          </RNText>
        </View>
      )}
      <Bubble
        {...props}
        renderMessageText={(messageProps) => (
          <MarkdownMessage
            text={messageProps.currentMessage?.text || ''}
            isUser={messageProps.currentMessage?.user?._id === 'current-user'}
          />
        )}
        wrapperStyle={{
          left: {
            backgroundColor: theme.colors.chatBubbleAI,
            borderRadius: 20,
            borderBottomLeftRadius: 6,
            paddingVertical: 4,
            paddingHorizontal: 4,
            marginBottom: 6,
            maxWidth: '100%',
            borderWidth: 1,
            borderColor: theme.colors.border,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04,
            shadowRadius: 6,
            elevation: 1,
          },
          right: {
            backgroundColor: theme.colors.chatBubbleUser,
            borderRadius: 20,
            borderBottomRightRadius: 6,
            paddingVertical: 4,
            paddingHorizontal: 4,
            marginBottom: 6,
            maxWidth: '100%',
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04,
            shadowRadius: 6,
            elevation: 1,
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 4,
    marginLeft: 6,
  },
  hintText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    fontWeight: '600',
  },
});
