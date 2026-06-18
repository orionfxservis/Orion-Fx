// Supabase configuration for OrionFx
var SUPABASE_URL = "https://aywuxnimzuqmocjccvbv.supabase.co";
var SUPABASE_ANON_KEY = "sb_publishable_rnxMaJuE7KAjchYt3VN53Q_lYuJQpW7";

// Initialize Supabase Client (using var to prevent duplicate declaration clashes)
var supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
var supabase = supabaseClient;
