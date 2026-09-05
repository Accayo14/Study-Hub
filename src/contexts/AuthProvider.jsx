import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContext } from './auth-context';

// A recovery link arrives as "#access_token=...&type=recovery". supabase-js
// consumes and clears that hash while it establishes the session, so the flag is
// read once at module load rather than later, when it would already be gone.
const arrivedViaRecoveryLink = window.location.hash.includes('type=recovery');

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState(arrivedViaRecoveryLink);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setRecovering(true);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    return { data, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRecovering(false);
  };

  // Sends the reset email. redirectTo must also be listed in the project's
  // Redirect URLs, or Supabase falls back to the Site URL.
  const requestPasswordReset = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    return { error };
  };

  // Works both for a recovery session and for a normally signed-in user.
  const changePassword = async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (!error) setRecovering(false);
    return { error };
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, recovering, signUp, signIn, signOut, requestPasswordReset, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}
