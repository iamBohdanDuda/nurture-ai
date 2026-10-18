import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Box, Text } from '@/theme/restyleComponents';
import { useTheme } from '@shopify/restyle';
import { type Theme, GRADIENTS } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MarkdownMessage } from './MarkdownMessage';

interface UserMemoryModalProps {
  isVisible: boolean;
  onClose: () => void;
  userMemory: string;
  onSaveMemory: (newMemory: string) => Promise<any>;
  isSaving?: boolean;
}

export function UserMemoryModal({
  isVisible,
  onClose,
  userMemory,
  onSaveMemory,
  isSaving = false,
}: UserMemoryModalProps) {
  const theme = useTheme<Theme>();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');

  const isEmpty =
    !userMemory ||
    userMemory.trim() === '' ||
    userMemory === 'No history yet.' ||
    userMemory === 'No notes recorded yet.';

  // Sync draft text when modal opens or userMemory changes
  useEffect(() => {
    if (isVisible) {
      setEditedText(isEmpty ? '' : userMemory);
      setIsEditing(false);
    }
  }, [isVisible, userMemory, isEmpty]);

  const handleSave = async () => {
    try {
      await onSaveMemory(editedText.trim() || 'No notes recorded yet.');
      setIsEditing(false);
      Alert.alert('Saved', 'AI memory notes updated successfully.');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not save memory notes.');
    }
  };

  const handleClear = () => {
    Alert.alert(
      'Clear AI Memory',
      'Are you sure you want to erase all notes NurtureAI has remembered about you? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await onSaveMemory('No notes recorded yet.');
              setEditedText('');
              setIsEditing(false);
            } catch (err: any) {
              Alert.alert('Error', 'Failed to clear memory.');
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          style={styles.backdropTap}
          activeOpacity={1}
          onPress={onClose}
        />

        <Box
          backgroundColor="surfaceElevated"
          borderTopLeftRadius="xl"
          borderTopRightRadius="xl"
          style={styles.sheetContainer}
        >
          {/* Top Drag Indicator */}
          <Box alignItems="center" paddingTop="s" paddingBottom="xs">
            <Box
              width={40}
              height={4}
              borderRadius="full"
              backgroundColor="border"
            />
          </Box>

          {/* Modal Header */}
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            paddingHorizontal="l"
            paddingVertical="m"
            borderBottomWidth={1}
            borderBottomColor="border"
          >
            <Box flexDirection="row" alignItems="center">
              <LinearGradient
                colors={GRADIENTS.primary}
                style={styles.headerIconContainer}
              >
                <Ionicons name="sparkles" size={18} color="#FFFFFF" />
              </LinearGradient>
              <Box marginLeft="s">
                <Text variant="h3" color="textPrimary" style={{ fontSize: 17, lineHeight: 22 }}>
                  AI Memory & Notes
                </Text>
                <Text variant="caption" color="textMuted">
                  Personalized notes remembered across all chats
                </Text>
              </Box>
            </Box>

            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={22} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </Box>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Info Pill */}
            <Box
              backgroundColor="mainBackground"
              padding="m"
              borderRadius="m"
              marginBottom="m"
              style={{
                borderWidth: 1,
                borderColor: 'rgba(213, 63, 140, 0.15)',
              }}
            >
              <Box flexDirection="row" alignItems="flex-start">
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={theme.colors.primary}
                  style={{ marginRight: 8, marginTop: 1 }}
                />
                <Text
                  variant="bodySmall"
                  color="textSecondary"
                  style={{ flex: 1, lineHeight: 18 }}
                >
                  NurtureAI automatically remembers key facts from your chats (e.g. allergies, due date, conditions, dietary preferences). You can also edit them here anytime.
                </Text>
              </Box>
            </Box>

            {/* Memory Content */}
            {isEditing ? (
              <Box marginBottom="m">
                <Text variant="bodySmall" color="textSecondary" marginBottom="xs" fontWeight="600">
                  Edit Notes (Markdown supported):
                </Text>
                <TextInput
                  value={editedText}
                  onChangeText={setEditedText}
                  placeholder={`## Profile\n- Due Date: ...\n\n## Medical & Safety\n- Allergies: ...\n\n## Preferences\n- Dietary: ...`}
                  placeholderTextColor={theme.colors.textMuted}
                  multiline
                  style={[
                    styles.textInput,
                    {
                      color: theme.colors.textPrimary,
                      backgroundColor: theme.colors.surfaceElevated,
                      borderColor: theme.colors.primary,
                    },
                  ]}
                  textAlignVertical="top"
                />

                <Box flexDirection="row" justifyContent="flex-end" marginTop="m" gap="s">
                  <TouchableOpacity
                    onPress={() => {
                      setEditedText(isEmpty ? '' : userMemory);
                      setIsEditing(false);
                    }}
                    style={[styles.btnSecondary, { borderColor: theme.colors.border }]}
                    disabled={isSaving}
                  >
                    <Text variant="bodySmall" color="textSecondary" fontWeight="600">
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSave}
                    disabled={isSaving}
                    style={styles.btnPrimary}
                  >
                    <LinearGradient
                      colors={GRADIENTS.primary}
                      style={styles.gradientButton}
                    >
                      {isSaving ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons name="checkmark" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                          <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
                            Save Notes
                          </Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </Box>
              </Box>
            ) : isEmpty ? (
              <Box
                alignItems="center"
                justifyContent="center"
                paddingVertical="xl"
                paddingHorizontal="m"
                backgroundColor="cardBackground"
                borderRadius="l"
                style={{ borderWidth: 1, borderColor: theme.colors.border }}
              >
                <Box
                  width={56}
                  height={56}
                  borderRadius="full"
                  backgroundColor="mainBackground"
                  alignItems="center"
                  justifyContent="center"
                  marginBottom="m"
                >
                  <Ionicons name="bookmark-outline" size={28} color={theme.colors.primary} />
                </Box>
                <Text variant="h3" color="textPrimary" style={{ fontSize: 17 }} marginBottom="xs">
                  No notes saved yet
                </Text>
                <Text
                  variant="bodySmall"
                  color="textMuted"
                  textAlign="center"
                  marginBottom="l"
                  style={{ maxWidth: 280 }}
                >
                  As you talk with NurtureAI, important health facts, medications, and pregnancy preferences will be saved here automatically!
                </Text>

                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  style={styles.btnPrimary}
                >
                  <LinearGradient
                    colors={GRADIENTS.primary}
                    style={styles.gradientButton}
                  >
                    <Ionicons name="create-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
                      Add Notes Manually
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Box>
            ) : (
              <Box>
                {/* Notes Display Card */}
                <Box
                  backgroundColor="cardBackground"
                  padding="m"
                  borderRadius="l"
                  marginBottom="m"
                  style={{
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                  }}
                >
                  <MarkdownMessage text={userMemory} isUser={false} />
                </Box>

                {/* Footer Controls */}
                <Box
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                  paddingVertical="s"
                >
                  <TouchableOpacity
                    onPress={() => setIsEditing(true)}
                    style={[styles.btnSecondary, { borderColor: theme.colors.primary }]}
                  >
                    <Ionicons name="pencil" size={14} color={theme.colors.primary} style={{ marginRight: 6 }} />
                    <Text variant="bodySmall" color="primary" fontWeight="700">
                      Edit Notes
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleClear}
                    style={styles.btnClear}
                  >
                    <Ionicons name="trash-outline" size={15} color={theme.colors.errorDark || '#E53E3E'} style={{ marginRight: 4 }} />
                    <Text style={{ color: theme.colors.errorDark || '#E53E3E', fontSize: 13, fontWeight: '600' }}>
                      Clear Memory
                    </Text>
                  </TouchableOpacity>
                </Box>
              </Box>
            )}
          </ScrollView>
        </Box>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdropTap: {
    flex: 1,
  },
  sheetContainer: {
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  headerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  textInput: {
    minHeight: 180,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
  },
  btnPrimary: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  btnClear: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
});
