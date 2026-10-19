import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@shopify/restyle';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { Box, Text, Card } from '@/theme/restyleComponents';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CalendarPicker } from '@/components/ui/CalendarPicker';
import { Touchable } from '@/components/primitives/Touchable';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { usePregnancyWeek } from '@/hooks/usePregnancyWeek';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { authService } from '@/features/auth/services/authService';
import { formatDate } from '@/utils/date';
import { type Theme } from '@/theme/theme';

export default function SettingsScreen() {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const tier = useSubscriptionStore((s) => s.tier);
  const { currentWeek, dueDate } = usePregnancyWeek();
  const { signOut, deleteAccount } = useAuth();

  const [firstName, setFirstName] = useState(user?.first_name ?? '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);

  // Calendar picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const initialStartDate = user?.pregnancy_start_date ? new Date(user.pregnancy_start_date) : new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(initialStartDate);
  const [isSavingDate, setIsSavingDate] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? All your pregnancy tracking history, health metrics, and saved memory will be permanently removed. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              router.replace('/(auth)/login');
            } catch (err: any) {
              Alert.alert('Error', err.message ?? 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  const handleSaveName = async () => {
    if (!user?.id) return;
    try {
      setIsSavingName(true);
      const updated = await authService.updateUserProfile(user.id, {
        first_name: firstName.trim(),
      });
      setUser(updated);
      setIsEditingName(false);
      Alert.alert('Success', 'Profile name updated!');
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to update name');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSaveStartDate = async () => {
    if (!user?.id) return;
    try {
      setIsSavingDate(true);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const updated = await authService.updateUserProfile(user.id, {
        pregnancy_start_date: formattedDate,
      });
      setUser(updated);
      setShowDatePicker(false);
      Alert.alert('Success', 'Pregnancy start date updated! Your due date and week progress have been recalculated.');
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to update pregnancy date');
    } finally {
      setIsSavingDate(false);
    }
  };

  return (
    <Screen scrollable={false} padded={false} safeTop={false} backgroundColor="mainBackground">
      {/* Top Header */}
      <Box
        paddingHorizontal="m"
        paddingBottom="m"
        backgroundColor="surfaceElevated"
        borderBottomWidth={1}
        borderColor="border"
        flexDirection="row"
        alignItems="center"
        style={{ paddingTop: Math.max(insets.top + 8, 20) }}
      >
        <Touchable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Close settings">
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

        <Box flexDirection="row" alignItems="center" flex={1}>
          <Box
            width={38}
            height={38}
            borderRadius="full"
            backgroundColor="warmSurfaceSoft"
            borderWidth={1}
            borderColor="border"
            alignItems="center"
            justifyContent="center"
            marginRight="s"
          >
            <Ionicons name="settings" size={20} color={theme.colors.primary} />
          </Box>
          <Box>
            <Text variant="h2" color="textPrimary">
              Settings
            </Text>
            <Text variant="caption" color="textMuted">
              Preferences & account management
            </Text>
          </Box>
        </Box>
      </Box>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          gap: 16,
          paddingBottom: Math.max(insets.bottom + 24, 32),
        }}
      >
        {/* Pregnancy Tracker Settings Card */}
        <Card variant="elevated" style={styles.card}>
          <Box flexDirection="row" alignItems="center" marginBottom="m">
            <Box
              width={34}
              height={34}
              borderRadius="full"
              backgroundColor="accentLight"
              alignItems="center"
              justifyContent="center"
              marginRight="s"
            >
              <Ionicons name="calendar" size={18} color={theme.colors.accent} />
            </Box>
            <Box>
              <Text variant="h3" color="textPrimary">
                Pregnancy Details
              </Text>
              <Text variant="caption" color="textMuted">
                Milestone dates & due week tracking
              </Text>
            </Box>
          </Box>

          <Box
            backgroundColor="mainBackground"
            borderRadius="l"
            padding="m"
            gap="s"
            marginBottom="m"
            borderWidth={1}
            borderColor="border"
          >
            <Box flexDirection="row" justifyContent="space-between" alignItems="center">
              <Text variant="bodySmall" color="textSecondary">Start Date</Text>
              <Text variant="bodySmall" fontFamily="Inter_600SemiBold" color="textPrimary">
                {user?.pregnancy_start_date ? formatDate(new Date(user.pregnancy_start_date), 'MMM d, yyyy') : 'Not set'}
              </Text>
            </Box>
            <Box height={1} backgroundColor="border" />
            <Box flexDirection="row" justifyContent="space-between" alignItems="center">
              <Text variant="bodySmall" color="textSecondary">Current Stage</Text>
              <Box
                backgroundColor="secondaryLight"
                borderRadius="full"
                paddingHorizontal="s"
                paddingVertical="xs"
              >
                <Text variant="caption" fontFamily="Inter_700Bold" color="secondary">
                  Week {currentWeek}
                </Text>
              </Box>
            </Box>
            <Box height={1} backgroundColor="border" />
            <Box flexDirection="row" justifyContent="space-between" alignItems="center">
              <Text variant="bodySmall" color="textSecondary">Estimated Due Date</Text>
              <Text variant="bodySmall" fontFamily="Inter_600SemiBold" color="primaryDark">
                {dueDate ? formatDate(dueDate, 'MMMM d, yyyy') : '—'}
              </Text>
            </Box>
          </Box>

          <Button
            title="Update Pregnancy Start Date"
            onPress={() => setShowDatePicker(true)}
            variant="outline"
            size="sm"
          />
        </Card>

        {/* Profile Details Card */}
        <Card variant="elevated" style={styles.card}>
          <Box flexDirection="row" alignItems="center" marginBottom="m">
            <Box
              width={34}
              height={34}
              borderRadius="full"
              backgroundColor="warmSurfaceSoft"
              alignItems="center"
              justifyContent="center"
              marginRight="s"
            >
              <Ionicons name="person" size={18} color={theme.colors.primary} />
            </Box>
            <Box>
              <Text variant="h3" color="textPrimary">
                Account Profile
              </Text>
              <Text variant="caption" color="textMuted">
                Your personal details
              </Text>
            </Box>
          </Box>

          <Box gap="m">
            {isEditingName ? (
              <Box>
                <Input
                  label="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoFocus
                />
                <Box flexDirection="row" gap="s" marginTop="s">
                  <Box flex={1}>
                    <Button
                      title="Cancel"
                      onPress={() => setIsEditingName(false)}
                      variant="ghost"
                      size="sm"
                    />
                  </Box>
                  <Box flex={1}>
                    <Button
                      title="Save"
                      onPress={handleSaveName}
                      loading={isSavingName}
                      variant="primary"
                      size="sm"
                    />
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box
                backgroundColor="mainBackground"
                borderRadius="l"
                padding="m"
                borderWidth={1}
                borderColor="border"
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Text variant="caption" color="textMuted">First Name</Text>
                  <Text variant="body" fontFamily="Inter_600SemiBold" color="textPrimary">
                    {user?.first_name ?? 'Mama'}
                  </Text>
                </Box>
                <Touchable onPress={() => setIsEditingName(true)}>
                  <Box
                    backgroundColor="warmSurfaceSoft"
                    paddingHorizontal="m"
                    paddingVertical="xs"
                    borderRadius="full"
                    borderWidth={1}
                    borderColor="border"
                  >
                    <Text variant="caption" color="primary" fontFamily="Inter_600SemiBold">
                      Edit Name
                    </Text>
                  </Box>
                </Touchable>
              </Box>
            )}

            <Box
              backgroundColor="mainBackground"
              borderRadius="l"
              padding="m"
              borderWidth={1}
              borderColor="border"
            >
              <Text variant="caption" color="textMuted">Account Email</Text>
              <Text variant="body" fontFamily="Inter_400Regular" color="textPrimary" marginTop="xs">
                {user?.email ?? '—'}
              </Text>
            </Box>
          </Box>
        </Card>

        {/* Subscription Card */}
        <Card variant="elevated" style={styles.card}>
          <Box flexDirection="row" alignItems="center" marginBottom="m">
            <Box
              width={34}
              height={34}
              borderRadius="full"
              backgroundColor="peachSubtle"
              alignItems="center"
              justifyContent="center"
              marginRight="s"
            >
              <Ionicons name="sparkles" size={18} color={theme.colors.coral} />
            </Box>
            <Box>
              <Text variant="h3" color="textPrimary">
                Subscription Plan
              </Text>
              <Text variant="caption" color="textMuted">
                Unlock clinical AI and meal scanning
              </Text>
            </Box>
          </Box>

          <Box
            backgroundColor="mainBackground"
            borderRadius="l"
            padding="m"
            borderWidth={1}
            borderColor="border"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            marginBottom="m"
          >
            <Box>
              <Text variant="caption" color="textMuted">Current Status</Text>
              <Text variant="body" fontFamily="Inter_700Bold" color="textPrimary" marginTop="xs">
                {tier === 'premium' ? 'Nurture+ Pro Member' : 'Standard Free Tier'}
              </Text>
            </Box>
            <Box
              backgroundColor={tier === 'premium' ? 'accentLight' : 'secondaryLight'}
              borderRadius="full"
              paddingHorizontal="m"
              paddingVertical="xs"
            >
              <Text
                variant="caption"
                fontFamily="Inter_700Bold"
                color={tier === 'premium' ? 'accent' : 'secondary'}
                style={{ fontSize: 11 }}
              >
                {tier === 'premium' ? 'ACTIVE PRO' : 'FREE'}
              </Text>
            </Box>
          </Box>

          <Button
            title={tier === 'premium' ? 'Manage Subscription' : 'Upgrade to Pro'}
            onPress={() => router.push('/(modals)/paywall')}
            variant={tier === 'premium' ? 'outline' : 'primary'}
            size="sm"
          />
        </Card>

        {/* Account Actions */}
        <Box marginTop="s" gap="s">
          <Button
            title="Sign Out"
            onPress={() => {
              signOut();
              router.replace('/(auth)/login');
            }}
            variant="ghost"
          />
          <Button
            title="Delete Account"
            onPress={handleDeleteAccount}
            variant="danger"
          />
        </Box>
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDatePicker(false)}
      >
        <Box flex={1} backgroundColor="overlay" justifyContent="flex-end">
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => setShowDatePicker(false)}
          />

          <Box
            backgroundColor="surfaceElevated"
            borderTopLeftRadius="2xl"
            borderTopRightRadius="2xl"
            padding="l"
            maxHeight="85%"
            style={styles.sheetContent}
          >
            {/* Sheet Handle */}
            <Box alignItems="center" marginBottom="m">
              <Box width={36} height={4} borderRadius="full" backgroundColor="border" />
            </Box>

            <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
              <Box>
                <Text variant="h3" color="textPrimary">Select Start Date</Text>
                <Text variant="caption" color="textMuted">First day of last menstrual period</Text>
              </Box>
              <Touchable onPress={() => setShowDatePicker(false)} hitSlop={10}>
                <Box
                  width={30}
                  height={30}
                  borderRadius="full"
                  backgroundColor="warmSurfaceSoft"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Ionicons name="close" size={18} color={theme.colors.textPrimary} />
                </Box>
              </Touchable>
            </Box>

            <ScrollView showsVerticalScrollIndicator={false}>
              <CalendarPicker
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />

              <Box flexDirection="row" gap="m" marginTop="l" marginBottom="m">
                <Box flex={1}>
                  <Button
                    title="Cancel"
                    onPress={() => setShowDatePicker(false)}
                    variant="ghost"
                  />
                </Box>
                <Box flex={1}>
                  <Button
                    title="Save Date"
                    onPress={handleSaveStartDate}
                    loading={isSavingDate}
                    variant="primary"
                  />
                </Box>
              </Box>
            </ScrollView>
          </Box>
        </Box>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3E8EC',
  },
  sheetContent: {
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 16,
    elevation: 10,
  },
});
