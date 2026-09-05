import { useState } from 'react';
import { dueInfo, toISO } from '../constants';
import { SubjectManager, SubjectSelect, SubjectFilter } from './SubjectManager';
import { S } from '../styles';

export default function StudyPlan({ D, form, setForm, addAssignment, toggleAssignment, deleteAssignment, updateAssignment, addSubject, removeSubject }) {
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [showMgr, setShowMgr] = useState(false);

  const allPlans = D.assignments.filter(a => a.type === 'study_plan');
  const pending = allPlans.filter(a => !a.done);
  const done = allPlans.filter(a => a.done);
  const filtered = filter === "all" ? pending : pending.filter(a => a.subject === filter);
  const sorted = [...filtered].sort((a, b) => new Date(a.due) - new Date(b.due));

  // Group by date for a planner-style view
  const grouped = {};
  sorted.forEach(a => {
    const key = a.due;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(a);
  });
  const dateKeys = Object.keys(grouped).sort();

  return (
    <div style={S.page}>
      {showMgr && <SubjectManager subjects={D.subjects} addSubject={addSubject} removeSubject={removeSubject} onClose={() => setShowMgr(false)} />}
      <div style={S.pageHead}>
        <h1 style={S.pageTitle}>Study Plan</h1>
        <button style={{ ...S.primaryBtn, background: "#5e60ce" }} onClick={() => { setForm(form === "studyplan" ? null : "studyplan"); setEditing(null); }}>
          {form === "studyplan" && !editing ? "✕ Cancel" : "+ Add"}
        </button>
      </div>

      {(form === "studyplan" || editing) && (
        <StudyPlanForm subjects={D.subjects} editing={editing}
          onAdd={a => { addAssignment({ ...a, type: 'study_plan' }); setForm(null); }}
          onSave={(id, fields) => { updateAssignment(id, fields); setEditing(null); }}
          onCancel={() => { setEditing(null); setForm(null); }} />
      )}

      <SubjectFilter subjects={D.subjects} filter={filter} setFilter={setFilter} onManage={() => setShowMgr(true)} />

      {dateKeys.length === 0 && <p style={S.empty}>No study plans yet. Plan what topics to study and when!</p>}

      {dateKeys.map(date => {
        const di = dueInfo(date);
        const dateLabel = di.cls === "today" ? "Today" : di.cls === "tomorrow" ? "Tomorrow" : new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        return (
          <div key={date} style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: di.cls === "overdue" ? "#c1121f" : di.cls === "today" ? "#e07a5f" : "#555" }}>{dateLabel}</div>
              {di.cls === "overdue" && <span style={{ fontSize: 10, color: "#c1121f", fontWeight: 600 }}>OVERDUE</span>}
            </div>
            <div style={S.list}>
              {grouped[date].map(a => (
                <div key={a.id} style={{ ...S.card, borderLeft: "3px solid #5e60ce" }}>
                  <button style={S.checkBtn} onClick={() => toggleAssignment(a.id)}>○</button>
                  <div style={{ flex: 1 }}>
                    <div style={S.cardName}>{a.name}</div>
                    <div style={S.cardMeta}>
                      <span style={{ ...S.tagSmall, background: "#e8e0f8", color: "#5e60ce" }}>{a.subject}</span>
                    </div>
                    {a.description && <div style={S.cardDesc}>{a.description}</div>}
                  </div>
                  <button style={S.editBtn} onClick={() => { setEditing(a); setForm(null); }} title="Edit">✎</button>
                  <button style={S.xBtn} onClick={() => deleteAssignment(a.id)}>✕</button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {done.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <h2 style={S.secTitle}>✓ Completed ({done.length})</h2>
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

function StudyPlanForm({ subjects, editing, onAdd, onSave, onCancel }) {
  const initial = editing
    ? { name: editing.name, subject: editing.subject, due: editing.due, description: editing.description || '' }
    : { name: "", subject: subjects[0] || "", due: toISO(new Date()), description: "" };
  const [f, setF] = useState(initial);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    if (!f.name.trim()) return;
    const fields = { name: f.name.trim(), subject: f.subject, priority: "Medium", due: f.due, description: f.description };
    if (editing) onSave(editing.id, fields);
    else onAdd(fields);
  };

  return (
    <div style={{ ...S.formCard, borderLeft: "3px solid #5e60ce" }}>
      <input style={S.input} placeholder="Topic to study (e.g., Integration by Parts)..." value={f.name} onChange={e => set("name", e.target.value)} autoFocus />
      <div style={S.fRow}>
        <SubjectSelect subjects={subjects} value={f.subject} onChange={v => set("subject", v)} />
        <input style={S.input} type="date" value={f.due} onChange={e => set("due", e.target.value)} />
      </div>
      <textarea style={{ ...S.input, minHeight: 40 }} placeholder="Notes (optional)..." value={f.description} onChange={e => set("description", e.target.value)} />
      <div style={S.fRow}>
        <button style={{ ...S.primaryBtn, background: "#5e60ce" }} onClick={handleSubmit}>{editing ? "Save Changes" : "Add to Plan"}</button>
        {editing && <button style={S.ghostBtn} onClick={onCancel}>Cancel</button>}
      </div>
    </div>
  );
}
