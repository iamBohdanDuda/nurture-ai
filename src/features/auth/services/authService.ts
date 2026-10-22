import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, invokeFunction } from '@/config/supabase';
import { type User } from '@/types/database';
import { STORAGE_KEYS } from '@/core/constants';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { useTrackingStore } from '@/stores/trackingStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useOnboardingStore } from '@/stores/onboardingStore';

export const authService = {
  async signInWithEmail(email: string, password: string) {
    console.log(`[DB: authService] SIGN IN with email: ${email}`);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signUpWithEmail(email: string, password: string) {
    console.log(`[DB: authService] SIGN UP with email: ${email}`);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    console.log(`[DB: authService] SIGN OUT`);
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    await this.clearLocalData();
  },

  /**
   * Wipes this device's cached chats, memory and health data so the next account can't see them.
   * Keeps only UI preferences.
   */
  async clearLocalData() {
    const keys = (await AsyncStorage.getAllKeys()).filter((k) => k !== STORAGE_KEYS.UI);
    await AsyncStorage.multiRemove(keys);
    useChatStore.setState(useChatStore.getInitialState(), true);
    useTrackingStore.setState(useTrackingStore.getInitialState(), true);
    useSubscriptionStore.setState(useSubscriptionStore.getInitialState(), true);
    useOnboardingStore.setState(useOnboardingStore.getInitialState(), true);
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getUserProfile(userId: string): Promise<User | null> {
    console.log(`[DB: authService] SELECT from users (user: ${userId})`);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createUserProfile(profile: {
    id: string;
    email: string;
    first_name: string;
    pregnancy_start_date: string;
    blood_type?: string | null;
    emergency_contact?: string | null;
  }) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(profile)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err: any) {
      if (err?.message?.includes('blood_type') || err?.message?.includes('emergency_contact') || err?.code === 'PGRST204') {
        console.warn('Supabase users table missing blood_type/emergency_contact column, stripping fields for remote save:', err.message);
        const { blood_type, emergency_contact, ...fallbackProfile } = profile;
        const { data } = await supabase
          .from('users')
          .insert(fallbackProfile)
          .select()
          .single();
        return { ...(data || fallbackProfile), blood_type: profile.blood_type ?? null, emergency_contact: profile.emergency_contact ?? null } as User;
      }
      throw err;
    }
  },

  async updateUserProfile(userId: string, updates: Partial<User>) {
    console.log(`[DB: authService] UPDATE users (user: ${userId})`);
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err: any) {
      if (err?.message?.includes('blood_type') || err?.message?.includes('emergency_contact') || err?.code === 'PGRST204') {
        console.warn('Supabase users table missing blood_type/emergency_contact column, performing local update:', err.message);
        const { blood_type, emergency_contact, ...safeUpdates } = updates;
        let remoteData = null;
        if (Object.keys(safeUpdates).length > 0) {
          const { data } = await supabase
            .from('users')
            .update(safeUpdates)
            .eq('id', userId)
            .select()
            .single();
          remoteData = data;
        }
        const currentUser = useAuthStore.getState().user;
        return {
          ...(currentUser || {}),
          ...(remoteData || {}),
          ...updates,
        } as User;
      }
      throw err;
    }
  },

  async initUserMemory(userId: string) {
    console.log(`[DB: authService] INSERT into user_memory (user: ${userId})`);
    const { error } = await supabase
      .from('user_memory')
      .upsert({
        user_id: userId,
        markdown_summary: 'No history yet.',
      });
    if (error) throw error;
  },

  /**
   * Deletes the auth user and all their data server-side (delete-account Edge Function),
   * then clears this device. Throws if the server delete fails, so the user isn't told it worked.
   */
  async deleteAccount() {
    console.log('[DB: authService] DELETE account');
    await invokeFunction('delete-account', {});
    await supabase.auth.signOut({ scope: 'local' });
    await this.clearLocalData();
  },
};
