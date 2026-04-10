import { useState } from 'react';
import { dueInfo, toISO, P_COLORS, PRIORITIES } from '../constants';
import { SubjectManager, SubjectSelect, SubjectFilter } from './SubjectManager';
import { S } from '../styles';

export default function Assignments({ D, form, setForm, addSubject, removeSubject, addAssignment, toggleAssignment, deleteAssignment, clearDone, updateAssignment }) {
  const [filter, setFilter] = useState("all");
  const [showMgr, setShowMgr] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewMode, setViewMode] = useState("assignments"); // "assignments" | "study_plan"

  const allAssign = D.assignments.filter(a => (a.type || 'assignment') === 'assignment');
  const allPlans = D.assignments.filter(a => a.type === 'study_plan');

  const pending = allAssign.filter(a => !a.done);
  const done = allAssign.filter(a => a.done);
  const filtered = filter === "all" ? pending : pending.filter(a => a.subject === filter);
  const sorted = [...filtered].sort((a, b) => new Date(a.due) - new Date(b.due));

  const pendingPlans = allPlans.filter(a => !a.done);
  const donePlans = allPlans.filter(a => a.done);
  const filteredPlans = filter === "all" ? pendingPlans : pendingPlans.filter(a => a.subject === filter);
  const sortedPlans = [...filteredPlans].sort((a, b) => new Date(a.due) - new Date(b.due));

  return (
    <div style={S.page}>
      {showMgr && <SubjectManager subjects={D.subjects} addSubject={addSubject} removeSubject={removeSubject} onClose={() => setShowMgr(false)} />}
      <div style={S.pageHead}><h1 style={S.pageTitle}>Assignments</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={S.primaryBtn} onClick={() => { setForm(form === "assignment" ? null : "assignment"); setEditing(null); }}>
            {form === "assignment" && !editing ? "✕ Cancel" : viewMode === "study_plan" ? "+ Study Plan" : "+ Add"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, border: "1px solid #e0d8d0", borderRadius: 8, overflow: "hidden", marginBottom: 16, width: "fit-content" }}>
        <button onClick={() => { setViewMode("assignments"); setFilter("all"); setEditing(null); setForm(null); }}
          style={{ padding: "7px 16px", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", background: viewMode === "assignments" ? "#2b2b2b" : "#fff", color: viewMode === "assignments" ? "#faf8f5" : "#888" }}>
          Assignments
        </button>
        <button onClick={() => { setViewMode("study_plan"); setFilter("all"); setEditing(null); setForm(null); }}
          style={{ padding: "7px 16px", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", background: viewMode === "study_plan" ? "#2b2b2b" : "#fff", color: viewMode === "study_plan" ? "#faf8f5" : "#888" }}>
          Study Plan
        </button>
      </div>

      {(form === "assignment" || editing) && (
        viewMode === "study_plan"
          ? <StudyPlanForm subjects={D.subjects} editing={editing}
              onAdd={a => { addAssignment({ ...a, type: 'study_plan' }); setForm(null); }}
              onSave={(id, fields) => { updateAssignment(id, fields); setEditing(null); }}
              onCancel={() => { setEditing(null); setForm(null); }} />
          : <AssignmentForm subjects={D.subjects} editing={editing}
              onAdd={a => { addAssignment(a); setForm(null); }}
              onSave={(id, fields) => { updateAssignment(id, fields); setEditing(null); }}
              onCancel={() => { setEditing(null); setForm(null); }} />
      )}

      <SubjectFilter subjects={D.subjects} filter={filter} setFilter={setFilter} onManage={() => setShowMgr(true)} />

      {viewMode === "assignments" ? (
        <>
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
                      {a.time && <span style={{ fontSize: 11, color: "#888" }}>at {a.time}</span>}
                    </div>
                    {a.description && <div style={S.cardDesc}>{a.description}</div>}
                  </div>
                  <button style={S.editBtn} onClick={() => { setEditing(a); setForm(null); }} title="Edit">✎</button>
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
        </>
      ) : (
        <>
          {sortedPlans.length === 0 && <p style={S.empty}>No study plans yet. Plan what to study and when!</p>}
          <div style={S.list}>
            {sortedPlans.map(a => {
              const di = dueInfo(a.due);
              return (
                <div key={a.id} style={{ ...S.card, borderLeft: "3px solid #5e60ce" }}>
                  <button style={S.checkBtn} onClick={() => toggleAssignment(a.id)}>○</button>
                  <div style={{ flex: 1 }}>
                    <div style={S.cardName}>{a.name}</div>
                    <div style={S.cardMeta}>
                      <span style={S.tagSmall}>{a.subject}</span>
                      <span style={{ ...S.dueTxt, color: di.cls === "overdue" ? "#c1121f" : di.cls === "today" ? "#e07a5f" : "#888" }}>{di.text}</span>
                    </div>
                    {a.description && <div style={S.cardDesc}>{a.description}</div>}
                  </div>
                  <button style={S.editBtn} onClick={() => { setEditing(a); setForm(null); }} title="Edit">✎</button>
                  <button style={S.xBtn} onClick={() => deleteAssignment(a.id)}>✕</button>
                </div>
              );
            })}
          </div>
          {donePlans.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <h2 style={S.secTitle}>✓ Completed ({donePlans.length})</h2>
              {donePlans.map(a => (
                <div key={a.id} style={{ ...S.card, opacity: 0.45 }}>
                  <button style={{ ...S.checkBtn, color: "#6b9080" }} onClick={() => toggleAssignment(a.id)}>●</button>
                  <div style={{ flex: 1, textDecoration: "line-through" }}><div style={S.cardName}>{a.name}</div></div>
                  <button style={S.xBtn} onClick={() => deleteAssignment(a.id)}>✕</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AssignmentForm({ subjects, editing, onAdd, onSave, onCancel }) {
  const initial = editing
    ? { name: editing.name, subject: editing.subject, priority: editing.priority, due: editing.due, time: editing.time || '', description: editing.description || '' }
    : { name: "", subject: subjects[0] || "", priority: "Medium", due: toISO(new Date(Date.now() + 7 * 864e5)), time: "", description: "" };
  const [f, setF] = useState(initial);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    if (!f.name.trim()) return;
    const fields = { name: f.name.trim(), subject: f.subject, priority: f.priority, due: f.due, time: f.time || null, description: f.description };
    if (editing) onSave(editing.id, fields);
    else onAdd(fields);
  };

  return (
    <div style={S.formCard}>
      <input style={S.input} placeholder="Assignment name..." value={f.name} onChange={e => set("name", e.target.value)} autoFocus />
      <div style={S.fRow}>
        <SubjectSelect subjects={subjects} value={f.subject} onChange={v => set("subject", v)} />
        <select style={S.select} value={f.priority} onChange={e => set("priority", e.target.value)}>{PRIORITIES.map(p => <option key={p}>{p}</option>)}</select>
      </div>
      <div style={S.fRow}>
        <input style={S.input} type="date" value={f.due} onChange={e => set("due", e.target.value)} />
        <input style={{ ...S.input, maxWidth: 150 }} type="time" value={f.time} onChange={e => set("time", e.target.value)} placeholder="Time (optional)" />
      </div>
      <textarea style={{ ...S.input, minHeight: 44 }} placeholder="Description (optional)..." value={f.description} onChange={e => set("description", e.target.value)} />
      <div style={S.fRow}>
        <button style={S.primaryBtn} onClick={handleSubmit}>{editing ? "Save Changes" : "Add Assignment"}</button>
        {editing && <button style={S.ghostBtn} onClick={onCancel}>Cancel</button>}
      </div>
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
