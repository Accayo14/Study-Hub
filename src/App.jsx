import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useStudyData } from './hooks/useStudyData';
import Auth from './pages/Auth';
import Dashboard from './components/Dashboard';
import Assignments from './components/Assignments';
import Focus from './components/Focus';
import Notes from './components/Notes';
import Schedule from './components/Schedule';
import Exams from './components/Exams';
import Tasks from './components/Tasks';
import { TABS } from './constants';
import { S, CSS } from './styles';

function AppRouter() {
  const { user, loading } = useAuth();
  if (loading) return <div style={S.loadWrap}><div style={S.loadPulse}>StudyHub</div></div>;
  if (!user) return <Auth />;
  return <Main />;
}

function Main() {
  const { user, signOut } = useAuth();
  const { D, loading, ...ops } = useStudyData(user.id);
  const [tab, setTab] = useState("dashboard");
  const [form, setForm] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading || !D) return <div style={S.loadWrap}><div style={S.loadPulse}>StudyHub</div></div>;

  const p = { D, tab, setTab, form, setForm, ...ops };

  return (
    <div style={S.root}>
      <nav style={{ ...S.sidebar, ...(sidebarOpen ? {} : S.sidebarCollapsed) }}>
        <div style={S.sidebarTop}>
          <div style={S.logo} onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span style={S.logoEmoji}>📚</span>
            {sidebarOpen && <span style={S.logoText}>StudyHub</span>}
          </div>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setForm(null); }}
              style={{ ...S.navBtn, ...(tab === t.id ? S.navActive : {}), ...(sidebarOpen ? {} : S.navCollapsed) }}>
              <span style={S.navIcon}>{t.icon}</span>
              {sidebarOpen && <span>{t.label}</span>}
            </button>
          ))}
        </div>
        {sidebarOpen && (
          <div style={S.sidebarBottom}>
            <div style={{ fontSize: 11, color: "#a8a8a8", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.user_metadata?.full_name || user.email}
            </div>
            <div style={S.miniStat}>{D.assignments.filter(a => !a.done).length} pending</div>
            <div style={S.miniStat}>{D.exams.filter(e => !e.done).length} exams left</div>
            <button style={{ ...S.ghostBtn, marginTop: 10, width: "100%", fontSize: 11, color: "#a8a8a8", borderColor: "#3d3d3d" }} onClick={signOut}>Sign Out</button>
          </div>
        )}
      </nav>
      <main style={S.main}>
        {tab === "dashboard" && <Dashboard {...p} />}
        {tab === "assignments" && <Assignments {...p} />}
        {tab === "focus" && <Focus {...p} />}
        {tab === "notes" && <Notes {...p} />}
        {tab === "schedule" && <Schedule {...p} />}
        {tab === "exams" && <Exams {...p} />}
        {tab === "tasks" && <Tasks {...p} />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <>
      <style>{CSS}</style>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </>
  );
}
