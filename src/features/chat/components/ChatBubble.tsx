import React from 'react';
import { View, StyleSheet, Text as RNText } from 'react-native';
import { Bubble, type BubbleProps, type IMessage } from 'react-native-gifted-chat';
import { useTheme } from '@shopify/restyle';
import { type Theme } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { MarkdownMessage } from './MarkdownMessage';

/**
 * Custom chat bubble that renders blush pink for user and gray for AI with Markdown support
 * and a minimal tool call hint pill above AI responses.
 */
export function ChatBubble(props: BubbleProps<IMessage>) {
  const theme = useTheme<Theme>();
  const toolHint = (props.currentMessage as any)?.toolCallHint;
  const isAI = props.currentMessage?.user?._id !== 'current-user';

  return (
    <View style={{ flex: 1 }}>
      {isAI && !!toolHint && (
        <View style={styles.hintPill}>
          <Ionicons name="build-outline" size={11} color={theme.colors.textMuted} style={{ marginRight: 4 }} />
          <RNText style={[styles.hintText, { color: theme.colors.textMuted }]}>
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
            borderRadius: 16,
            borderBottomLeftRadius: 4,
            paddingVertical: 2,
            paddingHorizontal: 2,
            marginBottom: 4,
            maxWidth: '85%',
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 1,
          },
          right: {
            backgroundColor: theme.colors.chatBubbleUser,
            borderRadius: 16,
            borderBottomRightRadius: 4,
            paddingVertical: 2,
            paddingHorizontal: 2,
            marginBottom: 4,
            maxWidth: '85%',
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
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
    fontWeight: '500',
  },
});
