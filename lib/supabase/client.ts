import { createClient } from '@supabase/supabase-js';

// Ensure your .env file has these values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    'Supabase URL not found. Did you set NEXT_PUBLIC_SUPABASE_URL in .env file?'
  );
}
if (!supabaseAnonKey) {
  throw new Error(
    'Supabase anon key not found. Did you set NEXT_PUBLIC_SUPABASE_ANON_KEY in .env file?'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
