import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import RevenueCatUI from 'react-native-purchases-ui';
import { Ionicons } from '@expo/vector-icons';
import { Touchable } from '@/components/primitives/Touchable';
import { Box, Text } from '@/theme/restyleComponents';
import { Button } from '@/components/ui/Button';
import { useSubscriptionStore } from '@/stores/subscriptionStore';

export default function PaywallScreen() {
  const setTier = useSubscriptionStore((s) => s.setTier);
  const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

  const handleDismiss = () => {
    router.back();
  };

  const handleSimulatePro = () => {
    setTier('premium');
    handleDismiss();
  };

  return (
    <View style={styles.container}>
      <Box 
        position="absolute" 
        top={50} 
        right={20} 
        zIndex={10} 
      >
        <Touchable onPress={handleDismiss} hitSlop={15}>
          <Box padding="s" backgroundColor="overlay" borderRadius="full">
            <Ionicons name="close" size={24} color="white" />
          </Box>
        </Touchable>
      </Box>

      {isExpoGo ? (
        <Box flex={1} justifyContent="center" alignItems="center" paddingHorizontal="l">
          <Text style={{ fontSize: 64, lineHeight: 76, textAlign: 'center' }}>✨</Text>
          <Text variant="h1" textAlign="center" marginTop="m" color="primary">
            NurtureAI Pro
          </Text>
          <Text variant="body" textAlign="center" marginTop="s" color="textSecondary">
            Unlimited AI pregnancy consultations, food scanner analysis, and personalized nutrition recommendations.
          </Text>

          <Box marginTop="xl" width="100%" gap="m">
            <Button
              title="Activate Pro (Expo Go Preview Mode)"
              onPress={handleSimulatePro}
              variant="primary"
              size="lg"
            />
            <Button
              title="Close"
              onPress={handleDismiss}
              variant="ghost"
            />
          </Box>
          <Text variant="caption" textAlign="center" marginTop="m" color="textMuted">
            Native In-App Purchases require a development build (`npx expo run:ios`).
          </Text>
        </Box>
      ) : (
        /* Renders the remote configured RevenueCat Paywall in production / dev builds */
        <RevenueCatUI.Paywall
          onPurchaseCompleted={({ customerInfo }) => {
            const activeKeys = Object.keys(customerInfo.entitlements.active);
            if (activeKeys.length > 0) {
              setTier('premium');
              handleDismiss();
            }
          }}
          onRestoreCompleted={({ customerInfo }) => {
            const activeKeys = Object.keys(customerInfo.entitlements.active);
            if (activeKeys.length > 0) {
              setTier('premium');
              handleDismiss();
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
});
