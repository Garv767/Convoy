import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vltskirgkfvoulcwrvqa.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseAnonKey && supabaseAnonKey !== 'your_supabase_anon_public_key');

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey || 'dummy-anon-key'
);
