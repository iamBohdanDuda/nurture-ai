import { useEffect } from 'react';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import Purchases from 'react-native-purchases';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';

const API_KEYS = {
  apple: process.env.EXPO_PUBLIC_RC_APPLE_KEY ?? '',
  google: process.env.EXPO_PUBLIC_RC_GOOGLE_KEY ?? '',
  testStore: process.env.EXPO_PUBLIC_RC_TEST_STORE_KEY ?? process.env.RC_API_KEY ?? '',
};

export function useRevenueCat() {
  const user = useAuthStore((s) => s.user);
  const setTier = useSubscriptionStore((s) => s.setTier);

  useEffect(() => {
    async function init() {
      // 1. Determine RevenueCat API Key (Prioritize Test Store API key starting with 'test_')
      const platformKey = Platform.OS === 'ios' ? API_KEYS.apple : API_KEYS.google;
      const testKey = API_KEYS.testStore;

      const isTestStore = testKey.startsWith('test_') || platformKey.startsWith('test_');
      const apiKey = isTestStore ? (testKey.startsWith('test_') ? testKey : platformKey) : platformKey;

      if (!apiKey || apiKey.includes('your_key_here')) {
        console.warn('⚠️ RevenueCat API key is missing or unconfigured.');
        setTier('free');
        return;
      }

      // 2. In Expo Go without a Test Store key, skip native store calls
      const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
      if (isExpoGo && !isTestStore) {
        console.log('ℹ️ Running in Expo Go: Use RevenueCat Test Store Key (test_...) to test in-app purchases.');
        setTier('free');
        return;
      }

      try {
        if (isTestStore) {
          console.log(`🚀 RevenueCat Test Store mode initialized with key: ${apiKey.slice(0, 8)}...`);
        }

        Purchases.configure({ apiKey });

        if (user?.id) {
          await Purchases.logIn(user.id);
        }

        const customerInfo = await Purchases.getCustomerInfo();
        // Every entitlement in this app unlocks Pro (same rule as the chat-orchestrator edge function)
        const isPro = Object.keys(customerInfo.entitlements.active).length > 0;

        setTier(isPro ? 'premium' : 'free');
      } catch (e) {
        // Keep the last known tier: offline at launch shouldn't demote a paying user.
        // The server checks RevenueCat itself, so a stale "premium" can't unlock anything.
        console.warn('RevenueCat Purchases configuration notice:', e);
      }
    }

    init();
  }, [user?.id, setTier]);
}
