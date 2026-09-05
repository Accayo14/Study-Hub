import { useState, useEffect } from 'react';
import { HOURS, DAYS, DAYS_FULL, fmtH, toISO, today, isSameDay } from '../constants';
import { SubjectSelect } from './SubjectManager';
import { S } from '../styles';

// One hour of the daily view, in pixels. Everything on that view is positioned
// from this, so a two hour event is exactly twice as tall as a one hour one.
const HOUR_H = 60;

const EVENT_COLORS = { class: "var(--blue)", quiz: "var(--danger)", exam: "var(--danger)", lab: "var(--green)", tutorial: "var(--gold)", other: "var(--slate)" };
const eventColor = (type) => EVENT_COLORS[type] || "var(--gold)";
// var() cannot take a hex alpha suffix, so the fill is mixed with the page.
const eventTint = (color, pct) => `color-mix(in srgb, ${color} ${pct}%, transparent)`;

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

      {view === "daily" && <DailyView events={getEventsForDay(refDate)} deleteEvent={deleteEvent} onEdit={handleEdit} use24h={use24h} isToday={isSameDay(refDate, new Date())} />}
      {view === "weekly" && <WeeklyView refDate={refDate} getEventsForDay={getEventsForDay} deleteEvent={deleteEvent} onEdit={handleEdit} use24h={use24h} />}
      {view === "monthly" && <MonthlyView refDate={refDate} getEventsForDay={getEventsForDay} />}
    </div>
  );
}


/** Minutes since midnight, re-read once a minute so the now-line creeps down. */
function useNowMinutes() {
  const [mins, setMins] = useState(() => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); });
  useEffect(() => {
    const id = setInterval(() => { const d = new Date(); setMins(d.getHours() * 60 + d.getMinutes()); }, 60000);
    return () => clearInterval(id);
  }, []);
  return mins;
}

const gridOffset = (minutes) => ((minutes - HOURS[0] * 60) / 60) * HOUR_H;

function HourLines() {
  return (
    <>
      {HOURS.map((h, i) => (
        <div key={h}>
          <div style={{ ...S.dayHourLine, top: i * HOUR_H }} />
          <div style={{ ...S.dayHalfLine, top: i * HOUR_H + HOUR_H / 2 }} />
        </div>
      ))}
      <div style={{ ...S.dayHourLine, top: HOURS.length * HOUR_H }} />
    </>
  );
}

function NowLine({ minutes, withDot = true }) {
  if (minutes < HOURS[0] * 60 || minutes > (HOURS[HOURS.length - 1] + 1) * 60) return null;
  return (
    <div style={{ ...S.nowLine, top: gridOffset(minutes) }}>
      {withDot && <div style={S.nowDot} />}
    </div>
  );
}

function HourGutter({ use24h }) {
  return (
    <div style={{ ...S.dayGutter, height: HOURS.length * HOUR_H }}>
      {HOURS.map((h, i) => (
        <div key={h} style={{ ...S.dayHourLbl, top: i * HOUR_H }}>{fmtH(h, 0, use24h)}</div>
      ))}
    </div>
  );
}

function DailyView({ events, deleteEvent, onEdit, use24h, isToday }) {
  const total = HOURS.length * HOUR_H;
  const placed = layoutDay(events);
  const nowMins = useNowMinutes();

  return (
    <div style={S.dayWrap}>
      <HourGutter use24h={use24h} />
      <div style={{ ...S.dayTrack, height: total }}>
        <HourLines />
        {isToday && <NowLine minutes={nowMins} />}

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
              style={{ ...S.dayEvent, top, height, left, width, background: eventTint(color, 12), borderLeft: `3px solid ${color}` }}>
              <div style={S.dayEventName}>{ev.name}</div>
              {showTime && <div style={S.dayEventTime}>{range}</div>}
              {showMeta && (
                <div style={{ ...S.blockMeta, marginTop: 4 }}>
                  {ev.subject && <span style={S.tagSmall}>{ev.subject}</span>}
                  <span style={S.tagSmall}>{ev.eventType}</span>
                  {ev.recurring && <span style={{ fontSize: 10, color: "var(--text-ghost)" }}>· weekly</span>}
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
  const total = HOURS.length * HOUR_H;
  const nowMins = useNowMinutes();

  return (
    <div style={S.weekWrap}>
      <div style={S.weekHeadRow}>
        <div style={S.weekHeadSpacer} />
        {days.map((d, i) => {
          const isToday = isSameDay(d, new Date());
          return (
            <div key={i} style={{ ...S.weekDayHead, ...(isToday ? { background: "var(--today-bg)" } : {}) }}>
              <div style={{ fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.4px" }}>{DAYS[i]}</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: isToday ? "var(--danger)" : "var(--text)" }}>{d.getDate()}</div>
            </div>
          );
        })}
      </div>

      <div style={S.weekBody}>
        <HourGutter use24h={use24h} />
        <div style={S.weekCols}>
          {days.map((d, i) => {
            const isToday = isSameDay(d, new Date());
            const placed = layoutDay(getEventsForDay(d));
            return (
              <div key={i} style={{ ...S.weekColTrack, height: total, ...(isToday ? { background: "var(--today-bg)" } : {}) }}>
                <HourLines />
                {isToday && <NowLine minutes={nowMins} withDot={false} />}
                {placed.map(({ ev, top, height, left, width }) => {
                  const color = eventColor(ev.eventType);
                  const end = endMinutes(ev);
                  const range = `${fmtH(ev.startHour, ev.startMin, use24h)} – ${fmtH(Math.floor(end / 60) % 24, end % 60, use24h)}`;
                  return (
                    <div key={ev.id} onClick={() => onEdit(ev)} title={`${ev.name} · ${range}`}
                      style={{ ...S.weekEvent, top, height, left, width, background: eventTint(color, 16), borderLeft: `2px solid ${color}` }}>
                      <div style={S.dayEventName}>{ev.name}</div>
                      {height >= 34 && <div style={{ ...S.dayEventTime, fontSize: 9 }}>{range}</div>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
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
            <div key={i} style={{ ...S.monthCell, ...(isToday ? { background: "var(--today-bg)" } : {}) }}>
              <div style={{ ...S.monthDateNum, ...(isToday ? { color: "var(--danger)", fontWeight: 700 } : {}) }}>{d.getDate()}</div>
              {evs.slice(0, 2).map(e => (
                <div key={e.id} style={{ ...S.monthDot, background: eventColor(e.eventType) }}>
                  <span style={{ fontSize: 9, color: "var(--surface)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{e.name}</span>
                </div>
              ))}
              {evs.length > 2 && <div style={{ fontSize: 9, color: "var(--text-faint)" }}>+{evs.length - 2}</div>}
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
      {noDays && <p style={{ fontSize: 12, color: "var(--danger)", margin: 0 }}>Pick at least one day.</p>}
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
