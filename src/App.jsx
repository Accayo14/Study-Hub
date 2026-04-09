import { useState, useEffect } from 'react';
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
import Search from './components/Search';
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
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(v => !v);
      }
      if (e.key === 'Escape' && showSearch) setShowSearch(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showSearch]);

  if (loading || !D) return <div style={S.loadWrap}><div style={S.loadPulse}>StudyHub</div></div>;

  const p = { D, tab, setTab, form, setForm, ...ops };

  return (
    <div style={S.root} data-sh="root">
      {showSearch && <Search D={D} onClose={() => setShowSearch(false)} onNavigate={setTab} />}
      <nav style={{ ...S.sidebar, ...(sidebarOpen ? {} : S.sidebarCollapsed) }} data-sh="sidebar">
        <div style={S.sidebarTop} data-sh="sidebar-top">
          <div style={S.logo} onClick={() => setSidebarOpen(!sidebarOpen)} data-sh="logo">
            <span style={S.logoEmoji}>📚</span>
            {sidebarOpen && <span style={S.logoText} data-sh="logo-text">StudyHub</span>}
          </div>
          {sidebarOpen && (
            <button onClick={() => setShowSearch(true)}
              style={{ ...S.navBtn, color: "#888", marginBottom: 8, border: "1px solid #3d3d3d", borderRadius: 7, fontSize: 12, justifyContent: "space-between" }}
              data-sh="search-btn">
              <span>🔍 Search...</span>
              <span style={{ fontSize: 10, color: "#666", background: "#3d3d3d", padding: "1px 6px", borderRadius: 4 }}>Ctrl+K</span>
            </button>
          )}
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setForm(null); }}
              style={{ ...S.navBtn, ...(tab === t.id ? S.navActive : {}), ...(sidebarOpen ? {} : S.navCollapsed) }}
              data-sh="nav-btn">
              <span style={S.navIcon}>{t.icon}</span>
              {sidebarOpen && <span data-sh="nav-label">{t.label}</span>}
            </button>
          ))}
        </div>
        {sidebarOpen && (
          <div style={S.sidebarBottom} data-sh="sidebar-bottom">
            <div style={{ fontSize: 11, color: "#a8a8a8", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.user_metadata?.full_name || user.email}
            </div>
            <div style={S.miniStat}>{D.assignments.filter(a => !a.done).length} pending</div>
            <div style={S.miniStat}>{D.exams.filter(e => !e.done).length} exams left</div>
            <button style={{ ...S.ghostBtn, marginTop: 10, width: "100%", fontSize: 11, color: "#a8a8a8", borderColor: "#3d3d3d" }} onClick={signOut}>Sign Out</button>
          </div>
        )}
      </nav>
      <main style={S.main} data-sh="main">
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
