import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Without these the client constructor throws on import and the app renders a
// blank page, so the app checks this first and shows setup instructions instead.
export const isConfigured = Boolean(url && anonKey);

// Sign-ups are hidden unless explicitly opted in, so a deployment defaults to
// "only the accounts that already exist". The real enforcement is Supabase's
// own "allow new users to sign up" setting -- this only controls the UI.
export const allowSignUp = import.meta.env.VITE_ALLOW_SIGNUP === 'true';

export const supabase = isConfigured ? createClient(url, anonKey) : null;
