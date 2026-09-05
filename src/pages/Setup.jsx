const missing = [
  !import.meta.env.VITE_SUPABASE_URL && 'VITE_SUPABASE_URL',
  !import.meta.env.VITE_SUPABASE_ANON_KEY && 'VITE_SUPABASE_ANON_KEY',
].filter(Boolean);

/** Shown instead of a blank page when the Supabase environment variables are absent. */
export default function Setup() {
  return (
    <div style={s.wrapper}>
      <div style={s.card}>
        <h1 style={s.title}>StudyHub isn't configured yet</h1>
        <p style={s.body}>
          The app needs a Supabase project to store your data. These environment
          variables are missing:
        </p>
        <ul style={s.list}>
          {missing.map(name => <li key={name} style={s.code}>{name}</li>)}
        </ul>
        <p style={s.body}>
          Copy <span style={s.inline}>.env.example</span> to{' '}
          <span style={s.inline}>.env</span>, fill in the project URL and anon key
          from your Supabase dashboard under <em>Project Settings &rarr; API</em>,
          then restart the dev server.
        </p>
        <p style={s.note}>
          Deploying instead? Add the same variables in your host's environment
          settings and redeploy &mdash; they are read at build time.
        </p>
      </div>
    </div>
  );
}

const s = {
  wrapper: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", background: "var(--bg)", fontFamily: "'DM Sans',sans-serif", padding: 20 },
  card: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "32px 30px", width: "100%", maxWidth: 460 },
  title: { fontFamily: "'DM Serif Display',serif", fontSize: 22, fontWeight: 400, marginBottom: 14, color: "var(--text)" },
  body: { fontSize: 14, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 12 },
  list: { listStyle: "none", display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 },
  code: { fontFamily: "monospace", fontSize: 13, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 10px", color: "var(--danger)" },
  inline: { fontFamily: "monospace", fontSize: 13, background: "var(--divider)", borderRadius: 4, padding: "1px 5px" },
  note: { fontSize: 12.5, color: "var(--text-dim)", lineHeight: 1.6, borderTop: "1px solid var(--border-soft)", paddingTop: 12, marginTop: 4 },
};
