import { useState } from 'react';
import { dueInfo, toISO } from '../constants';
import { SubjectSelect } from './SubjectManager';
import { S } from '../styles';

export default function Exams({ D, form, setForm, addExam, toggleExam, deleteExam }) {
  const upcoming = D.exams.filter(e => !e.done).sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = D.exams.filter(e => e.done);
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={S.page}>
      <div style={S.pageHead}><h1 style={S.pageTitle}>Exams</h1>
        <button style={S.primaryBtn} onClick={() => setForm(form === "exam" ? null : "exam")}>{form === "exam" ? "✕ Cancel" : "+ Add Exam"}</button>
      </div>
      {form === "exam" && <ExamForm subjects={D.subjects} onAdd={e => { addExam(e); setForm(null); }} />}
      {upcoming.length === 0 && <p style={S.empty}>No upcoming exams. Enjoy the break!</p>}
      <div style={S.list}>
        {upcoming.map(e => {
          const di = dueInfo(e.date);
          const open = expanded === e.id;
          return (
            <div key={e.id} style={{ ...S.card, flexDirection: "column", cursor: "pointer" }} onClick={() => setExpanded(open ? null : e.id)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
                <button style={S.checkBtn} onClick={ev => { ev.stopPropagation(); toggleExam(e.id); }}>○</button>
                <div style={{ flex: 1 }}>
                  <div style={S.cardName}>{e.name}</div>
                  <div style={S.cardMeta}>
                    <span style={S.tagSmall}>{e.subject}</span>
                    <span style={{ ...S.dueTxt, color: di.cls === "overdue" ? "#c1121f" : di.cls === "today" ? "#e07a5f" : "#888" }}>{di.text}</span>
                    {e.time && <span style={{ fontSize: 11, color: "#888" }}>at {e.time}</span>}
                  </div>
                </div>
                <span style={{ fontSize: 12, color: "#aaa" }}>{open ? "▲" : "▼"}</span>
                <button style={S.xBtn} onClick={ev => { ev.stopPropagation(); deleteExam(e.id); }}>✕</button>
              </div>
              {open && (
                <div style={S.examDetails}>
                  <div style={S.examRow}><strong>Date:</strong> {new Date(e.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</div>
                  {e.time && <div style={S.examRow}><strong>Time:</strong> {e.time}</div>}
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
              <button style={{ ...S.checkBtn, color: "#6b9080" }} onClick={() => toggleExam(e.id)}>●</button>
              <div style={{ flex: 1, textDecoration: "line-through" }}><div style={S.cardName}>{e.name}</div></div>
              <button style={S.xBtn} onClick={() => deleteExam(e.id)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ExamForm({ subjects, onAdd }) {
  const [f, setF] = useState({ name: "", subject: subjects[0] || "", date: toISO(new Date(Date.now() + 14 * 864e5)), time: "09:00", venue: "", syllabus: "", notes: "" });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <div style={S.formCard}>
      <input style={S.input} placeholder="Exam name (e.g., Midterm - Calculus II)..." value={f.name} onChange={e => set("name", e.target.value)} autoFocus />
      <div style={S.fRow}>
        <SubjectSelect subjects={subjects} value={f.subject} onChange={v => set("subject", v)} />
        <input style={S.input} type="date" value={f.date} onChange={e => set("date", e.target.value)} />
        <input style={S.input} type="time" value={f.time} onChange={e => set("time", e.target.value)} />
      </div>
      <input style={S.input} placeholder="Venue (e.g., Hall A, Room 201)..." value={f.venue} onChange={e => set("venue", e.target.value)} />
      <textarea style={{ ...S.input, minHeight: 60 }} placeholder="Syllabus / Topics covered..." value={f.syllabus} onChange={e => set("syllabus", e.target.value)} />
      <textarea style={{ ...S.input, minHeight: 40 }} placeholder="Additional notes..." value={f.notes} onChange={e => set("notes", e.target.value)} />
      <button style={S.primaryBtn} onClick={() => { if (f.name.trim()) onAdd({ ...f, name: f.name.trim() }); }}>Add Exam</button>
    </div>
  );
}
