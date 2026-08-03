import React, { useState } from 'react';
import { Alert, Modal, ScrollView } from 'react-native';
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
      {/* Header */}
      <Box
        paddingHorizontal="m"
        paddingBottom="m"
        backgroundColor="primaryBackground"
        borderBottomWidth={1}
        borderColor="border"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        style={{ paddingTop: Math.max(insets.top + 8, 24) }}
      >
        <Box flexDirection="row" alignItems="center">
          <Ionicons name="settings-sharp" size={24} color={theme.colors.primary} />
          <Text variant="h2" marginLeft="s">
            Settings
          </Text>
        </Box>
        <Touchable onPress={() => router.back()} hitSlop={12}>
          <Box
            width={32}
            height={32}
            borderRadius="full"
            backgroundColor="inputBackground"
            alignItems="center"
            justifyContent="center"
          >
            <Ionicons name="close" size={20} color={theme.colors.textPrimary} />
          </Box>
        </Touchable>
      </Box>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* Pregnancy Tracker Settings */}
        <Card variant="elevated">
          <Box flexDirection="row" alignItems="center" marginBottom="s">
            <Ionicons name="calendar-outline" size={22} color={theme.colors.primary} />
            <Text variant="h3" marginLeft="s">
              Pregnancy Details
            </Text>
          </Box>

          <Box gap="xs" marginBottom="m">
            <Box flexDirection="row" justifyContent="space-between">
              <Text variant="bodySmall" color="textSecondary">Pregnancy Start Date:</Text>
              <Text variant="bodySmall" fontFamily="Inter_600SemiBold">
                {user?.pregnancy_start_date ? formatDate(new Date(user.pregnancy_start_date), 'MMM d, yyyy') : 'Not set'}
              </Text>
            </Box>
            <Box flexDirection="row" justifyContent="space-between">
              <Text variant="bodySmall" color="textSecondary">Current Progress:</Text>
              <Text variant="bodySmall" fontFamily="Inter_600SemiBold">Week {currentWeek}</Text>
            </Box>
            <Box flexDirection="row" justifyContent="space-between">
              <Text variant="bodySmall" color="textSecondary">Estimated Due Date:</Text>
              <Text variant="bodySmall" fontFamily="Inter_600SemiBold">
                {dueDate ? formatDate(dueDate, 'MMM d, yyyy') : '—'}
              </Text>
            </Box>
          </Box>

          <Button
            title="Change Pregnancy Start Date 🗓️"
            onPress={() => setShowDatePicker(true)}
            variant="outline"
            size="sm"
          />
        </Card>

        {/* Profile Details */}
        <Card variant="elevated">
          <Box flexDirection="row" alignItems="center" marginBottom="s">
            <Ionicons name="person-outline" size={22} color={theme.colors.primary} />
            <Text variant="h3" marginLeft="s">
              Account Info
            </Text>
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
              <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Text variant="caption" color="textMuted">Name</Text>
                  <Text variant="body" fontFamily="Inter_600SemiBold">{user?.first_name ?? 'Mama'}</Text>
                </Box>
                <Touchable onPress={() => setIsEditingName(true)}>
                  <Text variant="caption" color="primary" fontFamily="Inter_600SemiBold">Edit</Text>
                </Touchable>
              </Box>
            )}

            <Box>
              <Text variant="caption" color="textMuted">Email</Text>
              <Text variant="body" fontFamily="Inter_400Regular">{user?.email ?? '—'}</Text>
            </Box>
          </Box>
        </Card>

        {/* Subscription Card */}
        <Card variant="elevated">
          <Box flexDirection="row" alignItems="center" marginBottom="s">
            <Ionicons name="star-outline" size={22} color={theme.colors.primary} />
            <Text variant="h3" marginLeft="s">
              Subscription
            </Text>
          </Box>
          <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
            <Text variant="bodySmall" color="textSecondary">Current Plan:</Text>
            <Box backgroundColor={tier === 'premium' ? 'accent' : 'secondaryLight'} borderRadius="full" paddingHorizontal="m" paddingVertical="xs">
              <Text variant="caption" color={tier === 'premium' ? 'textInverse' : 'secondary'}>
                {tier === 'premium' ? '✨ Premium' : '🌱 Free Plan'}
              </Text>
            </Box>
          </Box>
          <Button
            title={tier === 'premium' ? 'Manage Subscription' : 'Upgrade to Pro ✨'}
            onPress={() => router.push('/(modals)/paywall')}
            variant={tier === 'premium' ? 'outline' : 'primary'}
            size="sm"
          />
        </Card>

        {/* Sign Out & Account Deletion */}
        <Box marginTop="m" gap="s">
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
          <Box
            backgroundColor="primaryBackground"
            borderTopLeftRadius="xl"
            borderTopRightRadius="xl"
            padding="m"
            maxHeight="85%"
          >
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
              <Text variant="h3">Select Pregnancy Start Date</Text>
              <Touchable onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
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
                    title="Save New Date"
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
