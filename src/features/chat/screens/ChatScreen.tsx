import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { GiftedChat, type IMessage } from 'react-native-gifted-chat';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@shopify/restyle';
import { Box, Text } from '@/theme/restyleComponents';
import { ChatBubble } from '../components/ChatBubble';
import { ChatInputBar } from '../components/ChatInputBar';
import { TypingIndicator } from '../components/TypingIndicator';
import { SuggestedQuestions } from '../components/SuggestedQuestions';
import { MessageLimitBanner } from '../components/MessageLimitBanner';
import { useChat } from '../hooks/useChat';
import { type Theme } from '@/theme/theme';
import { type ChatMessageUI } from '@/types/common';

const CURRENT_USER_ID = 'current-user';

/**
 * Convert our ChatMessageUI to GiftedChat IMessage format.
 */
function toGiftedMessage(msg: ChatMessageUI): IMessage {
  return {
    _id: msg._id,
    text: msg.text,
    createdAt: msg.createdAt,
    user: {
      _id: msg.user._id,
      name: msg.user.name,
      avatar: msg.user.avatar,
    },
    image: msg.image,
    pending: msg.pending,
  };
}

export function ChatScreen() {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const {
    messages,
    isStreaming,
    isLoadingHistory,
    weeklyMessageCount,
    weeklyMessageLimit,
    isPremium,
    showSuggestions,
    isSending,
    handleSend,
    handleSuggestedQuestion,
    canSendMessage,
  } = useChat();

  const [inputText, setInputText] = useState('');

  const giftedMessages = messages.map(toGiftedMessage);

  const onSend = useCallback(() => {
    if (!inputText.trim()) return;

    const msg: ChatMessageUI = {
      _id: `input-${Date.now()}`,
      text: inputText.trim(),
      createdAt: new Date(),
      user: { _id: CURRENT_USER_ID },
    };

    handleSend([msg]);
    setInputText('');
  }, [inputText, handleSend]);

  const onPickImage = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission needed',
          'Please allow access to your photos to share meal images.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        const msg: ChatMessageUI = {
          _id: `img-${Date.now()}`,
          text: inputText.trim() || 'What can you tell me about this meal?',
          createdAt: new Date(),
          user: { _id: CURRENT_USER_ID },
          image: result.assets[0].uri,
        };

        handleSend([msg]);
        setInputText('');
      }
    } catch (err) {
      console.error('Image picker error:', err);
    }
  }, [inputText, handleSend]);

  const renderFooter = useCallback(() => {
    return <TypingIndicator isVisible={isStreaming} />;
  }, [isStreaming]);

  const renderEmpty = useCallback(() => {
    if (isLoadingHistory) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodySmall" marginTop="m" color="textMuted">
            Loading chat history...
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={{ fontSize: 56, lineHeight: 68, textAlign: 'center' }}>🤱</Text>
        <Text variant="h2" marginTop="m" textAlign="center">
          Hello, Mama!
        </Text>
        <Text
          variant="bodySmall"
          textAlign="center"
          marginTop="s"
          color="textSecondary"
          paddingHorizontal="l"
        >
          I'm your AI pregnancy assistant. Ask me anything about nutrition,
          symptoms, baby development, or send a photo of your meal!
        </Text>
      </View>
    );
  }, [isLoadingHistory, theme.colors.primary]);

  return (
    <Box flex={1} backgroundColor="mainBackground">
      {/* Header */}
      <Box
        paddingTop="m"
        paddingBottom="s"
        paddingHorizontal="m"
        backgroundColor="primaryBackground"
        borderBottomWidth={1}
        borderColor="border"
        style={{ paddingTop: Math.max(insets.top + 8, 24) }}
      >
        <Box flexDirection="row" alignItems="center">
          <Text style={{ fontSize: 28, lineHeight: 34, marginRight: 8 }}>🤱</Text>
          <Box flex={1}>
            <Text variant="h3">NurtureAI</Text>
            <Text variant="caption" color="textMuted">
              {isStreaming ? 'Typing...' : 'Your pregnancy assistant'}
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Message Limit Banner */}
      <MessageLimitBanner
        messageCount={weeklyMessageCount}
        messageLimit={weeklyMessageLimit}
        isPremium={isPremium}
      />

      {/* Suggested Questions (shown when no messages) */}
      <SuggestedQuestions
        onSelect={handleSuggestedQuestion}
        visible={showSuggestions}
      />

      {/* Chat Messages */}
      <GiftedChat
        messages={giftedMessages}
        user={{ _id: CURRENT_USER_ID }}
        renderBubble={(props) => <ChatBubble {...props} />}
        renderFooter={renderFooter}
        renderChatEmpty={renderEmpty}
        renderInputToolbar={() => null}
        isInverted={true}
        listProps={{
          contentContainerStyle: {
            flexGrow: 1,
            justifyContent: messages.length === 0 ? 'center' : undefined,
          },
        }}
        minInputToolbarHeight={0}
        renderAvatar={(props) => {
          if (props.currentMessage?.user._id === 'nurtureai') {
            return (
              <View style={styles.avatarContainer}>
                <Text style={{ fontSize: 24 }}>🤱</Text>
              </View>
            );
          }
          return null;
        }}
      />

      {/* Custom Input Bar */}
      <Box style={{ paddingBottom: insets.bottom }}>
        <ChatInputBar
          text={inputText}
          onChangeText={setInputText}
          onSend={onSend}
          onImagePress={onPickImage}
          disabled={!canSendMessage}
          isSending={isSending}
        />
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    transform: [{ scaleY: -1 }], // GiftedChat inverts the list
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
});
