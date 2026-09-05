import { useAuth } from '../contexts/auth-context';
import ChangePassword from '../components/ChangePassword';

/** Shown when the app is opened from a password recovery email. */
export default function ResetPassword() {
  const { user, signOut } = useAuth();

  return (
    <div style={r.wrapper}>
      <div style={r.card}>
        <div style={r.header}>
          <h1 style={r.title}>Set a new password</h1>
          <p style={r.subtitle}>
            {user?.email
              ? <>You are resetting the password for <strong>{user.email}</strong>.</>
              : 'Choose a new password for your account.'}
          </p>
        </div>
        <ChangePassword submitLabel="Save and continue" />
        <p style={r.footer}>
          <button style={r.link} onClick={signOut}>Cancel and sign out</button>
        </p>
      </div>
    </div>
  );
}

const r = {
  wrapper: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", background: "var(--bg)", fontFamily: "'DM Sans',sans-serif", padding: 20 },
  card: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "36px 32px", width: "100%", maxWidth: 400 },
  header: { marginBottom: 22 },
  title: { fontFamily: "'DM Serif Display',serif", fontSize: 24, fontWeight: 400, color: "var(--text)" },
  subtitle: { color: "var(--text-dim)", fontSize: 13.5, marginTop: 8, lineHeight: 1.5 },
  footer: { textAlign: "center", marginTop: 18, fontSize: 13 },
  link: { background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: 13, textDecoration: "underline" },
};
