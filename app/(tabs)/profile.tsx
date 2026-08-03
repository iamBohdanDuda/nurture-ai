import React from 'react';
import { Image, Alert } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import RevenueCatUI from 'react-native-purchases-ui';
import { Screen } from '@/components/layout/Screen';
import { Box, Text, Card } from '@/theme/restyleComponents';
import { Button } from '@/components/ui/Button';
import { Touchable } from '@/components/primitives/Touchable';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { usePregnancyWeek } from '@/hooks/usePregnancyWeek';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatDate } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { type Theme } from '@/theme/theme';

export default function ProfileScreen() {
  const theme = useTheme<Theme>();
  const user = useAuthStore((s) => s.user);
  const avatarUri = useAuthStore((s) => s.avatarUri);
  const setAvatarUri = useAuthStore((s) => s.setAvatarUri);
  const tier = useSubscriptionStore((s) => s.tier);
  const { currentWeek, dueDate } = usePregnancyWeek();
  const { signOut } = useAuth();

  const handlePickAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission required',
          'Please allow access to your photo library to set a profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Image picker error:', err);
    }
  };

  return (
    <Screen scrollable safeTop backgroundColor="mainBackground">
      {/* Profile Header */}
      <Box alignItems="center" paddingVertical="xl">
        <Touchable onPress={handlePickAvatar} activeScale={0.95}>
          <Box style={{ position: 'relative' }}>
            <Box
              width={84}
              height={84}
              borderRadius="full"
              backgroundColor="primaryLight"
              alignItems="center"
              justifyContent="center"
              overflow="hidden"
            >
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={{ width: 84, height: 84, borderRadius: 42 }}
                />
              ) : (
                <Text style={{ fontSize: 40, lineHeight: 50, textAlign: 'center' }}>
                  🤱
                </Text>
              )}
            </Box>

            {/* Camera badge overlay */}
            <Box
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: theme.colors.primary,
                width: 28,
                height: 28,
                borderRadius: 14,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: theme.colors.primaryBackground,
              }}
            >
              <Ionicons name="camera" size={14} color={theme.colors.white} />
            </Box>
          </Box>
        </Touchable>

        <Text variant="h2" marginTop="m">
          {user?.first_name ?? 'Mama'}
        </Text>
        <Text variant="bodySmall">{user?.email ?? ''}</Text>
        <Box
          backgroundColor={tier === 'premium' ? 'accent' : 'secondaryLight'}
          borderRadius="full"
          paddingHorizontal="m"
          paddingVertical="xs"
          marginTop="s"
        >
          <Text variant="caption" color={tier === 'premium' ? 'textInverse' : 'secondary'}>
            {tier === 'premium' ? '✨ Premium' : '🌱 Free Plan'}
          </Text>
        </Box>
      </Box>

      {/* Pregnancy Info */}
      <Card variant="elevated" marginBottom="m">
        <Box flexDirection="row" justifyContent="space-between">
          <Box>
            <Text variant="caption">Current Week</Text>
            <Text variant="h3">{currentWeek}</Text>
          </Box>
          <Box alignItems="flex-end">
            <Text variant="caption">Due Date</Text>
            <Text variant="h3">{dueDate ? formatDate(dueDate, 'MMM d') : '—'}</Text>
          </Box>
        </Box>
      </Card>

      {/* Menu Items */}
      <Box gap="s" marginBottom="xl">
        {/* Static items */}
        {[
          { icon: 'card-outline', label: 'Pregnancy Card', route: '/(modals)/pregnancy-card' },
          { icon: 'settings-outline', label: 'Settings', route: '/(modals)/settings' },
        ].map((item) => (
          <Touchable key={item.label} onPress={() => router.push(item.route as any)}>
            <Card variant="flat">
              <Box flexDirection="row" alignItems="center">
                <Ionicons name={item.icon as any} size={22} color={theme.colors.textPrimary} />
                <Text variant="body" marginLeft="m" flex={1}>
                  {item.label}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
              </Box>
            </Card>
          </Touchable>
        ))}

        {/* Dynamic Subscription Button */}
        <Touchable 
          onPress={() => {
            if (tier === 'premium') {
              RevenueCatUI.presentCustomerCenter();
            } else {
              router.push('/(modals)/paywall');
            }
          }}
        >
          <Card variant="flat">
            <Box flexDirection="row" alignItems="center">
              <Ionicons name={tier === 'premium' ? "star-outline" : "diamond-outline"} size={22} color={theme.colors.textPrimary} />
              <Text variant="body" marginLeft="m" flex={1}>
                {tier === 'premium' ? 'Manage Nurture Pro Subscription' : 'Upgrade to Nurture Pro ✨'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
            </Box>
          </Card>
        </Touchable>
      </Box>

      {/* Sign Out */}
      <Button
        title="Sign Out"
        onPress={signOut}
        variant="ghost"
      />
    </Screen>
  );
}
