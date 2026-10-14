import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vltskirgkfvoulcwrvqa.supabase.co';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseKey &&
  supabaseKey !== 'your_supabase_anon_public_key'
);

export const supabase = createClient(
  supabaseUrl,
  supabaseKey || 'dummy-anon-key'
);
