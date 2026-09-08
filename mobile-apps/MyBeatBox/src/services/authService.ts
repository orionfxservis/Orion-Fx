import { getSupabase } from '../lib/supabase';
import { UserAccount } from '../types';

// Default guest user state — used when no one is signed in
export const GUEST_USER: UserAccount & { bio?: string } = {
  uid: 'guest',
  name: 'Guest',
  email: '',
  avatar: '',
  favoriteGenres: [],
  bio: '',
};

/**
 * Maps a Supabase auth user object to the app's UserAccount shape.
 * Extracts Google profile data (name, email, avatar) from user_metadata.
 */
export function mapSupabaseUserToApp(supabaseUser: any): UserAccount & { bio?: string } {
  const meta = supabaseUser.user_metadata || {};
  return {
    uid: supabaseUser.id,
    name: meta.full_name || meta.name || 'BeatBox User',
    email: supabaseUser.email || '',
    avatar: meta.avatar_url || meta.picture || '',
    favoriteGenres: ['Electronic', 'Chill'],
    bio: 'Music enthusiast on MyBeatBox.',
  };
}

/**
 * Sign in with Google via Supabase OAuth.
 * Redirects the user to Google's consent screen.
 */
export async function signInWithGoogle(): Promise<{ error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { error: 'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.' };
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + window.location.pathname,
    },
  });

  if (error) {
    console.error('Google sign-in error:', error);
    return { error: error.message };
  }

  return {};
}

/**
 * Sign out the current user via Supabase.
 */
export async function signOut(): Promise<{ error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { error: 'Supabase is not configured.' };
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign-out error:', error);
    return { error: error.message };
  }

  // Clear any cached user ID from legacy login system
  localStorage.removeItem('syncbeat_uid');

  return {};
}

/**
 * Get the current active Supabase session (returns null if not logged in).
 */
export async function getSession() {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Subscribe to auth state changes (sign-in, sign-out, token refresh).
 * Returns an unsubscribe function.
 */
export function onAuthStateChange(callback: (event: string, session: any) => void): (() => void) | null {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
}
