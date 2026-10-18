import { type Session } from '@supabase/supabase-js';

// Re-export database types
export type { User, ChatMessage, Reminder } from './database';

// Navigation
export type RootStackParamList = {
  '(auth)/login': undefined;
  '(auth)/register': undefined;
  '(auth)/onboarding': undefined;
  '(tabs)/home': undefined;
  '(tabs)/chat': undefined;
  '(tabs)/track': undefined;
  '(tabs)/profile': undefined;
  '(modals)/paywall': undefined;
  '(modals)/pregnancy-card': undefined;
  '(modals)/settings': undefined;
};

// Auth
export interface AuthSession {
  user: {
    id: string;
    email: string;
  };
  session: Session;
}

// Onboarding
export interface OnboardingData {
  firstName: string;
  pregnancyStartDate: Date | null;
  dueDate: Date | null;
  dietaryPreferences: string[];
  healthConditions: string[];
  bloodType?: string;
  emergencyContact?: string;
}

// Chat
export type AIProvider = 'openai' | 'gemini' | 'groq';
export type AIModel = 'gpt-4o-mini' | 'gemini-3.1-flash-lite' | 'openai/gpt-oss-120b' | string;

export interface ChatMessageUI {
  _id: string;
  text: string;
  createdAt: Date;
  user: {
    _id: string | number;
    name?: string;
    avatar?: string;
  };
  image?: string;
  pending?: boolean;
  provider?: AIProvider;
  model?: AIModel | string;
  toolCallHint?: string;
}

// Pregnancy
export interface PregnancyWeekInfo {
  week: number;
  fruitName: string;
  fruitEmoji: string;
  babyLength: string;
  babyWeight: string;
  description: string;
}

// Tracking
export type MetricType = 'weight' | 'calories' | 'water' | 'symptom' | 'vitamin';

export interface DailyMetrics {
  calories: number;
  water: number;
  weight: number | null;
  symptoms: string[];
  vitaminsTaken: string[];
}
