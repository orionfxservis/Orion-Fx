import { getSupabase, APP_PROJECT_NAME, APP_CATEGORY, isSupabaseConfigured } from '../lib/supabase';
import { Playlist, Song, ThemeId } from '../types';

export interface OrionFxProjectRecord {
  id?: string;
  project_name: string;
  client_name: string;
  category: string;
  description: string;
  technologies: string[] | string;
  project_url: string;
  github_url: string;
  featured_image: string;
  gallery_images?: string[] | string;
  completion_date?: string;
  status: string;
  featured: boolean;
  created_at?: string;
}

export interface MyBeatBoxUserData {
  user_id: string;
  project_name: string;
  user_name: string;
  email: string;
  avatar_url: string;
  theme_id: ThemeId;
  playlists: Playlist[];
  favorite_songs: Song[];
  updated_at?: string;
}

/**
 * Registers or updates MyBeatBox in Orion FX `projects` table
 */
export async function registerOrionFxProject(): Promise<{ success: boolean; data?: any; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Supabase is not configured yet (missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY).' };
  }

  try {
    const projectPayload: OrionFxProjectRecord = {
      project_name: 'MyBeatBox Studio',
      client_name: 'Orion FX',
      category: APP_CATEGORY,
      description: 'Acoustic mobile audio workstation featuring real-time 7-band parametric EQ, personalized playlists, AI recommendations, and offline caching.',
      technologies: ['React 18', 'TypeScript', 'Tailwind CSS', 'Web Audio API', 'Supabase'],
      project_url: 'https://www.orionfx.net/mobile-apps/MyBeatBox/',
      github_url: 'https://github.com/orionfx/mobile-apps/tree/main/MyBeatBox',
      featured_image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
      gallery_images: [],
      completion_date: new Date().toISOString().split('T')[0],
      status: 'Completed',
      featured: true,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('orionfx_projects')
      .upsert(projectPayload, { onConflict: 'project_name' })
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error('Error registering Orion FX project:', err);
    return { success: false, error: err.message || 'Unknown Supabase error' };
  }
}

/**
 * Saves user data (playlists, preferences) separated by project_name: 'mybeatbox'
 */
export async function saveUserDataToSupabase(userData: MyBeatBoxUserData): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Supabase credentials not configured' };
  }

  try {
    const payload = {
      ...userData,
      project_name: APP_PROJECT_NAME,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('mybeatbox_user_data')
      .upsert(payload, { onConflict: 'user_id,project_name' });

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Error saving user data to Supabase:', err);
    return { success: false, error: err.message };
  }
}