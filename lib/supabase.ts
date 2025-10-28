import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type CacheEntry = {
  id: string;
  key: string;
  data: any;
  created_at: string;
  expires_at: string;
};

export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const { data, error } = await supabase
      .from('cache')
      .select('*')
      .eq('key', key)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data.data as T;
  } catch (error) {
    console.error('Error getting cached data:', error);
    return null;
  }
}

export async function setCachedData(key: string, data: any, ttlMinutes: number = 60): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();

    await supabase.from('cache').upsert({
      key,
      data,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error setting cached data:', error);
  }
}

export async function clearExpiredCache(): Promise<void> {
  try {
    await supabase.from('cache').delete().lt('expires_at', new Date().toISOString());
  } catch (error) {
    console.error('Error clearing expired cache:', error);
  }
}
