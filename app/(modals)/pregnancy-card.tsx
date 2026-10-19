import React, { useState } from 'react';
import { Image, Share, Alert, Modal } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@shopify/restyle';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
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

  const passIdSlug = user?.id
    ? `NURTURE-PASS-${user.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()}-2026`
    : 'NURTURE-PASS-8849-2026';

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
      Alert.alert('Saved', 'Your pregnancy card health details have been updated.');
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
      <Box flexDirection="row" alignItems="center" marginBottom="m">
        <Touchable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Close pregnancy card">
          <Box
            width={34}
            height={34}
            borderRadius="full"
            backgroundColor="warmSurfaceSoft"
            borderWidth={1}
            borderColor="border"
            alignItems="center"
            justifyContent="center"
            marginRight="m"
          >
            <Ionicons name="close" size={20} color={theme.colors.textPrimary} />
          </Box>
        </Touchable>
        <Text variant="h2">Pregnancy Card</Text>
      </Box>

      {/* Premium Digital Health Pass Container */}
      <Box
        borderRadius="2xl"
        padding="l"
        marginBottom="l"
        style={{
          backgroundColor: '#C84E70',
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2,
          shadowRadius: 18,
          elevation: 6,
        }}
      >
        {/* Pass Top Banner */}
        <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
          <Box flexDirection="row" alignItems="center">
            <Ionicons name="sparkles" size={18} color="#FEF3D1" style={{ marginRight: 6 }} />
            <Text variant="caption" color="white" fontFamily="Inter_700Bold" style={{ letterSpacing: 1.5 }}>
              NURTURE HEALTH PASS
            </Text>
          </Box>
          <Box
            backgroundColor="secondary"
            borderRadius="full"
            paddingHorizontal="m"
            paddingVertical="xs"
          >
            <Text variant="caption" color="textInverse" fontFamily="Inter_700Bold" style={{ fontSize: 10 }}>
              ACTIVE
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
              <Text variant="h2" color="primary" fontFamily="Inter_700Bold">
                {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'M'}
              </Text>
            )}
          </Box>

          <Box flex={1}>
            <Text variant="h2" color="white" fontFamily="Inter_700Bold">
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
          borderRadius="xl"
          padding="m"
          marginBottom="m"
          borderWidth={1}
          borderColor="border"
        >
          <Box flexDirection="row" justifyContent="space-between" marginBottom="m">
            <Box flex={1}>
              <Text variant="caption" color="textMuted" style={{ fontSize: 10, letterSpacing: 0.8 }}>CURRENT WEEK</Text>
              <Text variant="h2" color="primary">Week {currentWeek}</Text>
            </Box>

            <Box flex={1} alignItems="flex-end">
              <Text variant="caption" color="textMuted" style={{ fontSize: 10, letterSpacing: 0.8 }}>TRIMESTER</Text>
              <Text variant="h3" color="textPrimary">{trimester === 1 ? '1st' : trimester === 2 ? '2nd' : '3rd'} Trimester</Text>
            </Box>
          </Box>

          <Box height={1} backgroundColor="border" marginBottom="m" />

          <Box flexDirection="row" justifyContent="space-between" marginBottom="m">
            <Box flex={1}>
              <Text variant="caption" color="textMuted" style={{ fontSize: 10, letterSpacing: 0.8 }}>BABY SIZE</Text>
              <Text variant="bodySmall" fontFamily="Inter_700Bold" color="textPrimary">
                {weekInfo.fruitName} {weekInfo.fruitEmoji}
              </Text>
            </Box>

            <Box flex={1} alignItems="flex-end">
              <Text variant="caption" color="textMuted" style={{ fontSize: 10, letterSpacing: 0.8 }}>DAYS REMAINING</Text>
              <Text variant="bodySmall" fontFamily="Inter_700Bold" color="secondary">
                {daysRemaining} Days
              </Text>
            </Box>
          </Box>

          <Box height={1} backgroundColor="border" marginBottom="m" />

          <Box>
            <Text variant="caption" color="textMuted" style={{ fontSize: 10, letterSpacing: 0.8 }}>EXPECTED DUE WEEK</Text>
            <Text variant="bodySmall" fontFamily="Inter_700Bold" color="primaryDark">
              {dueWeekText}
            </Text>
          </Box>
        </Box>

        {/* Pass ID QR Code Container */}
        <Box alignItems="center" marginTop="s">
          <Box
            backgroundColor="white"
            padding="s"
            borderRadius="l"
            alignItems="center"
            justifyContent="center"
            style={{
              shadowColor: '#000',
              shadowOpacity: 0.12,
              shadowOffset: { width: 0, height: 3 },
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <QRCode
              value={passIdSlug}
              size={96}
              color="#C84E70"
              backgroundColor="#FFFFFF"
            />
          </Box>
          <Text
            variant="caption"
            style={{
              color: '#FFFFFF',
              marginTop: 10,
              fontSize: 11,
              fontFamily: 'Inter_700Bold',
              letterSpacing: 1.2,
            }}
          >
            PASS ID: {passIdSlug}
          </Text>
          <Text variant="caption" style={{ color: '#FFE6EC', marginTop: 2, fontSize: 10 }}>
            Scan to verify maternal clinical pass
          </Text>
        </Box>
      </Box>

      {/* Additional Health Details Card */}
      <Card variant="elevated" marginBottom="l" padding="m" style={{ borderRadius: 24, backgroundColor: '#FFFFFF' }}>
        <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="s">
          <Box flexDirection="row" alignItems="center">
            <Ionicons name="medical" size={18} color={theme.colors.primary} />
            <Text variant="h3" marginLeft="s">Medical & Emergency Info</Text>
          </Box>
          <Touchable onPress={() => setIsEditing(true)}>
            <Text variant="caption" color="primary" fontFamily="Inter_600SemiBold">
              Edit
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
          title="Share Pregnancy Card"
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
                title="Save Changes"
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
