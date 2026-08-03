export const APP_NAME = 'NurtureAI';

// Freemium limits
export const FREE_MESSAGE_LIMIT = 10; // per week
export const FREE_PHOTO_LIMIT = 5;    // per week

// Pregnancy
export const PREGNANCY_TOTAL_WEEKS = 40;

// Timing
export const MEMORY_CONDENSE_INTERVAL = 10; // messages before condensing

// Storage keys
export const STORAGE_KEYS = {
  AUTH: 'nurtureai-auth',
  CHAT: 'nurtureai-chat',
  TRACKING: 'nurtureai-tracking',
  SUBSCRIPTION: 'nurtureai-subscription',
  ONBOARDING: 'nurtureai-onboarding',
  UI: 'nurtureai-ui',
} as const;
