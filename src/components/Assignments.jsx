import { useState } from 'react';
import { dueInfo, toISO, P_COLORS, PRIORITIES } from '../constants';
import { SubjectManager, SubjectSelect, SubjectFilter } from './SubjectManager';
import { S } from '../styles';

export default function Assignments({ D, form, setForm, addSubject, removeSubject, addAssignment, toggleAssignment, deleteAssignment, clearDone }) {
  const [filter, setFilter] = useState("all");
  const [showMgr, setShowMgr] = useState(false);
  const pending = D.assignments.filter(a => !a.done);
  const done = D.assignments.filter(a => a.done);
  const filtered = filter === "all" ? pending : pending.filter(a => a.subject === filter);
  const sorted = [...filtered].sort((a, b) => new Date(a.due) - new Date(b.due));

  return (
    <div style={S.page}>
      {showMgr && <SubjectManager subjects={D.subjects} addSubject={addSubject} removeSubject={removeSubject} onClose={() => setShowMgr(false)} />}
      <div style={S.pageHead}><h1 style={S.pageTitle}>Assignments</h1>
        <button style={S.primaryBtn} onClick={() => setForm(form === "assignment" ? null : "assignment")}>{form === "assignment" ? "✕ Cancel" : "+ Add"}</button>
      </div>
      {form === "assignment" && <AssignmentForm subjects={D.subjects} onAdd={a => { addAssignment(a); setForm(null); }} />}
      <SubjectFilter subjects={D.subjects} filter={filter} setFilter={setFilter} onManage={() => setShowMgr(true)} />
      {sorted.length === 0 && <p style={S.empty}>No pending assignments. 🎉</p>}
      <div style={S.list}>
        {sorted.map(a => {
          const di = dueInfo(a.due);
          return (
            <div key={a.id} style={S.card}>
              <button style={S.checkBtn} onClick={() => toggleAssignment(a.id)}>○</button>
              <div style={{ flex: 1 }}>
                <div style={S.cardName}>{a.name}</div>
                <div style={S.cardMeta}>
                  <span style={{ ...S.badge, background: P_COLORS[a.priority] }}>{a.priority}</span>
                  <span style={S.tagSmall}>{a.subject}</span>
                  <span style={{ ...S.dueTxt, color: di.cls === "overdue" ? "#c1121f" : di.cls === "today" ? "#e07a5f" : "#888" }}>{di.text}</span>
                </div>
                {a.description && <div style={S.cardDesc}>{a.description}</div>}
              </div>
              <button style={S.xBtn} onClick={() => deleteAssignment(a.id)}>✕</button>
            </div>
          );
        })}
      </div>
      {done.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div style={S.doneHead}>
            <h2 style={S.secTitle}>✓ Completed ({done.length})</h2>
            <button style={S.ghostBtn} onClick={clearDone}>Clear</button>
          </div>
          {done.map(a => (
            <div key={a.id} style={{ ...S.card, opacity: 0.45 }}>
              <button style={{ ...S.checkBtn, color: "#6b9080" }} onClick={() => toggleAssignment(a.id)}>●</button>
              <div style={{ flex: 1, textDecoration: "line-through" }}><div style={S.cardName}>{a.name}</div></div>
              <button style={S.xBtn} onClick={() => deleteAssignment(a.id)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AssignmentForm({ subjects, onAdd }) {
  const [f, setF] = useState({ name: "", subject: subjects[0] || "", priority: "Medium", due: toISO(new Date(Date.now() + 7 * 864e5)), description: "" });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <div style={S.formCard}>
      <input style={S.input} placeholder="Assignment name..." value={f.name} onChange={e => set("name", e.target.value)} autoFocus />
      <div style={S.fRow}>
        <SubjectSelect subjects={subjects} value={f.subject} onChange={v => set("subject", v)} />
        <select style={S.select} value={f.priority} onChange={e => set("priority", e.target.value)}>{PRIORITIES.map(p => <option key={p}>{p}</option>)}</select>
        <input style={S.input} type="date" value={f.due} onChange={e => set("due", e.target.value)} />
      </div>
      <textarea style={{ ...S.input, minHeight: 44 }} placeholder="Description (optional)..." value={f.description} onChange={e => set("description", e.target.value)} />
      <button style={S.primaryBtn} onClick={() => { if (f.name.trim()) onAdd({ ...f, name: f.name.trim() }); }}>Add Assignment</button>
    </div>
  );
}
