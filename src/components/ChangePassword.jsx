import { useState } from 'react';
import { useAuth } from '../contexts/auth-context';
import { S } from '../styles';

/** Sets a new password. Shared by the recovery screen and the account sheet. */
export default function ChangePassword({ submitLabel = 'Update password', onDone }) {
  const { changePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirm) { setError('The two passwords do not match'); return; }

    setBusy(true);
    const { error: err } = await changePassword(password);
    setBusy(false);

    if (err) { setError(err.message); return; }
    setPassword('');
    setConfirm('');
    onDone?.();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input
        type="password" placeholder="New password (min 6 characters)" value={password}
        onChange={e => setPassword(e.target.value)}
        style={S.input} required minLength={6} autoComplete="new-password"
      />
      <input
        type="password" placeholder="Confirm new password" value={confirm}
        onChange={e => setConfirm(e.target.value)}
        style={S.input} required minLength={6} autoComplete="new-password"
      />
      {error && <p style={errorStyle}>{error}</p>}
      <button type="submit" style={{ ...S.primaryBtn, width: '100%', padding: '11px 18px' }} disabled={busy}>
        {busy ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}

const errorStyle = { color: 'var(--danger)', fontSize: 13, margin: 0, padding: '6px 10px', background: 'var(--danger-bg)', borderRadius: 6 };
