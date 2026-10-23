import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Purchases, { type PurchasesOffering } from 'react-native-purchases';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { Touchable } from '@/components/primitives/Touchable';
import { Box, Text } from '@/theme/restyleComponents';
import { Button } from '@/components/ui/Button';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { type Theme, GRADIENTS } from '@/theme/theme';

interface FeatureItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}

const PRO_FEATURES: FeatureItem[] = [
  {
    icon: 'chatbubble-ellipses',
    title: 'Unlimited AI Consultations',
    subtitle: '24/7 empathetic obstetric advice & symptom reassurance',
  },
  {
    icon: 'camera',
    title: 'Smart Meal & Nutrition Scanner',
    subtitle: 'Instant food safety checks, macros & micronutrient breakdown',
  },
  {
    icon: 'fitness',
    title: 'Clinical Kick & Contraction Logs',
    subtitle: 'Track fetal movement velocity & export charts for your OB-GYN',
  },
  {
    icon: 'sparkles',
    title: 'Tailored Week-by-Week Roadmap',
    subtitle: 'Personalized clinical milestones & doctor-vetted advice',
  },
];

export default function PaywallScreen() {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const setTier = useSubscriptionStore((s) => s.setTier);

  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);

  useEffect(() => {
    Purchases.getOfferings()
      .then((o) => setOffering(o.current))
      .catch(() => {}); // not configured (Expo Go / dev): keep the preview prices
  }, []);

  // Prices and trial come from the store; the fallbacks only preview the design without RevenueCat
  const annual = offering?.annual?.product;
  const monthly = offering?.monthly?.product;
  const annualPrice = annual?.priceString ?? '$59.99';
  const annualPerMonth = annual?.pricePerMonthString ?? '$4.99';
  const monthlyPrice = monthly?.priceString ?? '$8.99';
  const savePercent = annual && monthly ? Math.round((1 - annual.price / (monthly.price * 12)) * 100) : 45;
  const intro = annual?.introPrice;
  const trial = !offering
    ? '7 days'
    : intro?.price === 0
      ? `${intro.periodNumberOfUnits} ${intro.periodUnit.toLowerCase()}${intro.periodNumberOfUnits === 1 ? '' : 's'}`
      : null;

  const handleDismiss = () => {
    router.back();
  };

  // Tier only ever comes from RevenueCat's active entitlements, never from a button press.
  const syncTier = async () => {
    const info = await Purchases.getCustomerInfo();
    const isPro = Object.keys(info.entitlements.active).length > 0;
    setTier(isPro ? 'premium' : 'free');
    return isPro;
  };

  const handleSubscribe = async () => {
    try {
      // ponytail: dev-only shortcut to preview Pro UI when RevenueCat isn't configured
      if (__DEV__ && !(await Purchases.isConfigured())) {
        setTier('premium');
        return handleDismiss();
      }
      const offering = (await Purchases.getOfferings()).current;
      const pkg = selectedPlan === 'annual' ? offering?.annual : offering?.monthly;
      if (!pkg) throw new Error('This plan is not available right now.');
      await Purchases.purchasePackage(pkg);
      if (await syncTier()) handleDismiss();
    } catch (err: any) {
      if (!err?.userCancelled) Alert.alert('Purchase failed', err?.message ?? 'Please try again later.');
    }
  };

  const handleRestore = async () => {
    try {
      await Purchases.restorePurchases();
      if (await syncTier()) return handleDismiss();
      Alert.alert('No subscription found', 'There is no active Nurture Pro subscription for this account.');
    } catch (err: any) {
      Alert.alert('Restore failed', err?.message ?? 'Please try again later.');
    }
  };

  // If in custom preview (or Expo Go), render the bespoke high-craft design
  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#FFF5F7', '#FFFDF9', '#FFFFFF']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Floating Top Dismiss Button */}
      <Box
        position="absolute"
        left={20}
        zIndex={20}
        style={{ top: Math.max(insets.top + 8, 20) }}
      >
        <Touchable
          onPress={handleDismiss}
          hitSlop={14}
          accessibilityLabel="Close subscription paywall"
        >
          <Box
            width={34}
            height={34}
            borderRadius="full"
            backgroundColor="warmSurfaceSoft"
            borderWidth={1}
            borderColor="border"
            alignItems="center"
            justifyContent="center"
          >
            <Ionicons name="close" size={20} color={theme.colors.textPrimary} />
          </Box>
        </Touchable>
      </Box>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: Math.max(insets.top + 16, 32),
          paddingBottom: Math.max(insets.bottom + 24, 40),
          paddingHorizontal: 20,
        }}
      >
        {/* Brand & Badge Header */}
        <Box alignItems="center" marginTop="m" marginBottom="l">
          <LinearGradient
            colors={GRADIENTS.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoBadge}
          >
            <Ionicons name="sparkles" size={24} color="#FFFFFF" />
          </LinearGradient>

          <Box
            backgroundColor="secondaryLight"
            borderRadius="full"
            paddingHorizontal="m"
            paddingVertical="xs"
            marginTop="m"
            marginBottom="s"
          >
            <Text
              variant="caption"
              color="secondary"
              fontFamily="Inter_700Bold"
              style={{ fontSize: 11, letterSpacing: 1 }}
            >
              NURTURE+ CLINICAL PASS
            </Text>
          </Box>

          <Text
            variant="h1"
            textAlign="center"
            color="textPrimary"
            style={{ fontSize: 28, lineHeight: 34 }}
          >
            Empower Your Pregnancy with Confident Care
          </Text>

          <Text
            variant="body"
            textAlign="center"
            color="textSecondary"
            marginTop="xs"
            style={{ maxWidth: 300 }}
          >
            Complete AI guidance, personalized safety checks, and continuous wellness tracking.
          </Text>
        </Box>

        {/* Feature Highlights Grid */}
        <Box
          backgroundColor="surfaceElevated"
          borderRadius="2xl"
          padding="m"
          borderWidth={1}
          borderColor="border"
          marginBottom="l"
          style={styles.featureCard}
        >
          {PRO_FEATURES.map((feat, idx) => {
            const isLast = idx === PRO_FEATURES.length - 1;
            return (
              <Box key={feat.title}>
                <Box flexDirection="row" alignItems="flex-start" paddingVertical="s">
                  <Box
                    width={38}
                    height={38}
                    borderRadius="full"
                    backgroundColor="warmSurfaceSoft"
                    borderWidth={1}
                    borderColor="border"
                    alignItems="center"
                    justifyContent="center"
                    marginRight="m"
                  >
                    <Ionicons name={feat.icon} size={20} color={theme.colors.primary} />
                  </Box>
                  <Box flex={1}>
                    <Text variant="body" fontFamily="Inter_700Bold" color="textPrimary">
                      {feat.title}
                    </Text>
                    <Text
                      variant="caption"
                      color="textSecondary"
                      marginTop="xs"
                      style={{ lineHeight: 16 }}
                    >
                      {feat.subtitle}
                    </Text>
                  </Box>
                </Box>
                {!isLast && <Box height={1} backgroundColor="border" my="xs" />}
              </Box>
            );
          })}
        </Box>

        {/* Plan Selection Cards */}
        <Box gap="s" marginBottom="l">
          {/* Annual Plan (Best Value) */}
          <Touchable onPress={() => setSelectedPlan('annual')}>
            <Box
              backgroundColor="surfaceElevated"
              borderRadius="xl"
              padding="m"
              borderWidth={selectedPlan === 'annual' ? 2 : 1}
              borderColor={selectedPlan === 'annual' ? 'primary' : 'border'}
              style={[
                styles.planCard,
                selectedPlan === 'annual' && styles.selectedPlanCard,
              ]}
            >
              <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                <Box flexDirection="row" alignItems="center" flex={1}>
                  <Box
                    width={20}
                    height={20}
                    borderRadius="full"
                    borderWidth={selectedPlan === 'annual' ? 6 : 2}
                    borderColor={selectedPlan === 'annual' ? 'primary' : 'border'}
                    backgroundColor="white"
                    marginRight="m"
                  />
                  <Box>
                    <Box flexDirection="row" alignItems="center" gap="xs">
                      <Text variant="body" fontFamily="Inter_700Bold" color="textPrimary">
                        Annual Access
                      </Text>
                      {savePercent > 0 && (
                        <Box
                          backgroundColor="peachSubtle"
                          borderRadius="full"
                          paddingHorizontal="s"
                          paddingVertical="xs"
                        >
                          <Text
                            variant="caption"
                            color="coral"
                            fontFamily="Inter_700Bold"
                            style={{ fontSize: 9 }}
                          >
                            SAVE {savePercent}%
                          </Text>
                        </Box>
                      )}
                    </Box>
                    <Text variant="caption" color="textMuted" marginTop="xs">
                      {annualPerMonth} / month · Billed {annualPrice} annually
                    </Text>
                  </Box>
                </Box>

                <Box alignItems="flex-end">
                  <Text variant="body" fontFamily="Inter_700Bold" color="primaryDark">
                    {trial ? `${trial} free` : annualPrice}
                  </Text>
                  <Text variant="caption" color="textMuted">
                    {trial ? `Then ${annualPrice}/yr` : 'per year'}
                  </Text>
                </Box>
              </Box>
            </Box>
          </Touchable>

          {/* Monthly Plan */}
          <Touchable onPress={() => setSelectedPlan('monthly')}>
            <Box
              backgroundColor="surfaceElevated"
              borderRadius="xl"
              padding="m"
              borderWidth={selectedPlan === 'monthly' ? 2 : 1}
              borderColor={selectedPlan === 'monthly' ? 'primary' : 'border'}
              style={[
                styles.planCard,
                selectedPlan === 'monthly' && styles.selectedPlanCard,
              ]}
            >
              <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                <Box flexDirection="row" alignItems="center" flex={1}>
                  <Box
                    width={20}
                    height={20}
                    borderRadius="full"
                    borderWidth={selectedPlan === 'monthly' ? 6 : 2}
                    borderColor={selectedPlan === 'monthly' ? 'primary' : 'border'}
                    backgroundColor="white"
                    marginRight="m"
                  />
                  <Box>
                    <Text variant="body" fontFamily="Inter_700Bold" color="textPrimary">
                      Monthly Access
                    </Text>
                    <Text variant="caption" color="textMuted" marginTop="xs">
                      Flexible monthly renewal
                    </Text>
                  </Box>
                </Box>

                <Box alignItems="flex-end">
                  <Text variant="body" fontFamily="Inter_700Bold" color="textPrimary">
                    {monthlyPrice}
                  </Text>
                  <Text variant="caption" color="textMuted">
                    per month
                  </Text>
                </Box>
              </Box>
            </Box>
          </Touchable>
        </Box>

        {/* Action Button */}
        <Box gap="s" marginBottom="m">
          <Button
            title={
              selectedPlan === 'annual'
                ? trial ? 'Start Free Trial' : `Subscribe for ${annualPrice}/year`
                : `Subscribe for ${monthlyPrice}/month`
            }
            onPress={handleSubscribe}
            variant="primary"
            size="lg"
          />

          <Text
            variant="caption"
            textAlign="center"
            color="textMuted"
            style={{ fontSize: 11, lineHeight: 15 }}
          >
            No commitment. Cancel anytime in App Store settings with one tap.
          </Text>
        </Box>

        {/* Trust Badges */}
        <Box
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          gap="l"
          paddingVertical="m"
        >
          <Box flexDirection="row" alignItems="center">
            <Ionicons name="shield-checkmark" size={16} color={theme.colors.secondary} style={{ marginRight: 6 }} />
            <Text variant="caption" color="textSecondary" fontFamily="Inter_600SemiBold" style={{ fontSize: 11 }}>
              OB-GYN Reviewed
            </Text>
          </Box>
          <Box flexDirection="row" alignItems="center">
            <Ionicons name="lock-closed" size={14} color={theme.colors.secondary} style={{ marginRight: 6 }} />
            <Text variant="caption" color="textSecondary" fontFamily="Inter_600SemiBold" style={{ fontSize: 11 }}>
              Private & Encrypted
            </Text>
          </Box>
        </Box>

        {/* Footer Links */}
        <Box
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          gap="m"
          marginTop="s"
        >
          <Touchable onPress={handleRestore}>
            <Text variant="caption" color="textMuted" style={{ fontSize: 11, textDecorationLine: 'underline' }}>
              Restore Purchases
            </Text>
          </Touchable>
          <Text variant="caption" color="textMuted">•</Text>
          <Touchable onPress={handleDismiss}>
            <Text variant="caption" color="textMuted" style={{ fontSize: 11 }}>
              Terms of Service
            </Text>
          </Touchable>
          <Text variant="caption" color="textMuted">•</Text>
          <Touchable onPress={handleDismiss}>
            <Text variant="caption" color="textMuted" style={{ fontSize: 11 }}>
              Privacy Policy
            </Text>
          </Touchable>
        </Box>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ED64A6',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 4,
  },
  featureCard: {
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 2,
  },
  planCard: {
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  selectedPlanCard: {
    backgroundColor: '#FFFDFE',
    shadowColor: '#C84E70',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
});
