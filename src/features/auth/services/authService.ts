import { supabase } from '@/config/supabase';
import { type User } from '@/types/database';
import { useAuthStore } from '@/stores/authStore';

export const authService = {
  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signUpWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getUserProfile(userId: string): Promise<User | null> {
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
    const { error } = await supabase
      .from('user_memory')
      .upsert({
        user_id: userId,
        markdown_summary: 'No history yet.',
      });
    if (error) throw error;
  },

  async deleteAccount(userId: string) {
    try {
      await supabase.from('health_metrics').delete().eq('user_id', userId);
      await supabase.from('chat_history').delete().eq('user_id', userId);
      await supabase.from('user_memory').delete().eq('user_id', userId);
      await supabase.from('users').delete().eq('id', userId);
    } catch (err) {
      console.warn('Account row deletion notice:', err);
    } finally {
      await supabase.auth.signOut();
    }
  },
};
