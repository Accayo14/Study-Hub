import { useState } from 'react';
import { dueInfo, toISO, fmtH } from '../constants';
import { SubjectSelect } from './SubjectManager';
import { S } from '../styles';

export default function Exams({ D, form, setForm, addExam, toggleExam, deleteExam, updateExam, addEvent, deleteEvent, use24h }) {
  const upcoming = D.exams.filter(e => !e.done).sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = D.exams.filter(e => e.done);
  const [expanded, setExpanded] = useState(null);
  const [editing, setEditing] = useState(null);

  const fmtTime = (time) => {
    if (!time) return null;
    const [h, m] = time.split(":").map(Number);
    return fmtH(h, m, use24h);
  };

  const handleAdd = async (e) => {
    await addExam(e);
    // Auto-add to schedule if it has a time
    if (e.time && e.date) {
      const [h, m] = e.time.split(":").map(Number);
      await addEvent({
        name: e.name,
        subject: e.subject,
        eventType: "exam",
        startHour: h,
        startMin: m,
        duration: e.duration || 120,
        recurring: false,
        dayOfWeek: new Date(e.date + "T00:00:00").getDay(),
        date: e.date,
      });
    }
    setForm(null);
  };

  const handleSave = async (id, fields) => {
    const oldExam = D.exams.find(e => e.id === id);
    await updateExam(id, fields);
    // Find and remove the old schedule event for this exam
    if (oldExam) {
      const oldEvents = D.scheduleEvents.filter(ev =>
        ev.eventType === "exam" && ev.name === oldExam.name && ev.subject === oldExam.subject
      );
      for (const ev of oldEvents) await deleteEvent(ev.id);
    }
    // Add updated schedule event if exam has a time
    if (fields.time && fields.date) {
      const [h, m] = fields.time.split(":").map(Number);
      await addEvent({
        name: fields.name,
        subject: fields.subject,
        eventType: "exam",
        startHour: h,
        startMin: m,
        duration: fields.duration || 120,
        recurring: false,
        dayOfWeek: new Date(fields.date + "T00:00:00").getDay(),
        date: fields.date,
      });
    }
    setEditing(null);
  };

  const handleDelete = async (exam) => {
    // Remove schedule event for this exam
    const events = D.scheduleEvents.filter(ev =>
      ev.eventType === "exam" && ev.name === exam.name && ev.subject === exam.subject
    );
    for (const ev of events) await deleteEvent(ev.id);
    await deleteExam(exam.id);
  };

  const formatEndTime = (time, duration) => {
    if (!time || !duration) return null;
    const [h, m] = time.split(":").map(Number);
    const totalMin = h * 60 + m + duration;
    const endH = Math.floor(totalMin / 60) % 24;
    const endM = totalMin % 60;
    return fmtH(endH, endM, use24h);
  };

  return (
    <div style={S.page}>
      <div style={S.pageHead}><h1 style={S.pageTitle}>Exams</h1>
        <button style={S.primaryBtn} onClick={() => { setForm(form === "exam" ? null : "exam"); setEditing(null); }}>
          {form === "exam" && !editing ? "✕ Cancel" : "+ Add Exam"}
        </button>
      </div>
      {(form === "exam" || editing) && (
        <ExamForm subjects={D.subjects} editing={editing}
          onAdd={handleAdd}
          onSave={handleSave}
          onCancel={() => { setEditing(null); setForm(null); }} />
      )}
      {upcoming.length === 0 && !editing && <p style={S.empty}>No upcoming exams. Enjoy the break!</p>}
      <div style={S.list}>
        {upcoming.map(e => {
          const di = dueInfo(e.date);
          const open = expanded === e.id;
          const endTime = formatEndTime(e.time, e.duration);
          return (
            <div key={e.id} style={{ ...S.card, flexDirection: "column", cursor: "pointer" }} onClick={() => setExpanded(open ? null : e.id)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
                <button style={S.checkBtn} onClick={ev => { ev.stopPropagation(); toggleExam(e.id); }}>○</button>
                <div style={{ flex: 1 }}>
                  <div style={S.cardName}>{e.name}</div>
                  <div style={S.cardMeta}>
                    <span style={S.tagSmall}>{e.subject}</span>
                    <span style={{ ...S.dueTxt, color: di.cls === "overdue" ? "var(--danger)" : di.cls === "today" ? "var(--warn)" : "var(--text-dim)" }}>{di.text}</span>
                    {e.time && <span style={{ fontSize: 11, color: "var(--text-dim)" }}>at {fmtTime(e.time)}{endTime ? ` \u2013 ${endTime}` : ""}</span>}
                    {e.duration && <span style={{ fontSize: 10, color: "var(--text-ghost)" }}>({e.duration} min)</span>}
                  </div>
                </div>
                <button style={S.editBtn} onClick={ev => { ev.stopPropagation(); setEditing(e); setForm(null); }} title="Edit">✎</button>
                <span style={{ fontSize: 12, color: "var(--text-ghost)" }}>{open ? "▲" : "▼"}</span>
                <button style={S.xBtn} onClick={ev => { ev.stopPropagation(); handleDelete(e); }}>✕</button>
              </div>
              {open && (
                <div style={S.examDetails}>
                  <div style={S.examRow}><strong>Date:</strong> {new Date(e.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</div>
                  {e.time && <div style={S.examRow}><strong>Time:</strong> {fmtTime(e.time)}{endTime ? ` \u2013 ${endTime}` : ""}</div>}
                  {e.duration && <div style={S.examRow}><strong>Duration:</strong> {e.duration} minutes</div>}
                  {e.venue && <div style={S.examRow}><strong>Venue:</strong> {e.venue}</div>}
                  {e.syllabus && <div style={{ ...S.examRow, whiteSpace: "pre-wrap" }}><strong>Syllabus:</strong> {e.syllabus}</div>}
                  {e.notes && <div style={{ ...S.examRow, whiteSpace: "pre-wrap" }}><strong>Notes:</strong> {e.notes}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {past.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <h2 style={S.secTitle}>✓ Done ({past.length})</h2>
          {past.map(e => (
            <div key={e.id} style={{ ...S.card, opacity: 0.45 }}>
              <button style={{ ...S.checkBtn, color: "var(--green)" }} onClick={() => toggleExam(e.id)}>●</button>
              <div style={{ flex: 1, textDecoration: "line-through" }}><div style={S.cardName}>{e.name}</div></div>
              <button style={S.xBtn} onClick={() => handleDelete(e)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ExamForm({ subjects, editing, onAdd, onSave, onCancel }) {
  // Lazy initialiser: the default exam date reads the clock, which must not run
  // on every render.
  const [f, setF] = useState(() => editing
    ? { name: editing.name, subject: editing.subject, date: editing.date, time: editing.time || '', duration: editing.duration || '', durationMode: editing.duration ? 'duration' : 'endtime', endTime: '', venue: editing.venue || '', syllabus: editing.syllabus || '', notes: editing.notes || '' }
    : { name: "", subject: subjects[0] || "", date: toISO(new Date(Date.now() + 14 * 864e5)), time: "09:00", duration: 120, durationMode: "duration", endTime: "", venue: "", syllabus: "", notes: "" });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  // Calculate duration from end time
  const calcDuration = () => {
    if (f.durationMode === "duration") return f.duration || null;
    if (!f.time || !f.endTime) return null;
    const [sh, sm] = f.time.split(":").map(Number);
    const [eh, em] = f.endTime.split(":").map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return diff > 0 ? diff : null;
  };

  const handleSubmit = () => {
    if (!f.name.trim()) return;
    const duration = calcDuration();
    const fields = { name: f.name.trim(), subject: f.subject, date: f.date, time: f.time, duration: duration || null, venue: f.venue, syllabus: f.syllabus, notes: f.notes };
    if (editing) onSave(editing.id, fields);
    else onAdd(fields);
  };

  return (
    <div style={S.formCard}>
      <input style={S.input} placeholder="Exam name (e.g., Midterm - Calculus II)..." value={f.name} onChange={e => set("name", e.target.value)} autoFocus />
      <div style={S.fRow}>
        <SubjectSelect subjects={subjects} value={f.subject} onChange={v => set("subject", v)} />
        <input style={S.input} type="date" value={f.date} onChange={e => set("date", e.target.value)} />
      </div>
      <div style={S.fRow}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          <label style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 600 }}>Start Time</label>
          <input style={S.input} type="time" value={f.time} onChange={e => set("time", e.target.value)} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 600 }}>End by</label>
          <div style={{ display: "flex", gap: 0, border: "1px solid var(--border-2)", borderRadius: 7, overflow: "hidden" }}>
            <button onClick={() => set("durationMode", "duration")}
              style={{ padding: "6px 10px", border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer", background: f.durationMode === "duration" ? "var(--text)" : "var(--surface)", color: f.durationMode === "duration" ? "var(--bg)" : "var(--text-dim)" }}>
              Duration
            </button>
            <button onClick={() => set("durationMode", "endtime")}
              style={{ padding: "6px 10px", border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer", background: f.durationMode === "endtime" ? "var(--text)" : "var(--surface)", color: f.durationMode === "endtime" ? "var(--bg)" : "var(--text-dim)" }}>
              End Time
            </button>
          </div>
        </div>
        {f.durationMode === "duration" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 600 }}>Minutes</label>
            <select style={S.select} value={f.duration} onChange={e => set("duration", +e.target.value)}>
              {[30, 45, 60, 90, 120, 150, 180, 210, 240].map(d => <option key={d} value={d}>{d} min</option>)}
            </select>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
            <label style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 600 }}>End Time</label>
            <input style={S.input} type="time" value={f.endTime} onChange={e => set("endTime", e.target.value)} />
          </div>
        )}
      </div>
      <input style={S.input} placeholder="Venue (e.g., Hall A, Room 201)..." value={f.venue} onChange={e => set("venue", e.target.value)} />
      <textarea style={{ ...S.input, minHeight: 60 }} placeholder="Syllabus / Topics covered..." value={f.syllabus} onChange={e => set("syllabus", e.target.value)} />
      <textarea style={{ ...S.input, minHeight: 40 }} placeholder="Additional notes..." value={f.notes} onChange={e => set("notes", e.target.value)} />
      <div style={S.fRow}>
        <button style={S.primaryBtn} onClick={handleSubmit}>{editing ? "Save Changes" : "Add Exam"}</button>
        {editing && <button style={S.ghostBtn} onClick={onCancel}>Cancel</button>}
      </div>
    </div>
  );
}
