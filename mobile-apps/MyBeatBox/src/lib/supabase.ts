import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Project Identifier to isolate tables & records in shared Supabase instance
export const APP_PROJECT_NAME = 'mybeatbox';
export const APP_CATEGORY = 'Mobile Application';

const env = (import.meta as any).env || {};
const supabaseUrl: string = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey: string = env.VITE_SUPABASE_ANON_KEY || '';

let client: SupabaseClient | null = null;

/**
 * Returns initialized Supabase client if credentials exist, otherwise null (with safe graceful fallback).
 */
export function getSupabase(): SupabaseClient | null {
  if (client) return client;
  
  if (supabaseUrl && supabaseAnonKey) {
    try {
      client = createClient(supabaseUrl, supabaseAnonKey);
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
    }
  }
  return client;
}

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};