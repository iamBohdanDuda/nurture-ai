import React from 'react';
import { Image, Alert } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import RevenueCatUI from 'react-native-purchases-ui';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/layout/Screen';
import { Box, Text, Card } from '@/theme/restyleComponents';
import { Touchable } from '@/components/primitives/Touchable';
import { GradientBadge } from '@/components/ui/GradientComponents';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { usePregnancyWeek } from '@/hooks/usePregnancyWeek';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatDate } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { type Theme, GRADIENTS } from '@/theme/theme';

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

  const isPremium = tier === 'premium';

  const menuItems = [
    { icon: 'card-outline' as const, label: 'Pregnancy Card', route: '/(modals)/pregnancy-card', color: theme.colors.primary, bg: theme.colors.primaryLight },
    { icon: 'settings-outline' as const, label: 'Settings', route: '/(modals)/settings', color: theme.colors.accent, bg: theme.colors.accentLight },
  ];

  return (
    <Screen scrollable safeTop padded={false} backgroundColor="mainBackground">
      {/* Profile Header */}
      <Box
        alignItems="center"
        paddingTop="m"
        paddingBottom="l"
        paddingHorizontal="m"
      >
        {/* Avatar */}
        <Touchable onPress={handlePickAvatar} activeScale={0.95} accessibilityLabel="Change profile picture">
          <Box style={{ position: 'relative' }}>
            <Box
              width={96}
              height={96}
              borderRadius="full"
              borderWidth={3}
              borderColor="surfaceElevated"
              backgroundColor="primaryLight"
              alignItems="center"
              justifyContent="center"
              overflow="hidden"
              style={{
                shadowColor: theme.colors.shadow,
                shadowOpacity: 0.1,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 12,
                elevation: 3,
              }}
            >
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={{ width: 96, height: 96, borderRadius: 48 }}
                />
              ) : (
                <Box
                  width={96}
                  height={96}
                  borderRadius="full"
                  backgroundColor="primaryLight"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text variant="h1" color="primary" fontFamily="Inter_700Bold">
                    {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'M'}
                  </Text>
                </Box>
              )}
            </Box>

            {/* Camera badge */}
            <Box
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: theme.colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: '#FFFFFF',
              }}
            >
              <Ionicons name="camera" size={15} color="#FFFFFF" />
            </Box>
          </Box>
        </Touchable>

        <Text variant="h2" color="textPrimary" marginTop="m" fontFamily="Inter_700Bold">
          {user?.first_name ?? 'Mama'}
        </Text>
        <Text variant="bodySmall" color="textSecondary" marginTop="xs">
          {user?.email ?? ''}
        </Text>

        {/* Subscription Badge */}
        <Box marginTop="s">
          {isPremium ? (
            <Box
              backgroundColor="goldLight"
              paddingHorizontal="m"
              paddingVertical="xs"
              borderRadius="full"
              borderWidth={1}
              borderColor="border"
              flexDirection="row"
              alignItems="center"
            >
              <Ionicons name="sparkles" size={13} color={theme.colors.gold} style={{ marginRight: 5 }} />
              <Text variant="caption" color="textPrimary" fontFamily="Inter_700Bold">
                Nurture Pro Member
              </Text>
            </Box>
          ) : (
            <Box
              backgroundColor="warmSurfaceSoft"
              borderRadius="full"
              paddingHorizontal="m"
              paddingVertical="xs"
              borderWidth={1}
              borderColor="border"
              flexDirection="row"
              alignItems="center"
            >
              <Ionicons name="leaf-outline" size={13} color={theme.colors.secondary} style={{ marginRight: 5 }} />
              <Text variant="caption" color="secondary" fontFamily="Inter_600SemiBold">
                Free Plan
              </Text>
            </Box>
          )}
        </Box>
      </Box>

      <Box paddingHorizontal="m">
        {/* Pregnancy Timeline Card */}
        <Card
          variant="elevated"
          marginBottom="m"
          padding="l"
          style={{ borderRadius: 24, backgroundColor: '#FFFFFF' }}
        >
          <Box flexDirection="row" justifyContent="space-between" alignItems="center">
            <Box alignItems="center">
              <Text variant="caption" color="textMuted" style={{ textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.8 }}>
                CURRENT WEEK
              </Text>
              <Text variant="statValue" color="primary" marginTop="xs">
                {currentWeek}
              </Text>
            </Box>

            {/* Timeline connector */}
            <Box flex={1} marginHorizontal="m" alignItems="center">
              <Box
                width="100%"
                height={4}
                backgroundColor="border"
                borderRadius="full"
                overflow="hidden"
              >
                <LinearGradient
                  colors={GRADIENTS.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ flex: 1, borderRadius: 9999 }}
                />
              </Box>
            </Box>

            <Box alignItems="center">
              <Text variant="caption" color="textMuted" style={{ textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.8 }}>
                ESTIMATED DUE
              </Text>
              <Text variant="statValue" color="coral" marginTop="xs">
                {dueDate ? formatDate(dueDate, 'MMM d') : '—'}
              </Text>
            </Box>
          </Box>
        </Card>

        {/* Inset Grouped Settings List (Apple HIG style) */}
        <Box
          backgroundColor="surfaceElevated"
          borderRadius="xl"
          borderWidth={1}
          borderColor="border"
          overflow="hidden"
          marginBottom="m"
          style={{
            shadowColor: theme.colors.shadow,
            shadowOpacity: 0.04,
            shadowOffset: { width: 0, height: 3 },
            shadowRadius: 10,
            elevation: 2,
          }}
        >
          {menuItems.map((item, index) => (
            <Touchable key={item.label} onPress={() => router.push(item.route as any)}>
              <Box
                flexDirection="row"
                alignItems="center"
                paddingHorizontal="m"
                paddingVertical="m"
                borderBottomWidth={1}
                borderBottomColor="border"
              >
                <Box
                  width={38}
                  height={38}
                  borderRadius="m"
                  alignItems="center"
                  justifyContent="center"
                  style={{ backgroundColor: item.bg }}
                >
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </Box>
                <Text variant="body" marginLeft="m" flex={1} fontFamily="Inter_500Medium">
                  {item.label}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
              </Box>
            </Touchable>
          ))}

          {/* Subscription Row */}
          <Touchable 
            onPress={() => {
              if (isPremium) {
                RevenueCatUI.presentCustomerCenter();
              } else {
                router.push('/(modals)/paywall');
              }
            }}
          >
            <Box
              flexDirection="row"
              alignItems="center"
              paddingHorizontal="m"
              paddingVertical="m"
            >
              <Box
                width={38}
                height={38}
                borderRadius="m"
                alignItems="center"
                justifyContent="center"
                style={{
                  backgroundColor: isPremium ? theme.colors.goldLight : theme.colors.primaryLight,
                }}
              >
                <Ionicons
                  name={isPremium ? 'sparkles' : 'diamond-outline'}
                  size={20}
                  color={isPremium ? theme.colors.gold : theme.colors.primary}
                />
              </Box>
              <Text variant="body" marginLeft="m" flex={1} fontFamily="Inter_500Medium">
                {isPremium ? 'Manage Membership' : 'Upgrade to Nurture Pro'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </Box>
          </Touchable>
        </Box>

        {/* Sign Out */}
        <Touchable onPress={signOut} activeScale={0.97}>
          <Box
            alignItems="center"
            paddingVertical="m"
            marginBottom="xl"
          >
            <Text variant="bodySmall" color="textMuted">
              Sign Out
            </Text>
          </Box>
        </Touchable>
      </Box>
    </Screen>
  );
}
