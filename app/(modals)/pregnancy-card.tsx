import React, { useState } from 'react';
import { Image, Share, Alert, Modal } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@shopify/restyle';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { Box, Text, Card } from '@/theme/restyleComponents';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Touchable } from '@/components/primitives/Touchable';
import { useAuthStore } from '@/stores/authStore';
import { usePregnancyWeek } from '@/hooks/usePregnancyWeek';
import { authService } from '@/features/auth/services/authService';
import { getWeekInfo } from '@/utils/pregnancy';
import { getDueDateWeekRange } from '@/utils/date';
import { type Theme } from '@/theme/theme';

export default function PregnancyCardScreen() {
  const theme = useTheme<Theme>();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const avatarUri = useAuthStore((s) => s.avatarUri);
  const { currentWeek, trimester, daysRemaining } = usePregnancyWeek();
  const weekInfo = getWeekInfo(currentWeek);

  const dueWeekText = user?.pregnancy_start_date
    ? getDueDateWeekRange(user.pregnancy_start_date)
    : 'Not set';

  const [bloodType, setBloodType] = useState(user?.blood_type ?? 'O+');
  const [emergencyPhone, setEmergencyPhone] = useState(user?.emergency_contact ?? '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveHealthInfo = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      const updated = await authService.updateUserProfile(user.id, {
        blood_type: bloodType || null,
        emergency_contact: emergencyPhone || null,
      });
      setUser(updated);
      setIsEditing(false);
      Alert.alert('Saved! ✨', 'Your pregnancy card health details have been updated.');
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to update health info');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareCard = async () => {
    try {
      const shareMessage = `🎀 NurtureAI Digital Pregnancy Card 🎀\n\n` +
        `Mother: ${user?.first_name ?? 'Mama'}\n` +
        `Status: Week ${currentWeek} (${trimester}nd Trimester)\n` +
        `Baby Size: ${weekInfo.fruitName} ${weekInfo.fruitEmoji}\n` +
        `Expected Due Week: ${dueWeekText}\n` +
        `Blood Type: ${user?.blood_type ?? 'Not set'}\n` +
        `Emergency Contact: ${user?.emergency_contact ?? 'Not set'}\n` +
        `Days Remaining: ${daysRemaining} days\n\n` +
        `Logged with NurtureAI 🤱✨`;

      await Share.share({
        message: shareMessage,
        title: `${user?.first_name ?? 'Mama'}'s Pregnancy Card`,
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  return (
    <Screen scrollable safeTop backgroundColor="mainBackground">
      {/* Header Bar */}
      <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
        <Text variant="h2">Pregnancy Card 💳</Text>
        <Touchable onPress={() => router.back()} hitSlop={10}>
          <Box backgroundColor="inputBackground" padding="s" borderRadius="full">
            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
          </Box>
        </Touchable>
      </Box>

      {/* Premium Digital Health Pass Container */}
      <Box
        borderRadius="xl"
        padding="l"
        marginBottom="l"
        style={{
          backgroundColor: '#FF6B8B',
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        {/* Pass Top Banner */}
        <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
          <Box flexDirection="row" alignItems="center">
            <Text style={{ fontSize: 24, marginRight: 6 }}>🤱</Text>
            <Text variant="h3" color="white" style={{ letterSpacing: 1 }}>
              NURTURE PASS
            </Text>
          </Box>
          <Box
            backgroundColor="secondary"
            borderRadius="full"
            paddingHorizontal="s"
            paddingVertical="xs"
          >
            <Text variant="caption" color="textInverse" fontFamily="Inter_700Bold">
              🟢 ACTIVE
            </Text>
          </Box>
        </Box>

        {/* Profile Info Section */}
        <Box flexDirection="row" alignItems="center" marginBottom="l">
          <Box
            width={64}
            height={64}
            borderRadius="full"
            backgroundColor="white"
            alignItems="center"
            justifyContent="center"
            marginRight="m"
            overflow="hidden"
            borderWidth={2}
            borderColor="white"
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={{ width: 64, height: 64, borderRadius: 32 }} />
            ) : (
              <Text style={{ fontSize: 32, lineHeight: 40 }}>🎀</Text>
            )}
          </Box>

          <Box flex={1}>
            <Text variant="h2" color="white">
              {user?.first_name ?? 'Mama'}
            </Text>
            <Text variant="bodySmall" style={{ color: '#FFE6EC' }}>
              {user?.email ?? ''}
            </Text>
          </Box>
        </Box>

        {/* Key Metrics Grid */}
        <Box
          backgroundColor="white"
          borderRadius="l"
          padding="m"
          marginBottom="m"
        >
          <Box flexDirection="row" justifyContent="space-between" marginBottom="m">
            <Box flex={1}>
              <Text variant="caption" color="textMuted">CURRENT WEEK</Text>
              <Text variant="h2" color="primary">Week {currentWeek}</Text>
            </Box>

            <Box flex={1} alignItems="flex-end">
              <Text variant="caption" color="textMuted">TRIMESTER</Text>
              <Text variant="h3" color="textPrimary">{trimester}nd Trimester</Text>
            </Box>
          </Box>

          <Box height={1} backgroundColor="border" marginBottom="m" />

          <Box flexDirection="row" justifyContent="space-between" marginBottom="m">
            <Box flex={1}>
              <Text variant="caption" color="textMuted">BABY SIZE</Text>
              <Text variant="bodySmall" fontFamily="Inter_700Bold" color="textPrimary">
                {weekInfo.fruitName} {weekInfo.fruitEmoji}
              </Text>
            </Box>

            <Box flex={1} alignItems="flex-end">
              <Text variant="caption" color="textMuted">DAYS REMAINING</Text>
              <Text variant="bodySmall" fontFamily="Inter_700Bold" color="secondary">
                {daysRemaining} Days
              </Text>
            </Box>
          </Box>

          <Box height={1} backgroundColor="border" marginBottom="m" />

          <Box>
            <Text variant="caption" color="textMuted">EXPECTED DUE WEEK</Text>
            <Text variant="bodySmall" fontFamily="Inter_700Bold" color="primaryDark">
              {dueWeekText}
            </Text>
          </Box>
        </Box>

        {/* Pass ID Barcode */}
        <Box alignItems="center">
          <Text style={{ letterSpacing: 4, fontSize: 16, color: 'white', fontFamily: 'Inter_700Bold' }}>
            ||| | |||| || | |||| |||
          </Text>
          <Text variant="caption" style={{ color: '#FFE6EC', marginTop: 2 }}>
            PASS ID: NURTURE-PASS-8849-2026
          </Text>
        </Box>
      </Box>

      {/* Additional Health Details Card */}
      <Card variant="elevated" marginBottom="l">
        <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="s">
          <Box flexDirection="row" alignItems="center">
            <Ionicons name="medical" size={20} color={theme.colors.primary} />
            <Text variant="h3" marginLeft="s">Health & Emergency Info</Text>
          </Box>
          <Touchable onPress={() => setIsEditing(true)}>
            <Text variant="caption" color="primary" fontFamily="Inter_600SemiBold">
              Edit ✏️
            </Text>
          </Touchable>
        </Box>

        <Box gap="s">
          <Box flexDirection="row" justifyContent="space-between" alignItems="center" paddingVertical="xs">
            <Text variant="bodySmall" color="textSecondary">Blood Type:</Text>
            <Text variant="bodySmall" fontFamily="Inter_700Bold">{user?.blood_type ?? 'Not set'}</Text>
          </Box>

          <Box flexDirection="row" justifyContent="space-between" alignItems="center" paddingVertical="xs">
            <Text variant="bodySmall" color="textSecondary">Emergency Contact:</Text>
            <Text variant="bodySmall" fontFamily="Inter_700Bold">{user?.emergency_contact ?? 'Not set'}</Text>
          </Box>
        </Box>
      </Card>

      {/* Share & Actions */}
      <Box gap="m" marginBottom="xl">
        <Button
          title="Share Pregnancy Card 📤"
          onPress={handleShareCard}
          variant="primary"
          size="lg"
        />
        <Button
          title="Close Pass"
          onPress={() => router.back()}
          variant="ghost"
        />
      </Box>

      {/* Edit Health Details Modal */}
      <Modal visible={isEditing} animationType="slide" transparent onRequestClose={() => setIsEditing(false)}>
        <Box flex={1} backgroundColor="overlay" justifyContent="flex-end">
          <Box
            backgroundColor="primaryBackground"
            borderTopLeftRadius="xl"
            borderTopRightRadius="xl"
            padding="l"
          >
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
              <Text variant="h3">Edit Health Details</Text>
              <Touchable onPress={() => setIsEditing(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
              </Touchable>
            </Box>

            <Text variant="label" marginBottom="xs" color="textSecondary">
              Select Blood Type
            </Text>
            <Box flexDirection="row" flexWrap="wrap" gap="xs" marginBottom="m">
              {['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'].map((bt) => {
                const isSelected = bloodType === bt;
                return (
                  <Touchable key={bt} onPress={() => setBloodType(bt)}>
                    <Box
                      backgroundColor={isSelected ? 'primary' : 'inputBackground'}
                      borderRadius="s"
                      paddingHorizontal="m"
                      paddingVertical="s"
                    >
                      <Text variant="bodySmall" color={isSelected ? 'textInverse' : 'textPrimary'}>
                        {bt}
                      </Text>
                    </Box>
                  </Touchable>
                );
              })}
            </Box>

            <Input
              label="Emergency Contact Phone"
              placeholder="e.g. +1 (555) 019-2831"
              value={emergencyPhone}
              onChangeText={setEmergencyPhone}
              keyboardType="phone-pad"
            />

            <Box marginTop="l" gap="s">
              <Button
                title="Save Changes 💾"
                onPress={handleSaveHealthInfo}
                loading={isSaving}
                variant="primary"
              />
              <Button
                title="Cancel"
                onPress={() => setIsEditing(false)}
                variant="ghost"
              />
            </Box>
          </Box>
        </Box>
      </Modal>
    </Screen>
  );
}
