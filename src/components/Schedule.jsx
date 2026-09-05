import { useState } from 'react';
import { HOURS, DAYS, DAYS_FULL, fmtH, toISO, today, isSameDay } from '../constants';
import { SubjectSelect } from './SubjectManager';
import { S } from '../styles';

// One hour of the daily view, in pixels. Everything on that view is positioned
// from this, so a two hour event is exactly twice as tall as a one hour one.
const HOUR_H = 60;

const EVENT_COLORS = { class: "#457b9d", quiz: "#c1121f", exam: "#c1121f", lab: "#6b9080", tutorial: "#d4a35a", other: "#8d99ae" };
const eventColor = (type) => EVENT_COLORS[type] || "#d4a35a";

const endMinutes = (e) => (e.startHour * 60 + (e.startMin || 0)) + (e.duration || 60);

/**
 * Places a day's events on the time axis, and splits overlapping ones into
 * side-by-side columns so neither is hidden behind the other.
 */
function layoutDay(events) {
  const gridStart = HOURS[0] * 60;
  const gridEnd = (HOURS[HOURS.length - 1] + 1) * 60;

  const items = events
    .map(e => ({
      ev: e,
      start: e.startHour * 60 + (e.startMin || 0),
      end: endMinutes(e),
    }))
    .filter(i => i.end > gridStart && i.start < gridEnd)
    .map(i => ({ ...i, start: Math.max(i.start, gridStart), end: Math.min(i.end, gridEnd) }))
    .sort((a, b) => a.start - b.start || b.end - a.end);

  const placed = [];
  let cluster = [];
  let clusterEnd = -1;

  // Each cluster is a run of events that overlap in time; within it, an event
  // takes the first column whose previous event has already finished.
  const flush = () => {
    if (!cluster.length) return;
    const colEnds = [];
    cluster.forEach(item => {
      let col = colEnds.findIndex(end => end <= item.start);
      if (col === -1) col = colEnds.length;
      colEnds[col] = item.end;
      item.col = col;
    });
    const cols = colEnds.length;
    cluster.forEach(item => placed.push({
      ev: item.ev,
      top: ((item.start - gridStart) / 60) * HOUR_H,
      height: Math.max(((item.end - item.start) / 60) * HOUR_H, 15),
      left: `calc(${(item.col / cols) * 100}% + 2px)`,
      width: `calc(${100 / cols}% - 4px)`,
    }));
    cluster = [];
    clusterEnd = -1;
  };

  items.forEach(item => {
    if (cluster.length && item.start >= clusterEnd) flush();
    cluster.push(item);
    clusterEnd = Math.max(clusterEnd, item.end);
  });
  flush();

  return placed;
}

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

  // schedule_events stores one day per row, so a weekly event on several days
  // becomes one row per day.
  const handleAdd = async (e) => {
    const days = e.recurring ? e.daysOfWeek : [e.dayOfWeek];
    for (const dayOfWeek of days) await addEvent({ ...e, dayOfWeek });
    setForm(null);
  };

  const handleSave = async (id, fields) => {
    const days = fields.recurring ? fields.daysOfWeek : [new Date(fields.date + "T00:00:00").getDay()];
    const [first, ...extra] = days;
    await updateEvent(id, { ...fields, dayOfWeek: first });
    for (const dayOfWeek of extra) await addEvent({ ...fields, dayOfWeek });
    setEditing(null);
  };

  return (
    <div style={S.page}>
      <div style={S.pageHead}><h1 style={S.pageTitle}>Schedule</h1>
        <button style={S.primaryBtn} onClick={() => { setForm(form === "schedule" ? null : "schedule"); setEditing(null); }}>
          {form === "schedule" && !editing ? "✕ Cancel" : "+ Add Event"}
        </button>
      </div>
      {(form === "schedule" || editing) && (
        <ScheduleForm subjects={D.subjects} editing={editing}
          onAdd={handleAdd}
          onSave={handleSave}
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
  const total = HOURS.length * HOUR_H;
  const placed = layoutDay(events);

  return (
    <div style={S.dayWrap}>
      <div style={{ ...S.dayGutter, height: total }}>
        {HOURS.map((h, i) => (
          <div key={h} style={{ ...S.dayHourLbl, top: i * HOUR_H }}>{fmtH(h, 0, use24h)}</div>
        ))}
      </div>
      <div style={{ ...S.dayTrack, height: total }}>
        {HOURS.map((h, i) => (
          <div key={h}>
            <div style={{ ...S.dayHourLine, top: i * HOUR_H }} />
            <div style={{ ...S.dayHalfLine, top: i * HOUR_H + HOUR_H / 2 }} />
          </div>
        ))}
        <div style={{ ...S.dayHourLine, top: total }} />

        {events.length === 0 && <div style={S.dayEmpty}>Nothing scheduled.</div>}

        {placed.map(({ ev, top, height, left, width }) => {
          const color = eventColor(ev.eventType);
          const end = endMinutes(ev);
          const range = `${fmtH(ev.startHour, ev.startMin, use24h)} – ${fmtH(Math.floor(end / 60) % 24, end % 60, use24h)}`;
          // Short events have no room for every line, so drop detail as they shrink.
          const showTime = height >= 32;
          const showMeta = height >= 58;
          return (
            <div key={ev.id} onClick={() => onEdit(ev)} title={`${ev.name} · ${range}`}
              style={{ ...S.dayEvent, top, height, left, width, background: `${color}1a`, borderLeft: `3px solid ${color}` }}>
              <div style={S.dayEventName}>{ev.name}</div>
              {showTime && <div style={S.dayEventTime}>{range}</div>}
              {showMeta && (
                <div style={{ ...S.blockMeta, marginTop: 4 }}>
                  {ev.subject && <span style={S.tagSmall}>{ev.subject}</span>}
                  <span style={S.tagSmall}>{ev.eventType}</span>
                  {ev.recurring && <span style={{ fontSize: 10, color: "#aaa" }}>· weekly</span>}
                </div>
              )}
              {height >= 26 && (
                <div style={S.dayEventBtns}>
                  <button style={S.xBtn} title="Delete"
                    onClick={e => { e.stopPropagation(); deleteEvent(ev.id); }}>✕</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
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
                <div key={e.id} style={{ ...S.weekEvent, borderLeft: `3px solid ${eventColor(e.eventType)}`, cursor: "pointer" }}
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
                <div key={e.id} style={{ ...S.monthDot, background: eventColor(e.eventType) }}>
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
  const [f, setF] = useState(() => editing
    ? { name: editing.name, subject: editing.subject, eventType: editing.eventType, startHour: editing.startHour, startMin: editing.startMin, duration: editing.duration, recurring: editing.recurring, daysOfWeek: [editing.dayOfWeek ?? 1], date: editing.date || today() }
    : { name: "", subject: subjects[0] || "", eventType: "class", startHour: 9, startMin: 0, duration: 60, recurring: true, daysOfWeek: [1], date: today() });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const toggleDay = (i) => set("daysOfWeek",
    f.daysOfWeek.includes(i)
      ? f.daysOfWeek.filter(d => d !== i)
      : [...f.daysOfWeek, i].sort((a, b) => a - b));

  const noDays = f.recurring && f.daysOfWeek.length === 0;

  const handleSubmit = () => {
    if (!f.name.trim() || noDays) return;
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
          <div style={S.dayPicker}>
            {DAYS.map((d, i) => (
              <button key={i} type="button" title={DAYS_FULL[i]} onClick={() => toggleDay(i)}
                style={{ ...S.dayToggle, ...(f.daysOfWeek.includes(i) ? S.dayToggleOn : {}) }}>
                {d}
              </button>
            ))}
          </div>
        ) : (
          <input style={S.input} type="date" value={f.date} onChange={e => set("date", e.target.value)} />
        )}
      </div>
      {noDays && <p style={{ fontSize: 12, color: "#c1121f", margin: 0 }}>Pick at least one day.</p>}
      <div style={S.fRow}>
        <button style={{ ...S.primaryBtn, ...(noDays ? { opacity: 0.5, cursor: "not-allowed" } : {}) }}
          onClick={handleSubmit} disabled={noDays}>
          {editing ? "Save Changes" : "Add Event"}
        </button>
        {editing && <button style={S.ghostBtn} onClick={onCancel}>Cancel</button>}
      </div>
    </div>
  );
}
