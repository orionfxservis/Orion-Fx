// Supabase configuration for OrionFx
var SUPABASE_URL = "https://aywuxnimzuqmocjccvbv.supabase.co";
var SUPABASE_ANON_KEY = "sb_publishable_rnxMaJuE7KAjchYt3VN53Q_lYuJQpW7";

// Initialize Supabase Client safely (preventing re-initialization overrides)
if (window.supabase && typeof window.supabase.createClient === 'function') {
  window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
var supabase = window.supabase;
