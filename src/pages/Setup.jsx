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
  wrapper: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", background: "#faf8f5", fontFamily: "'DM Sans',sans-serif", padding: 20 },
  card: { background: "#fff", border: "1px solid #e8e0d8", borderRadius: 16, padding: "32px 30px", width: "100%", maxWidth: 460 },
  title: { fontFamily: "'DM Serif Display',serif", fontSize: 22, fontWeight: 400, marginBottom: 14, color: "#2b2b2b" },
  body: { fontSize: 14, color: "#555", lineHeight: 1.6, marginBottom: 12 },
  list: { listStyle: "none", display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 },
  code: { fontFamily: "monospace", fontSize: 13, background: "#faf8f5", border: "1px solid #e8e0d8", borderRadius: 6, padding: "6px 10px", color: "#c1121f" },
  inline: { fontFamily: "monospace", fontSize: 13, background: "#f4f0ec", borderRadius: 4, padding: "1px 5px" },
  note: { fontSize: 12.5, color: "#888", lineHeight: 1.6, borderTop: "1px solid #f0ece6", paddingTop: 12, marginTop: 4 },
};
