import React from 'react';
import { Bubble, type BubbleProps, type IMessage } from 'react-native-gifted-chat';
import { useTheme } from '@shopify/restyle';
import { type Theme } from '@/theme/theme';

/**
 * Custom chat bubble that renders blush pink for user and gray for AI.
 * Used as `renderBubble` prop in GiftedChat.
 */
export function ChatBubble(props: BubbleProps<IMessage>) {
  const theme = useTheme<Theme>();

  return (
    <Bubble
      {...props}
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
      textStyle={{
        left: {
          color: theme.colors.chatBubbleAIText,
          fontFamily: 'Inter_400Regular',
          fontSize: 15,
          lineHeight: 22,
        },
        right: {
          color: theme.colors.chatBubbleUserText,
          fontFamily: 'Inter_400Regular',
          fontSize: 15,
          lineHeight: 22,
        },
      }}
    />
  );
}
