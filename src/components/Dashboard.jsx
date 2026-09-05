import { dueInfo, isSameDay, fmtH, today, P_COLORS } from '../constants';
import { S } from '../styles';

export default function Dashboard({ D, setTab, use24h }) {
  const now = new Date();
  const greeting = now.getHours() < 5 ? "night" : now.getHours() < 12 ? "morning" : now.getHours() < 16 ? "afternoon" : now.getHours() < 20 ? "evening" : "night";
  const todayStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const assignments = D.assignments.filter(a => (a.type || 'assignment') === 'assignment');
  const studyPlans = D.assignments.filter(a => a.type === 'study_plan');

  const pending = assignments.filter(a => !a.done);
  const dueSoon = pending.filter(a => dueInfo(a.due).urgent);
  const upcomingExams = D.exams.filter(e => !e.done && new Date(e.date) >= new Date(today())).sort((a, b) => new Date(a.date) - new Date(b.date));

  const curH = now.getHours();
  const curDay = now.getDay();
  const next4h = D.scheduleEvents.filter(ev => {
    const matchDay = ev.recurring ? ev.dayOfWeek === curDay : isSameDay(ev.date, now);
    return matchDay && ev.startHour >= curH && ev.startHour < curH + 4;
  }).sort((a, b) => a.startHour - b.startHour || a.startMin - b.startMin);

  const pendingPlans = studyPlans.filter(a => !a.done).sort((a, b) => new Date(a.due) - new Date(b.due));
  const openTasks = D.tasks.filter(t => !t.done);

  return (
    <div style={{ ...S.page, maxWidth: 960 }}>
      <div style={S.greet}>
        <h1 style={S.greetH1}>Good {greeting} 👋</h1>
        <p style={S.greetSub}>{todayStr}</p>
      </div>

      <div style={S.dashGrid} data-sh="dash-grid">
        <Stat label="Pending" val={pending.length} color="var(--warn)" onClick={() => setTab("assignments")} />
        <Stat label="Due Soon" val={dueSoon.length} color="var(--danger)" onClick={() => setTab("assignments")} />
        <Stat label="Upcoming Exams" val={upcomingExams.length} color="var(--violet)" onClick={() => setTab("exams")} />
        <Stat label="Open Tasks" val={openTasks.length} color="var(--blue)" onClick={() => setTab("tasks")} />
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} data-sh="dash-cols">

        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={S.dashSection}>
            <h2 style={S.secTitle}>📋 Assignments</h2>
            {dueSoon.length === 0 && pending.length === 0 && <p style={S.emptyMini}>All clear!</p>}
            {dueSoon.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={S.subLabel}>Due Soon</div>
                {dueSoon.slice(0, 4).map(a => <MiniAssignCard key={a.id} a={a} />)}
              </div>
            )}
            {pending.filter(a => !dueInfo(a.due).urgent).length > 0 && (
              <div>
                <div style={S.subLabel}>Pending</div>
                {pending.filter(a => !dueInfo(a.due).urgent).slice(0, 4).map(a => <MiniAssignCard key={a.id} a={a} />)}
              </div>
            )}
          </div>

          <div style={S.dashSection}>
            <h2 style={S.secTitle}>✦ Tasks</h2>
            {openTasks.length === 0 && <p style={S.emptyMini}>No open tasks.</p>}
            {openTasks.slice(0, 5).map(t => {
              const di = t.due ? dueInfo(t.due) : null;
              return (
                <div key={t.id} style={S.miniAssign}>
                  <div style={{ flex: 1 }}>
                    <div style={S.miniAssignName}>{t.name}</div>
                    <div style={S.miniAssignMeta}>
                      <span style={{ ...S.badge, background: P_COLORS[t.priority] }}>{t.priority}</span>
                      <span style={S.tagSmall}>{t.category}</span>
                    </div>
                  </div>
                  {di && <span style={{ ...S.dueTxt, color: di.cls === "overdue" ? "var(--danger)" : "var(--text-dim)" }}>{di.text}</span>}
                </div>
              );
            })}
            {openTasks.length > 5 && (
              <button style={{ ...S.ghostBtn, marginTop: 8, fontSize: 11 }} onClick={() => setTab("tasks")}>View all tasks</button>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={S.dashSection}>
            <h2 style={S.secTitle}>⏰ Coming Up</h2>
            {next4h.length === 0 && <p style={{ ...S.empty, padding: "16px 0" }}>Nothing scheduled in the next 4 hours.</p>}
            {next4h.map(ev => (
              <div key={ev.id} style={S.miniEventCard}>
                <span style={S.miniEvTime}>{fmtH(ev.startHour, ev.startMin, use24h)}</span>
                <span style={S.miniEvName}>{ev.name}</span>
                <span style={S.tagSmall}>{ev.subject || ev.eventType}</span>
              </div>
            ))}
          </div>

          <div style={{ ...S.dashSection, borderLeft: "3px solid var(--violet)" }}>
            <h2 style={S.secTitle}>📖 Study Plan</h2>
            {pendingPlans.length === 0 && <p style={{ ...S.empty, padding: "16px 0" }}>No study plans.</p>}
            {pendingPlans.slice(0, 5).map(a => {
              const di = dueInfo(a.due);
              return (
                <div key={a.id} style={S.miniAssign}>
                  <div style={{ flex: 1 }}>
                    <div style={S.miniAssignName}>{a.name}</div>
                    <div style={S.miniAssignMeta}>
                      <span style={{ ...S.tagSmall, background: "var(--violet-bg)", color: "var(--violet)" }}>{a.subject}</span>
                    </div>
                  </div>
                  <span style={{ ...S.dueTxt, color: di.cls === "overdue" ? "var(--danger)" : di.cls === "today" ? "var(--warn)" : "var(--text-dim)" }}>{di.text}</span>
                </div>
              );
            })}
            {pendingPlans.length > 5 && (
              <button style={{ ...S.ghostBtn, marginTop: 8, fontSize: 11 }} onClick={() => setTab("studyplan")}>View full plan</button>
            )}
          </div>

          {upcomingExams.length > 0 && (
            <div style={S.dashSection}>
              <h2 style={S.secTitle}>📝 Next Exams</h2>
              {upcomingExams.slice(0, 3).map(e => (
                <div key={e.id} style={S.miniEventCard}>
                  <span style={S.miniEvTime}>{new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  <span style={S.miniEvName}>{e.name}</span>
                  <span style={S.tagSmall}>{e.subject}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniAssignCard({ a }) {
  const di = dueInfo(a.due);
  return (
    <div style={S.miniAssign}>
      <div style={{ flex: 1 }}>
        <div style={S.miniAssignName}>{a.name}</div>
        <div style={S.miniAssignMeta}>
          <span style={{ ...S.badge, background: P_COLORS[a.priority] }}>{a.priority}</span>
          <span style={S.tagSmall}>{a.subject}</span>
        </div>
      </div>
      <span style={{ ...S.dueTxt, color: di.cls === "overdue" ? "var(--danger)" : di.cls === "today" ? "var(--warn)" : "var(--text-dim)" }}>{di.text}</span>
    </div>
  );
}

function Stat({ label, val, color, onClick }) {
  return (
    <button onClick={onClick} style={{ ...S.statCard, borderLeft: `4px solid ${color}` }}>
      <div style={{ ...S.statVal, color }}>{val}</div>
      <div style={S.statLabel}>{label}</div>
    </button>
  );
}
