import { createClient } from '@supabase/supabase-js';

const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const configuredAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const fallbackUrl = 'https://example.supabase.co';
const fallbackAnonKey = 'public-anon-key-placeholder';

export const isSupabaseConfigured = Boolean(configuredUrl && configuredAnonKey);

if (!isSupabaseConfigured) {
    console.warn('Supabase credentials missing. App will run in offline-only mode.');
}

export const supabase = createClient(
    isSupabaseConfigured ? configuredUrl : fallbackUrl,
    isSupabaseConfigured ? configuredAnonKey : fallbackAnonKey,
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    }
);
