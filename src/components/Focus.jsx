import { useState, useEffect, useRef } from 'react';
import { S } from '../styles';

export default function Focus({ D, updatePomodoro }) {
  const [mode, setMode] = useState("work");
  const [left, setLeft] = useState(D.pomodoro.work * 60);
  const [on, setOn] = useState(false);
  const [sess, setSess] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [workMin, setWorkMin] = useState(D.pomodoro.work);
  const [breakMin, setBreakMin] = useState(D.pomodoro.break);
  const ref = useRef(null);

  useEffect(() => {
    if (on) {
      ref.current = setInterval(() => {
        setLeft(t => {
          if (t <= 1) {
            clearInterval(ref.current);
            setOn(false);
            if (mode === "work") { setSess(s => s + 1); setMode("break"); return D.pomodoro.break * 60; }
            else { setMode("work"); return D.pomodoro.work * 60; }
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(ref.current);
  }, [on, mode, D.pomodoro]);

  const reset = () => { setOn(false); setMode("work"); setLeft(D.pomodoro.work * 60); };

  const saveSettings = () => {
    const w = Math.max(1, Math.min(120, workMin || 25));
    const b = Math.max(1, Math.min(30, breakMin || 5));
    updatePomodoro({ work: w, break: b });
    setWorkMin(w);
    setBreakMin(b);
    if (!on) { setMode("work"); setLeft(w * 60); }
    setShowSettings(false);
  };

  const m = Math.floor(left / 60), s = left % 60;
  const total = mode === "work" ? D.pomodoro.work * 60 : D.pomodoro.break * 60;
  const pct = ((total - left) / total) * 100;

  return (
    <div style={S.page}>
      <div style={S.pageHead}>
        <h1 style={S.pageTitle}>Focus Timer</h1>
        <button style={S.ghostBtn} onClick={() => setShowSettings(!showSettings)}>
          {showSettings ? "✕ Close" : "⚙ Settings"}
        </button>
      </div>
      <div style={S.timerWrap}>
        <div style={S.timerRing}>
          <svg viewBox="0 0 200 200" style={{ width: 220, height: 220 }}>
            <circle cx="100" cy="100" r="90" fill="none" stroke="var(--border)" strokeWidth="6" />
            <circle cx="100" cy="100" r="90" fill="none" stroke={mode === "work" ? "var(--danger)" : "var(--green)"}
              strokeWidth="6" strokeDasharray={565.5} strokeDashoffset={565.5 - (pct / 100) * 565.5}
              strokeLinecap="round" transform="rotate(-90 100 100)" style={{ transition: "stroke-dashoffset 0.5s" }} />
          </svg>
          <div style={S.timerInner}>
            <div style={S.timerLabel}>{mode === "work" ? "FOCUS" : "BREAK"}</div>
            <div style={S.timerDigits}>{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}</div>
          </div>
        </div>
        <div style={S.timerBtns}>
          <button style={S.timerBtn} onClick={() => setOn(!on)}>{on ? "⏸ Pause" : "▶ Start"}</button>
          <button style={S.ghostBtn} onClick={reset}>↺ Reset</button>
        </div>
        <div style={S.sessCount}>Sessions: <strong>{sess}</strong></div>
      </div>

      {showSettings && (
        <div style={S.settingsPanel}>
          <h3 style={{ ...S.secTitle, fontSize: 16 }}>Timer Settings</h3>
          <div style={S.settingsRow}>
            <span style={S.settingsLabel}>Focus duration</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input type="number" style={S.settingsInput} value={workMin}
                onChange={e => setWorkMin(+e.target.value)} min={1} max={120} />
              <span style={{ fontSize: 12, color: "var(--text-dim)" }}>min</span>
            </div>
          </div>
          <div style={S.settingsRow}>
            <span style={S.settingsLabel}>Break duration</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input type="number" style={S.settingsInput} value={breakMin}
                onChange={e => setBreakMin(+e.target.value)} min={1} max={30} />
              <span style={{ fontSize: 12, color: "var(--text-dim)" }}>min</span>
            </div>
          </div>
          <button style={{ ...S.primaryBtn, width: "100%", marginTop: 12 }} onClick={saveSettings}>Save Settings</button>
        </div>
      )}
    </div>
  );
}
