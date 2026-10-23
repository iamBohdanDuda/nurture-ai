import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, invokeFunction } from '@/config/supabase';
import { type User } from '@/types/database';
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

  /** Wipes this device's cached chats, memory and health data so the next account can't see them. */
  async clearLocalData() {
    await AsyncStorage.multiRemove(await AsyncStorage.getAllKeys());
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
    const { data, error } = await supabase
      .from('users')
      .insert(profile)
      .select()
      .single();
    // A killed earlier attempt already created the row. Update it instead: upsert would need
    // UPDATE on id/email, which clients don't have (20260807000002_lock_users_billing_columns).
    if (error?.code === '23505') {
      const { id, email, ...fields } = profile;
      return this.updateUserProfile(id, fields);
    }
    if (error) throw error;
    return data;
  },

  async updateUserProfile(userId: string, updates: Partial<User>) {
    console.log(`[DB: authService] UPDATE users (user: ${userId})`);
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
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
