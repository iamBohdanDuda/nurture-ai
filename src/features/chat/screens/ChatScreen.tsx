import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, Modal, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { GiftedChat, type IMessage } from 'react-native-gifted-chat';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@shopify/restyle';
import { LinearGradient } from 'expo-linear-gradient';
import { Box, Text } from '@/theme/restyleComponents';
import { ChatBubble } from '../components/ChatBubble';
import { ChatInputBar } from '../components/ChatInputBar';
import { TypingIndicator } from '../components/TypingIndicator';
import { SuggestedQuestions } from '../components/SuggestedQuestions';
import { MessageLimitBanner } from '../components/MessageLimitBanner';
import { AIProviderSelector } from '../components/AIProviderSelector';
import { useChat } from '../hooks/useChat';
import { type Theme, GRADIENTS } from '@/theme/theme';
import { type ChatMessageUI } from '@/types/common';
import { Ionicons } from '@expo/vector-icons';

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
    toolCallHint: msg.toolCallHint,
  } as any;
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
    selectedProvider,
    selectedModel,
    setSelectedProvider,
    handleSend,
    handleSuggestedQuestion,
    canSendMessage,
    chats,
    activeChatId,
    setActiveChatId,
  } = useChat();

  const [inputText, setInputText] = useState('');
  const [isChatListVisible, setChatListVisible] = useState(false);

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

  // Message limit as percentage for inline progress
  const limitPercent = isPremium ? 100 : Math.min(100, (weeklyMessageCount / weeklyMessageLimit) * 100);

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
        {/* Illustrated character placeholder */}
        <Box
          width={100}
          height={100}
          borderRadius="full"
          alignItems="center"
          justifyContent="center"
          style={{ overflow: 'hidden' }}
        >
          <LinearGradient
            colors={GRADIENTS.headerSubtle}
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 52, lineHeight: 64, textAlign: 'center' }}>🤱</Text>
          </LinearGradient>
        </Box>
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
          I'm your AI pregnancy companion. Ask me anything about nutrition,
          symptoms, baby development, or send a photo of your meal!
        </Text>
      </View>
    );
  }, [isLoadingHistory, theme.colors.primary]);

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Box flex={1} backgroundColor="mainBackground">
        {/* Premium Header with gradient */}
        <Box
          style={{ overflow: 'hidden' }}
        >
        <LinearGradient
          colors={GRADIENTS.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: Math.max(insets.top + 8, 24),
            paddingBottom: 12,
            paddingHorizontal: 16,
          }}
        >
          <Box flexDirection="row" alignItems="center" justifyContent="space-between">
            <Box flexDirection="row" alignItems="center" flex={1}>
              {/* AI Avatar */}
              <Box
                width={42}
                height={42}
                borderRadius="full"
                backgroundColor="surfaceFrosted"
                alignItems="center"
                justifyContent="center"
                marginRight="s"
                style={{
                  shadowColor: '#000',
                  shadowOpacity: 0.1,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 4,
                }}
              >
                <Text style={{ fontSize: 24, lineHeight: 30 }}>🤱</Text>
              </Box>
              <Box flex={1}>
                <Text variant="h3" color="textInverse">NurtureAI</Text>
                <Box flexDirection="row" alignItems="center">
                  <Box
                    width={8}
                    height={8}
                    borderRadius="full"
                    backgroundColor={isStreaming ? 'warning' : 'secondary'}
                    marginRight="xs"
                  />
                  <Text variant="caption" color="textInverse" style={{ opacity: 0.85 }}>
                    {isStreaming ? 'Typing...' : 'Online'}
                  </Text>
                </Box>
              </Box>
            </Box>
            
            <TouchableOpacity onPress={() => setChatListVisible(true)}>
              <Box
                padding="s"
                backgroundColor="surfaceFrosted"
                borderRadius="full"
              >
                <Ionicons name="menu" size={24} color="#FFF" />
              </Box>
            </TouchableOpacity>
          </Box>

          {/* AI Provider Switcher (Gemini 2.5 Pro vs OpenAI) */}
          <AIProviderSelector
            selectedProvider={selectedProvider}
            selectedModel={selectedModel}
            onSelectProvider={setSelectedProvider}
          />

          {/* Inline message limit progress */}
          {!isPremium && (
            <Box marginTop="s">
              <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                marginBottom="xs"
              >
                <Text variant="caption" color="textInverse" style={{ opacity: 0.7 }}>
                  {weeklyMessageCount}/{weeklyMessageLimit} messages this week
                </Text>
              </Box>
              <Box
                width="100%"
                height={4}
                backgroundColor="surfaceFrosted"
                borderRadius="full"
                overflow="hidden"
              >
                <Box
                  height={4}
                  borderRadius="full"
                  backgroundColor="textInverse"
                  width={`${limitPercent}%`}
                  style={{ opacity: 0.6 }}
                />
              </Box>
            </Box>
          )}
        </LinearGradient>
      </Box>

      {/* Message Limit Banner (warning/blocked states only) */}
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
                <LinearGradient
                  colors={GRADIENTS.headerSubtle}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 20 }}>🤱</Text>
                </LinearGradient>
              </View>
            );
          }
          return null;
        }}
      />

      {/* Custom Input Bar */}
      <Box style={{ paddingBottom: Math.max(insets.bottom, 12) + (Platform.OS === 'ios' ? 70 : 80) }}>
        <ChatInputBar
          text={inputText}
          onChangeText={setInputText}
          onSend={onSend}
          onImagePress={onPickImage}
          disabled={!canSendMessage}
          isSending={isSending}
        />
      </Box>

      {/* Chat List Modal */}
      <Modal visible={isChatListVisible} animationType="slide" transparent>
        <Box flex={1} backgroundColor="overlay" justifyContent="flex-end">
          <Box 
            backgroundColor="mainBackground" 
            borderTopLeftRadius="xl" 
            borderTopRightRadius="xl"
            padding="m"
            paddingBottom="2xl"
            style={{ maxHeight: '80%' }}
          >
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="l">
              <Text variant="h2">Previous Chats</Text>
              <TouchableOpacity onPress={() => setChatListVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </Box>

            <TouchableOpacity 
              onPress={() => {
                setActiveChatId(null);
                setChatListVisible(false);
              }}
            >
              <Box 
                flexDirection="row" 
                alignItems="center" 
                padding="m" 
                backgroundColor="accentLight" 
                borderRadius="m"
                marginBottom="m"
              >
                <Ionicons name="add" size={24} color={theme.colors.accent} />
                <Text variant="body" color="accent" marginLeft="s" fontFamily="Inter_600SemiBold">
                  Start New Chat
                </Text>
              </Box>
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              {chats.map(chat => (
                <TouchableOpacity
                  key={chat.id}
                  onPress={() => {
                    setActiveChatId(chat.id);
                    setChatListVisible(false);
                  }}
                >
                  <Box 
                    padding="m" 
                    borderBottomWidth={1} 
                    borderColor="border"
                    backgroundColor={activeChatId === chat.id ? 'surfaceElevated' : 'transparent'}
                  >
                    <Text variant="body" fontFamily={activeChatId === chat.id ? 'Inter_600SemiBold' : 'Inter_400Regular'}>
                      {chat.title}
                    </Text>
                    <Text variant="caption" color="textMuted" marginTop="xs">
                      {new Date(chat.created_at).toLocaleDateString()}
                    </Text>
                  </Box>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Box>
        </Box>
      </Modal>
    </Box>
  </KeyboardAvoidingView>
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
    overflow: 'hidden',
  },
});
