import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (mode === 'login' || !allowSignUp) {
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

  return (
    <div style={a.wrapper}>
      <div style={a.card}>
        <div style={a.header}>
          <span style={{ fontSize: 36 }}>📚</span>
          <h1 style={a.title}>StudyHub</h1>
          <p style={a.subtitle}>Your student command center</p>
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
            style={S.input} required
          />
          <input
            type="password" placeholder="Password (min 6 characters)" value={password}
            onChange={e => setPassword(e.target.value)}
            style={S.input} required minLength={6}
          />
          {error && <p style={a.error}>{error}</p>}
          {success && <p style={a.success}>{success}</p>}
          <button type="submit" style={{ ...S.primaryBtn, width: "100%", padding: "12px 18px", fontSize: 14 }} disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {allowSignUp ? (
          <p style={a.toggle}>
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button style={a.link} onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        ) : (
          <p style={a.toggle}>Private instance &mdash; sign-in only.</p>
        )}
      </div>
    </div>
  );
}

const a = {
  wrapper: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#faf8f5", fontFamily: "'DM Sans',sans-serif", padding: 20 },
  card: { background: "#fff", border: "1px solid #e8e0d8", borderRadius: 16, padding: "40px 36px", width: "100%", maxWidth: 400 },
  header: { textAlign: "center", marginBottom: 28 },
  title: { fontFamily: "'DM Serif Display',serif", fontSize: 28, fontWeight: 400, marginTop: 8, color: "#2b2b2b" },
  subtitle: { color: "#888", fontSize: 14, marginTop: 4 },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  error: { color: "#c1121f", fontSize: 13, margin: 0, padding: "6px 10px", background: "#fef2f2", borderRadius: 6 },
  success: { color: "#6b9080", fontSize: 13, margin: 0, padding: "6px 10px", background: "#f0fdf4", borderRadius: 6 },
  toggle: { textAlign: "center", marginTop: 20, fontSize: 13, color: "#888" },
  link: { background: "none", border: "none", color: "#2b2b2b", fontWeight: 700, cursor: "pointer", fontSize: 13, textDecoration: "underline" },
};
