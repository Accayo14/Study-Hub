import { useState } from 'react';
import { HOURS, DAYS, DAYS_FULL, fmtH, toISO, today, isSameDay } from '../constants';
import { SubjectSelect } from './SubjectManager';
import { S } from '../styles';

export default function Schedule({ D, form, setForm, addEvent, deleteEvent, updateEvent, use24h }) {
  const [view, setView] = useState("daily");
  const [refDate, setRefDate] = useState(new Date());
  const [editing, setEditing] = useState(null);

  const nav = (dir) => {
    const d = new Date(refDate);
    if (view === "daily") d.setDate(d.getDate() + dir);
    else if (view === "weekly") d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setRefDate(d);
  };

  const getEventsForDay = (date) => {
    const dow = date.getDay();
    const iso = toISO(date);
    return D.scheduleEvents.filter(ev => {
      if (ev.recurring) return ev.dayOfWeek === dow;
      return ev.date === iso;
    }).sort((a, b) => a.startHour - b.startHour || a.startMin - b.startMin);
  };

  const handleEdit = (ev) => { setEditing(ev); setForm(null); };

  return (
    <div style={S.page}>
      <div style={S.pageHead}><h1 style={S.pageTitle}>Schedule</h1>
        <button style={S.primaryBtn} onClick={() => { setForm(form === "schedule" ? null : "schedule"); setEditing(null); }}>
          {form === "schedule" && !editing ? "✕ Cancel" : "+ Add Event"}
        </button>
      </div>
      {(form === "schedule" || editing) && (
        <ScheduleForm subjects={D.subjects} editing={editing}
          onAdd={e => { addEvent(e); setForm(null); }}
          onSave={(id, fields) => { updateEvent(id, fields); setEditing(null); }}
          onCancel={() => { setEditing(null); setForm(null); }} />
      )}

      <div style={S.schedNav}>
        <div style={S.viewTabs}>
          {["daily", "weekly", "monthly"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ ...S.viewTab, ...(view === v ? S.viewTabActive : {}) }}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        <div style={S.dateNav}>
          <button style={S.arrowBtn} onClick={() => nav(-1)}>‹</button>
          <span style={S.dateLabel}>
            {view === "daily" && refDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            {view === "weekly" && `Week of ${new Date(refDate.getTime() - refDate.getDay() * 864e5).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
            {view === "monthly" && refDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <button style={S.arrowBtn} onClick={() => nav(1)}>›</button>
          <button style={{ ...S.ghostBtn, marginLeft: 8, padding: "4px 12px", fontSize: 12 }} onClick={() => setRefDate(new Date())}>Today</button>
        </div>
      </div>

      {view === "daily" && <DailyView events={getEventsForDay(refDate)} deleteEvent={deleteEvent} onEdit={handleEdit} use24h={use24h} />}
      {view === "weekly" && <WeeklyView refDate={refDate} getEventsForDay={getEventsForDay} deleteEvent={deleteEvent} onEdit={handleEdit} use24h={use24h} />}
      {view === "monthly" && <MonthlyView refDate={refDate} getEventsForDay={getEventsForDay} />}
    </div>
  );
}

function DailyView({ events, deleteEvent, onEdit, use24h }) {
  return (
    <div style={S.dailyGrid}>
      {HOURS.map(h => {
        const evs = events.filter(e => e.startHour === h);
        return (
          <div key={h} style={S.hourRow}>
            <div style={S.hourLbl}>{fmtH(h, 0, use24h)}</div>
            <div style={S.hourSlot}>
              {evs.length === 0 && <div style={{ height: 36 }} />}
              {evs.map(e => (
                <div key={e.id} style={{ ...S.schedBlock, borderLeft: `4px solid ${e.eventType === "class" ? "#457b9d" : e.eventType === "exam" || e.eventType === "quiz" ? "#c1121f" : "#d4a35a"}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={S.blockName}>{e.name}</div>
                    <div style={S.blockMeta}>
                      {e.subject && <span style={S.tagSmall}>{e.subject}</span>}
                      <span style={S.tagSmall}>{e.eventType}</span>
                      <span style={{ fontSize: 11, color: "#aaa" }}>{e.duration}min {e.recurring && "· recurring"}</span>
                    </div>
                  </div>
                  <button style={S.editBtn} onClick={() => onEdit(e)} title="Edit">✎</button>
                  <button style={S.xBtn} onClick={() => deleteEvent(e.id)}>✕</button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WeeklyView({ refDate, getEventsForDay, onEdit, use24h }) {
  const sun = new Date(refDate);
  sun.setDate(sun.getDate() - sun.getDay());
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(sun); d.setDate(d.getDate() + i); return d; });

  return (
    <div style={S.weekGrid} data-sh="week-grid">
      {days.map((d, i) => {
        const evs = getEventsForDay(d);
        const isToday = isSameDay(d, new Date());
        return (
          <div key={i} style={{ ...S.weekCol, ...(isToday ? { background: "#fdf8f0" } : {}) }}>
            <div style={{ ...S.weekDayHead, ...(isToday ? { color: "#c1121f", fontWeight: 700 } : {}) }}>
              <div style={{ fontSize: 11 }}>{DAYS[i]}</div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{d.getDate()}</div>
            </div>
            <div style={S.weekEvents}>
              {evs.map(e => (
                <div key={e.id} style={{ ...S.weekEvent, borderLeft: `3px solid ${e.eventType === "class" ? "#457b9d" : e.eventType === "exam" || e.eventType === "quiz" ? "#c1121f" : "#d4a35a"}`, cursor: "pointer" }}
                  onClick={() => onEdit(e)}>
                  <div style={{ fontSize: 10, color: "#999" }}>{fmtH(e.startHour, e.startMin, use24h)}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>{e.name}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MonthlyView({ refDate, getEventsForDay }) {
  const year = refDate.getFullYear(), month = refDate.getMonth();
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  return (
    <div>
      <div style={S.monthHeader}>{DAYS.map(d => <div key={d} style={S.monthDayLabel}>{d}</div>)}</div>
      <div style={S.monthGrid}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} style={S.monthCell} />;
          const evs = getEventsForDay(d);
          const isToday = isSameDay(d, new Date());
          return (
            <div key={i} style={{ ...S.monthCell, ...(isToday ? { background: "#fdf8f0" } : {}) }}>
              <div style={{ ...S.monthDateNum, ...(isToday ? { color: "#c1121f", fontWeight: 700 } : {}) }}>{d.getDate()}</div>
              {evs.slice(0, 2).map(e => (
                <div key={e.id} style={{ ...S.monthDot, background: e.eventType === "class" ? "#457b9d" : e.eventType === "exam" || e.eventType === "quiz" ? "#c1121f" : "#d4a35a" }}>
                  <span style={{ fontSize: 9, color: "#fff", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{e.name}</span>
                </div>
              ))}
              {evs.length > 2 && <div style={{ fontSize: 9, color: "#999" }}>+{evs.length - 2}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScheduleForm({ subjects, editing, onAdd, onSave, onCancel }) {
  const initial = editing
    ? { name: editing.name, subject: editing.subject, eventType: editing.eventType, startHour: editing.startHour, startMin: editing.startMin, duration: editing.duration, recurring: editing.recurring, dayOfWeek: editing.dayOfWeek, date: editing.date || today() }
    : { name: "", subject: subjects[0] || "", eventType: "class", startHour: 9, startMin: 0, duration: 60, recurring: true, dayOfWeek: 1, date: today() };
  const [f, setF] = useState(initial);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    if (!f.name.trim()) return;
    if (editing) onSave(editing.id, { ...f, name: f.name.trim() });
    else onAdd({ ...f, name: f.name.trim() });
  };

  return (
    <div style={S.formCard}>
      <input style={S.input} placeholder="Event name (e.g., Linear Algebra Lecture)..." value={f.name} onChange={e => set("name", e.target.value)} autoFocus />
      <div style={S.fRow}>
        <select style={S.select} value={f.eventType} onChange={e => { set("eventType", e.target.value); if (e.target.value === "other") set("subject", ""); }}>
          {["class", "quiz", "exam", "lab", "tutorial", "other"].map(t => <option key={t}>{t}</option>)}
        </select>
        {f.eventType !== "other" && <SubjectSelect subjects={subjects} value={f.subject} onChange={v => set("subject", v)} />}
      </div>
      <div style={S.fRow}>
        <select style={S.select} value={f.startHour} onChange={e => set("startHour", +e.target.value)}>
          {HOURS.map(h => <option key={h} value={h}>{fmtH(h)}</option>)}
        </select>
        <select style={S.select} value={f.startMin} onChange={e => set("startMin", +e.target.value)}>
          {[0, 15, 30, 45].map(m => <option key={m} value={m}>{String(m).padStart(2, "0")} min</option>)}
        </select>
        <select style={S.select} value={f.duration} onChange={e => set("duration", +e.target.value)}>
          {[15, 30, 45, 60, 90, 120, 180].map(d => <option key={d} value={d}>{d} min</option>)}
        </select>
      </div>
      <div style={S.fRow}>
        <label style={S.toggleLabel}>
          <input type="checkbox" checked={f.recurring} onChange={e => set("recurring", e.target.checked)} /> Recurring weekly
        </label>
        {f.recurring ? (
          <select style={S.select} value={f.dayOfWeek} onChange={e => set("dayOfWeek", +e.target.value)}>
            {DAYS_FULL.map((d, i) => <option key={i} value={i}>{d}</option>)}
          </select>
        ) : (
          <input style={S.input} type="date" value={f.date} onChange={e => set("date", e.target.value)} />
        )}
      </div>
      <div style={S.fRow}>
        <button style={S.primaryBtn} onClick={handleSubmit}>{editing ? "Save Changes" : "Add Event"}</button>
        {editing && <button style={S.ghostBtn} onClick={onCancel}>Cancel</button>}
      </div>
    </div>
  );
}
