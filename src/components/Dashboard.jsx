import { dueInfo, isSameDay, fmtH, today, P_COLORS } from '../constants';
import { S } from '../styles';

export default function Dashboard({ D, setTab }) {
  const now = new Date();
  const greeting = now.getHours() < 12 ? "morning" : now.getHours() < 17 ? "afternoon" : "evening";
  const todayStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const pending = D.assignments.filter(a => !a.done);
  const dueSoon = pending.filter(a => dueInfo(a.due).urgent);
  const upcomingExams = D.exams.filter(e => !e.done && new Date(e.date) >= new Date(today())).sort((a, b) => new Date(a.date) - new Date(b.date));

  const curH = now.getHours();
  const curDay = now.getDay();
  const next4h = D.scheduleEvents.filter(ev => {
    const matchDay = ev.recurring ? ev.dayOfWeek === curDay : isSameDay(ev.date, now);
    return matchDay && ev.startHour >= curH && ev.startHour < curH + 4;
  }).sort((a, b) => a.startHour - b.startHour || a.startMin - b.startMin);

  const pendingTasks = D.tasks.filter(t => !t.done && t.due).sort((a, b) => new Date(a.due) - new Date(b.due)).slice(0, 4);

  return (
    <div style={S.page}>
      <div style={S.greet}>
        <h1 style={S.greetH1}>Good {greeting} 👋</h1>
        <p style={S.greetSub}>{todayStr}</p>
      </div>

      <div style={S.dashGrid}>
        <Stat label="Pending" val={pending.length} color="#e07a5f" onClick={() => setTab("assignments")} />
        <Stat label="Due Soon" val={dueSoon.length} color="#c1121f" onClick={() => setTab("assignments")} />
        <Stat label="Upcoming Exams" val={upcomingExams.length} color="#5e60ce" onClick={() => setTab("exams")} />
        <Stat label="Open Tasks" val={D.tasks.filter(t => !t.done).length} color="#457b9d" onClick={() => setTab("tasks")} />
      </div>

      <div style={S.dashSection}>
        <h2 style={S.secTitle}>📋 Assignments</h2>
        {dueSoon.length === 0 && pending.length === 0 && <p style={S.empty}>All clear! No pending assignments.</p>}
        {dueSoon.length > 0 && (
          <div style={{ marginBottom: 16 }}>
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
        <h2 style={S.secTitle}>⏰ Coming Up (Next 4 Hours)</h2>
        {next4h.length === 0 && pendingTasks.length === 0 && <p style={S.empty}>Nothing scheduled. Free time!</p>}
        {next4h.map(ev => (
          <div key={ev.id} style={S.miniEventCard}>
            <span style={S.miniEvTime}>{fmtH(ev.startHour, ev.startMin)}</span>
            <span style={S.miniEvName}>{ev.name}</span>
            <span style={S.tagSmall}>{ev.subject || ev.eventType}</span>
          </div>
        ))}
        {pendingTasks.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={S.subLabel}>Upcoming Tasks</div>
            {pendingTasks.map(t => (
              <div key={t.id} style={S.miniEventCard}>
                <span style={S.miniEvTime}>{dueInfo(t.due).text}</span>
                <span style={S.miniEvName}>{t.name}</span>
                <span style={S.tagSmall}>{t.category}</span>
              </div>
            ))}
          </div>
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
      <span style={{ ...S.dueTxt, color: di.cls === "overdue" ? "#c1121f" : di.cls === "today" ? "#e07a5f" : "#888" }}>{di.text}</span>
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
