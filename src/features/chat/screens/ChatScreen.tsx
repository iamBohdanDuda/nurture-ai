import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, Modal, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { GiftedChat, Message, type IMessage } from 'react-native-gifted-chat';
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
import { UserMemoryModal } from '../components/UserMemoryModal';
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
    deleteChat,
    userMemory,
    updateUserMemory,
    isUpdatingMemory,
  } = useChat();

  const [inputText, setInputText] = useState('');
  const [isChatListVisible, setChatListVisible] = useState(false);
  const [isMemoryModalVisible, setMemoryModalVisible] = useState(false);

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
        {/* Soft glowing ambient circle */}
        <Box
          width={90}
          height={90}
          borderRadius="full"
          backgroundColor="primaryLight"
          alignItems="center"
          justifyContent="center"
          marginBottom="m"
          borderWidth={1}
          borderColor="border"
          style={{
            shadowColor: theme.colors.shadow,
            shadowOpacity: 0.06,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 12,
          }}
        >
          <Ionicons name="heart" size={40} color={theme.colors.primary} />
        </Box>
        <Text variant="h2" textAlign="center" color="textPrimary">
          How can I support you, Mama?
        </Text>
        <Text
          variant="bodySmall"
          textAlign="center"
          marginTop="s"
          color="textSecondary"
          paddingHorizontal="l"
          style={{ lineHeight: 22 }}
        >
          I'm your maternal doula companion. Ask me anything about nutrition safety, symptom relief, body changes, or upload a photo of your meal!
        </Text>
      </View>
    );
  }, [isLoadingHistory, theme.colors.primary, theme.colors.shadow, theme.colors.border]);

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Box flex={1} backgroundColor="mainBackground">
        {/* Serene Maternal Header */}
        <Box
          backgroundColor="surfaceElevated"
          style={{
            paddingTop: Math.max(insets.top + 8, 20),
            paddingBottom: 12,
            paddingHorizontal: 16,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: theme.colors.border,
            shadowColor: theme.colors.shadow,
            shadowOpacity: 0.03,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 8,
            elevation: 1,
          }}
        >
          <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="s">
            <Box flexDirection="row" alignItems="center" flex={1}>
              {/* AI Avatar */}
              <Box
                width={42}
                height={42}
                borderRadius="full"
                backgroundColor="primaryLight"
                alignItems="center"
                justifyContent="center"
                marginRight="s"
                borderWidth={1}
                borderColor="border"
              >
                <Ionicons name="sparkles" size={20} color={theme.colors.primary} />
              </Box>
              <Box flex={1}>
                <Text variant="h3" color="textPrimary" fontFamily="Inter_700Bold">
                  Nurture Companion
                </Text>
                <Box flexDirection="row" alignItems="center" marginTop="xs">
                  <Box
                    width={7}
                    height={7}
                    borderRadius="full"
                    backgroundColor={isStreaming ? 'warning' : 'secondary'}
                    marginRight="xs"
                  />
                  <Text variant="caption" color="textMuted">
                    {isStreaming ? 'Thinking...' : '24/7 Doula & Wellness Guide'}
                  </Text>
                </Box>
              </Box>
            </Box>

            {/* Header Right Buttons: Memory & Previous Chats */}
            <Box flexDirection="row" alignItems="center" gap="xs">
              {/* AI Memory Notes Button */}
              <TouchableOpacity
                onPress={() => setMemoryModalVisible(true)}
                activeOpacity={0.8}
                accessibilityLabel="View AI Memory Notes"
              >
                <Box
                  height={36}
                  paddingHorizontal="m"
                  borderRadius="full"
                  backgroundColor="warmSurfaceSoft"
                  borderWidth={1}
                  borderColor="border"
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Ionicons name="sparkles" size={13} color={theme.colors.primary} style={{ marginRight: 4 }} />
                  <Text variant="caption" color="primary" fontFamily="Inter_600SemiBold">
                    Memory
                  </Text>
                </Box>
              </TouchableOpacity>

              {/* Previous Chats Menu Button */}
              <TouchableOpacity
                onPress={() => setChatListVisible(true)}
                activeOpacity={0.8}
                accessibilityLabel="Open Previous Chats Menu"
              >
                <Box
                  width={36}
                  height={36}
                  borderRadius="full"
                  backgroundColor="warmSurfaceSoft"
                  borderWidth={1}
                  borderColor="border"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Ionicons name="time-outline" size={18} color={theme.colors.textSecondary} />
                </Box>
              </TouchableOpacity>
            </Box>
          </Box>

          {/* AI Provider Switcher */}
          <AIProviderSelector
            selectedProvider={selectedProvider}
            selectedModel={selectedModel}
            onSelectProvider={setSelectedProvider}
          />

          {/* Inline message limit progress card */}
          {!isPremium && (
            <Box
              marginTop="s"
              paddingHorizontal="m"
              paddingVertical="s"
              borderRadius="m"
              backgroundColor="warmSurfaceSoft"
              borderWidth={1}
              borderColor="border"
            >
              <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                marginBottom="xs"
              >
                <Box flexDirection="row" alignItems="center">
                  <Ionicons name="chatbubbles-outline" size={13} color={theme.colors.textSecondary} style={{ marginRight: 6 }} />
                  <Text variant="caption" color="textSecondary" fontFamily="Inter_600SemiBold">
                    {weeklyMessageCount}/{weeklyMessageLimit} messages this week
                  </Text>
                </Box>
                {weeklyMessageCount >= weeklyMessageLimit ? (
                  <Box
                    backgroundColor="primary"
                    paddingHorizontal="s"
                    borderRadius="full"
                  >
                    <Text variant="caption" color="textInverse" fontFamily="Inter_700Bold">
                      Limit reached
                    </Text>
                  </Box>
                ) : (
                  <Text variant="caption" color="textMuted">
                    {weeklyMessageLimit - weeklyMessageCount} left
                  </Text>
                )}
              </Box>

              <Box width="100%" height={4} backgroundColor="border" borderRadius="full" overflow="hidden">
                <Box
                  height={4}
                  borderRadius="full"
                  backgroundColor={weeklyMessageCount >= weeklyMessageLimit ? 'error' : 'primary'}
                  style={{ width: `${limitPercent}%` }}
                />
              </Box>
            </Box>
          )}
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
        renderMessage={(props) => (
          <Message
            {...props}
            containerStyle={{
              left: {
                maxWidth: '94%',
                marginLeft: 4,
              },
              right: {
                maxWidth: '85%',
                marginRight: 4,
              },
            }}
          />
        )}
        renderBubble={(props) => <ChatBubble {...props} />}
        renderFooter={renderFooter}
        renderChatEmpty={renderEmpty}
        renderInputToolbar={() => null}
        isInverted={true}
        listProps={{
          contentContainerStyle:
            messages.length === 0
              ? { flexGrow: 1, justifyContent: 'center' }
              : { paddingTop: 8, paddingBottom: 16 },
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

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
              {chats.length === 0 ? (
                <Box alignItems="center" justifyContent="center" paddingVertical="xl" paddingHorizontal="m">
                  <Box
                    width={56}
                    height={56}
                    borderRadius="full"
                    backgroundColor="accentLight"
                    alignItems="center"
                    justifyContent="center"
                    marginBottom="m"
                  >
                    <Ionicons name="chatbubbles-outline" size={28} color={theme.colors.accent} />
                  </Box>
                  <Text variant="body" fontFamily="Inter_600SemiBold" color="textPrimary" textAlign="center">
                    No Previous Chats Yet
                  </Text>
                  <Text variant="bodySmall" color="textMuted" textAlign="center" marginTop="xs">
                    Your conversations with NurtureAI are saved here so you can revisit them anytime.
                  </Text>
                </Box>
              ) : (
                chats.map((chat) => {
                  const isActive = activeChatId === chat.id;
                  const chatDate = new Date(chat.created_at);
                  const isToday = new Date().toDateString() === chatDate.toDateString();
                  const timeFormatted = chatDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const dateFormatted = isToday ? `Today · ${timeFormatted}` : `${chatDate.toLocaleDateString()} · ${timeFormatted}`;

                  return (
                    <Box
                      key={chat.id}
                      flexDirection="row"
                      alignItems="center"
                      justifyContent="space-between"
                      paddingVertical="s"
                      paddingHorizontal="m"
                      marginBottom="xs"
                      borderRadius="m"
                      backgroundColor={isActive ? 'surfaceElevated' : 'transparent'}
                      borderWidth={isActive ? 1 : 0}
                      borderColor="borderFocused"
                    >
                      <TouchableOpacity
                        style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                        onPress={() => {
                          setActiveChatId(chat.id);
                          setChatListVisible(false);
                        }}
                      >
                        <Box
                          width={38}
                          height={38}
                          borderRadius="full"
                          backgroundColor={isActive ? 'primaryLight' : 'inputBackground'}
                          alignItems="center"
                          justifyContent="center"
                          marginRight="m"
                        >
                          <Ionicons
                            name="chatbubble-ellipses-outline"
                            size={18}
                            color={isActive ? theme.colors.primaryDark : theme.colors.textMuted}
                          />
                        </Box>

                        <Box flex={1} marginRight="s">
                          <Box flexDirection="row" alignItems="center">
                            <Text
                              variant="body"
                              fontFamily={isActive ? 'Inter_600SemiBold' : 'Inter_500Medium'}
                              color={isActive ? 'primary' : 'textPrimary'}
                              numberOfLines={1}
                              style={{ flexShrink: 1 }}
                            >
                              {chat.title}
                            </Text>
                            {isActive && (
                              <Box
                                backgroundColor="primaryLight"
                                paddingHorizontal="xs"
                                paddingVertical="0"
                                borderRadius="s"
                                marginLeft="xs"
                              >
                                <Text style={{ fontSize: 10, color: theme.colors.primaryDark, fontWeight: '700' }}>
                                  Active
                                </Text>
                              </Box>
                            )}
                          </Box>
                          <Text variant="caption" color="textMuted" marginTop="xs">
                            {dateFormatted}
                          </Text>
                        </Box>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert(
                            'Delete Chat',
                            'Are you sure you want to delete this chat session? This cannot be undone.',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Delete',
                                style: 'destructive',
                                onPress: async () => {
                                  try {
                                    await deleteChat(chat.id);
                                    if (activeChatId === chat.id) {
                                      setActiveChatId(null);
                                    }
                                  } catch (err) {
                                    console.warn('Failed to delete chat:', err);
                                  }
                                },
                              },
                            ]
                          );
                        }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={{ padding: 4 }}
                      >
                        <Ionicons name="trash-outline" size={18} color={theme.colors.textMuted} />
                      </TouchableOpacity>
                    </Box>
                  );
                })
              )}
            </ScrollView>
          </Box>
        </Box>
      </Modal>

      {/* Persistent AI Memory & Notes Modal */}
      <UserMemoryModal
        isVisible={isMemoryModalVisible}
        onClose={() => setMemoryModalVisible(false)}
        userMemory={userMemory}
        onSaveMemory={updateUserMemory}
        isSaving={isUpdatingMemory}
      />
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
