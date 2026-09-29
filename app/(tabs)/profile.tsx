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
      {/* Gradient Profile Header */}
      <LinearGradient
        colors={GRADIENTS.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          alignItems: 'center',
          paddingTop: 24,
          paddingBottom: 32,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
        {/* Avatar */}
        <Touchable onPress={handlePickAvatar} activeScale={0.95}>
          <Box style={{ position: 'relative' }}>
            <Box
              width={92}
              height={92}
              borderRadius="full"
              borderWidth={3}
              borderColor="white"
              alignItems="center"
              justifyContent="center"
              overflow="hidden"
              style={{
                shadowColor: '#000',
                shadowOpacity: 0.15,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 10,
              }}
            >
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={{ width: 92, height: 92, borderRadius: 46 }}
                />
              ) : (
                <Box
                  width={92}
                  height={92}
                  borderRadius="full"
                  backgroundColor="primaryLight"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text style={{ fontSize: 44, lineHeight: 54, textAlign: 'center' }}>
                    🤱
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
                width: 30,
                height: 30,
                borderRadius: 15,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: '#FFFFFF',
                overflow: 'hidden',
              }}
            >
              <LinearGradient
                colors={GRADIENTS.primary}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </LinearGradient>
            </Box>
          </Box>
        </Touchable>

        <Text variant="h2" color="textInverse" marginTop="m">
          {user?.first_name ?? 'Mama'}
        </Text>
        <Text variant="bodySmall" color="textInverse" style={{ opacity: 0.8 }}>
          {user?.email ?? ''}
        </Text>

        {/* Subscription Badge */}
        <Box marginTop="s">
          {isPremium ? (
            <GradientBadge preset="gold" style={{ paddingHorizontal: 20, paddingVertical: 8 }}>
              <Text variant="caption" color="textInverse" fontFamily="Inter_700Bold">
                ✨ Nurture Pro
              </Text>
            </GradientBadge>
          ) : (
            <Box
              backgroundColor="surfaceFrosted"
              borderRadius="full"
              paddingHorizontal="m"
              paddingVertical="xs"
            >
              <Text variant="caption" color="secondary" fontFamily="Inter_600SemiBold">
                🌱 Free Plan
              </Text>
            </Box>
          )}
        </Box>
      </LinearGradient>

      <Box paddingHorizontal="m">
        {/* Pregnancy Stats Card with Timeline */}
        <Card
          variant="elevated"
          marginTop="m"
          marginBottom="m"
          style={{ borderRadius: 20 }}
        >
          <Box flexDirection="row" justifyContent="space-between" alignItems="center">
            <Box alignItems="center">
              <Text variant="statLabel" style={{ textTransform: 'uppercase' }}>CURRENT WEEK</Text>
              <Text variant="statValue" color="primary">{currentWeek}</Text>
            </Box>

            {/* Timeline connector */}
            <Box flex={1} marginHorizontal="m" alignItems="center">
              <Box
                width="100%"
                height={3}
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
              <Box
                width={10}
                height={10}
                borderRadius="full"
                backgroundColor="coral"
                style={{ position: 'absolute', right: -2, top: -3.5 }}
              />
            </Box>

            <Box alignItems="center">
              <Text variant="statLabel" style={{ textTransform: 'uppercase' }}>DUE DATE</Text>
              <Text variant="statValue" color="coral">{dueDate ? formatDate(dueDate, 'MMM d') : '—'}</Text>
            </Box>
          </Box>
        </Card>

        {/* Menu Items with colored icon backgrounds */}
        <Box gap="s" marginBottom="m">
          {menuItems.map((item) => (
            <Touchable key={item.label} onPress={() => router.push(item.route as any)}>
              <Card variant="glass" style={{ borderRadius: 16 }}>
                <Box flexDirection="row" alignItems="center">
                  <Box
                    width={40}
                    height={40}
                    borderRadius="m"
                    alignItems="center"
                    justifyContent="center"
                    style={{ backgroundColor: item.bg }}
                  >
                    <Ionicons name={item.icon} size={22} color={item.color} />
                  </Box>
                  <Text variant="body" marginLeft="m" flex={1} fontFamily="Inter_500Medium">
                    {item.label}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                </Box>
              </Card>
            </Touchable>
          ))}

          {/* Subscription Button */}
          <Touchable 
            onPress={() => {
              if (isPremium) {
                RevenueCatUI.presentCustomerCenter();
              } else {
                router.push('/(modals)/paywall');
              }
            }}
          >
            <Card variant="glass" style={{ borderRadius: 16 }}>
              <Box flexDirection="row" alignItems="center">
                <Box
                  width={40}
                  height={40}
                  borderRadius="m"
                  alignItems="center"
                  justifyContent="center"
                  style={{
                    backgroundColor: isPremium ? theme.colors.goldLight : theme.colors.primaryLight,
                  }}
                >
                  <Ionicons
                    name={isPremium ? 'star' : 'diamond-outline'}
                    size={22}
                    color={isPremium ? theme.colors.gold : theme.colors.primary}
                  />
                </Box>
                <Text variant="body" marginLeft="m" flex={1} fontFamily="Inter_500Medium">
                  {isPremium ? 'Manage Subscription' : 'Upgrade to Nurture Pro ✨'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
              </Box>
            </Card>
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
