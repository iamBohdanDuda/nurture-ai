import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';

const APPLE_KEY = process.env.EXPO_PUBLIC_RC_APPLE_KEY ?? '';
const GOOGLE_KEY = process.env.EXPO_PUBLIC_RC_GOOGLE_KEY ?? '';

export async function initRevenueCat() {
  const apiKey = Platform.OS === 'ios' ? APPLE_KEY : GOOGLE_KEY;

  if (!apiKey || apiKey.includes('your_key')) {
    console.warn('[RevenueCat] No API key configured — running in mock mode');
    return;
  }

  Purchases.configure({ apiKey });
}
