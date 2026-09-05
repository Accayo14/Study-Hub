import { useState } from 'react';
import { useAuth } from '../contexts/auth-context';
import { allowSignUp } from '../lib/supabase';
import { S } from '../styles';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const { signIn, signUp, requestPasswordReset } = useAuth();

  const go = (next) => { setMode(next); setError(''); setSuccess(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (mode === 'forgot') {
      const { error } = await requestPasswordReset(email);
      if (error) setError(error.message);
      else setSuccess('If that email has an account, a reset link is on its way. The link expires in an hour.');
    } else if (mode === 'login' || !allowSignUp) {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
    } else {
      if (!name.trim()) { setError('Please enter your name'); setLoading(false); return; }
      const { data, error } = await signUp(email, password, name.trim());
      if (error) {
        setError(error.message);
      } else if (data?.user && !data.session) {
        setSuccess('Check your email to confirm your account, then sign in.');
        setMode('login');
      }
    }
    setLoading(false);
  };

  const heading = mode === 'forgot' ? 'Reset your password' : 'StudyHub';
  const submitLabel = mode === 'forgot' ? 'Send reset link' : mode === 'login' ? 'Sign In' : 'Create Account';

  return (
    <div style={a.wrapper}>
      <div style={a.card}>
        <div style={a.header}>
          <span style={{ fontSize: 36 }}>📚</span>
          <h1 style={a.title}>{heading}</h1>
          <p style={a.subtitle}>
            {mode === 'forgot'
              ? 'We will email you a link to set a new one.'
              : 'Your student command center'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={a.form}>
          {mode === 'signup' && (
            <input
              type="text" placeholder="Full name" value={name}
              onChange={e => setName(e.target.value)}
              style={S.input}
            />
          )}
          <input
            type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)}
            style={S.input} required autoComplete="email"
          />
          {mode !== 'forgot' && (
            <input
              type="password" placeholder="Password (min 6 characters)" value={password}
              onChange={e => setPassword(e.target.value)}
              style={S.input} required minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          )}
          {error && <p style={a.error}>{error}</p>}
          {success && <p style={a.success}>{success}</p>}
          <button type="submit" style={{ ...S.primaryBtn, width: "100%", padding: "12px 18px", fontSize: 14 }} disabled={loading}>
            {loading ? 'Please wait...' : submitLabel}
          </button>
        </form>

        {mode === 'login' && (
          <p style={a.toggle}>
            <button style={a.link} onClick={() => go('forgot')}>Forgot password?</button>
          </p>
        )}
        {mode === 'forgot' && (
          <p style={a.toggle}>
            <button style={a.link} onClick={() => go('login')}>Back to sign in</button>
          </p>
        )}

        {allowSignUp ? (
          mode !== 'forgot' && (
            <p style={a.toggle}>
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button style={a.link} onClick={() => go(mode === 'login' ? 'signup' : 'login')}>
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          )
        ) : (
          <p style={a.toggle}>Private instance &mdash; sign-in only.</p>
        )}
      </div>
    </div>
  );
}

const a = {
  wrapper: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", background: "var(--bg)", fontFamily: "'DM Sans',sans-serif", padding: 20 },
  card: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "40px 36px", width: "100%", maxWidth: 400 },
  header: { textAlign: "center", marginBottom: 28 },
  title: { fontFamily: "'DM Serif Display',serif", fontSize: 28, fontWeight: 400, marginTop: 8, color: "var(--text)" },
  subtitle: { color: "var(--text-dim)", fontSize: 14, marginTop: 4 },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  error: { color: "var(--danger)", fontSize: 13, margin: 0, padding: "6px 10px", background: "var(--danger-bg)", borderRadius: 6 },
  success: { color: "var(--green)", fontSize: 13, margin: 0, padding: "6px 10px", background: "var(--green-bg)", borderRadius: 6 },
  toggle: { textAlign: "center", marginTop: 14, fontSize: 13, color: "var(--text-dim)" },
  link: { background: "none", border: "none", color: "var(--text)", fontWeight: 700, cursor: "pointer", fontSize: 13, textDecoration: "underline" },
};
