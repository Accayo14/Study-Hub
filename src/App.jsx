import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthProvider';
import { useAuth } from './contexts/auth-context';
import { useStudyData } from './hooks/useStudyData';
import { isConfigured } from './lib/supabase';
import Auth from './pages/Auth';
import Setup from './pages/Setup';
import ResetPassword from './pages/ResetPassword';
import ChangePassword from './components/ChangePassword';
import Dashboard from './components/Dashboard';
import Assignments from './components/Assignments';
import Focus from './components/Focus';
import Notes from './components/Notes';
import Schedule from './components/Schedule';
import Exams from './components/Exams';
import Tasks from './components/Tasks';
import StudyPlan from './components/StudyPlan';
import Search from './components/Search';
import { TABS } from './constants';
import { S, CSS } from './styles';

function AppRouter() {
  const { user, loading, recovering } = useAuth();
  if (loading) return <div style={S.loadWrap}><div style={S.loadPulse}>StudyHub</div></div>;
  if (recovering && user) return <ResetPassword />;
  if (!user) return <Auth />;
  return <Main />;
}

function SidebarClock({ use24h }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const timeStr = use24h
    ? now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true });
  const dateStr = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  return (
    <div style={{ textAlign: "center", padding: "6px 0 12px", borderBottom: "1px solid #3d3d3d", marginBottom: 12 }} data-sh="sidebar-clock">
      <div style={{ fontSize: 18, fontWeight: 600, color: "#faf8f5", fontFamily: "'DM Serif Display',serif", letterSpacing: "0.5px" }}>{timeStr}</div>
      <div style={{ fontSize: 11, color: "#a8a8a8", marginTop: 2 }}>{dateStr}</div>
    </div>
  );
}

/** The sidebar footer is hidden on phones, so these controls get their own sheet. */
function AccountSheet({ user, D, use24h, toggle24h, signOut, onClose }) {
  const [changingPw, setChangingPw] = useState(false);
  return (
    <div style={S.modal} onClick={onClose}>
      <div style={{ ...S.modalBox, maxWidth: 340 }} onClick={e => e.stopPropagation()}>
        <div style={S.modalHead}>
          <div>
            <div style={S.modalTitle}>Account</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4, wordBreak: "break-all" }}>
              {user.user_metadata?.full_name || user.email}
            </div>
          </div>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={S.settingsRow}>
          <span style={S.settingsLabel}>Pending assignments</span>
          <span style={{ fontWeight: 700 }}>{D.assignments.filter(a => !a.done).length}</span>
        </div>
        <div style={S.settingsRow}>
          <span style={S.settingsLabel}>Exams left</span>
          <span style={{ fontWeight: 700 }}>{D.exams.filter(e => !e.done).length}</span>
        </div>
        <div style={S.settingsRow}>
          <span style={S.settingsLabel}>Time format</span>
          <button style={S.ghostBtn} onClick={toggle24h}>{use24h ? "24-hour" : "12-hour"}</button>
        </div>
        <div style={S.settingsRow}>
          <span style={S.settingsLabel}>Password</span>
          <button style={S.ghostBtn} onClick={() => setChangingPw(v => !v)}>
            {changingPw ? "Cancel" : "Change"}
          </button>
        </div>
        {changingPw && (
          <div style={{ marginTop: 12 }}>
            <ChangePassword submitLabel="Save password" onDone={() => setChangingPw(false)} />
          </div>
        )}
        <button style={{ ...S.primaryBtn, width: "100%", marginTop: 16 }} onClick={signOut}>Sign Out</button>
      </div>
    </div>
  );
}

function Main() {
  const { user, signOut } = useAuth();
  const { D, loading, ...ops } = useStudyData(user.id);
  const [tab, setTab] = useState("dashboard");
  const [form, setForm] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 900);
  const [showSearch, setShowSearch] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [use24h, setUse24h] = useState(() => localStorage.getItem("studyhub_24h") === "true");

  const toggle24h = () => {
    setUse24h(v => { const next = !v; localStorage.setItem("studyhub_24h", String(next)); return next; });
  };

  // Auto-collapse sidebar when window gets narrow
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth <= 900) setSidebarOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(v => !v);
      }
      if (e.key === 'Escape') { setShowSearch(false); setShowAccount(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (loading || !D) return <div style={S.loadWrap}><div style={S.loadPulse}>StudyHub</div></div>;

  const p = { D, tab, setTab, form, setForm, use24h, ...ops };

  return (
    <div style={S.root} data-sh="root">
      {showSearch && <Search D={D} onClose={() => setShowSearch(false)} onNavigate={setTab} />}
      {showAccount && (
        <AccountSheet user={user} D={D} use24h={use24h} toggle24h={toggle24h}
          signOut={signOut} onClose={() => setShowAccount(false)} />
      )}
      <nav style={{ ...S.sidebar, ...(sidebarOpen ? {} : S.sidebarCollapsed) }} data-sh="sidebar">
        <div style={S.sidebarTop} data-sh="sidebar-top">
          <div style={{ display: "flex", alignItems: "center", justifyContent: sidebarOpen ? "space-between" : "center", marginBottom: sidebarOpen ? 8 : 12, padding: sidebarOpen ? "0" : "0" }} data-sh="logo">
            {sidebarOpen && <span style={S.logoText} data-sh="logo-text">StudyHub</span>}
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: "none", border: "none", color: "#a8a8a8", fontSize: 16, cursor: "pointer", padding: "9px 10px", borderRadius: 7, lineHeight: 1, width: sidebarOpen ? "auto" : "100%", textAlign: "center" }}
              data-sh="hamburger" title={sidebarOpen ? "Collapse" : "Expand"}>
              ☰
            </button>
          </div>
          {sidebarOpen && <SidebarClock use24h={use24h} />}
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
          <button onClick={() => setShowSearch(true)} style={{ ...S.navBtn, ...S.navCollapsed }}
            data-sh="mobile-tool" title="Search" aria-label="Search">
            <span style={S.navIcon}>🔍</span>
          </button>
          <button onClick={() => setShowAccount(true)} style={{ ...S.navBtn, ...S.navCollapsed }}
            data-sh="mobile-tool" title="Account" aria-label="Account">
            <span style={S.navIcon}>⚙</span>
          </button>
        </div>
        {sidebarOpen && (
          <div style={S.sidebarBottom} data-sh="sidebar-bottom">
            <div style={{ fontSize: 11, color: "#a8a8a8", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.user_metadata?.full_name || user.email}
            </div>
            <div style={S.miniStat}>{D.assignments.filter(a => !a.done).length} pending</div>
            <div style={S.miniStat}>{D.exams.filter(e => !e.done).length} exams left</div>
            <button style={{ ...S.ghostBtn, marginTop: 8, width: "100%", fontSize: 10, color: "#a8a8a8", borderColor: "#3d3d3d", padding: "5px 10px" }} onClick={toggle24h}>
              {use24h ? "Switch to 12hr" : "Switch to 24hr"}
            </button>
            <button style={{ ...S.ghostBtn, marginTop: 6, width: "100%", fontSize: 10, color: "#a8a8a8", borderColor: "#3d3d3d", padding: "5px 10px" }} onClick={() => setShowAccount(true)}>
              Account &amp; password
            </button>
            <button style={{ ...S.ghostBtn, marginTop: 6, width: "100%", fontSize: 11, color: "#a8a8a8", borderColor: "#3d3d3d" }} onClick={signOut}>Sign Out</button>
          </div>
        )}
      </nav>
      <main style={S.main} data-sh="main">
        {tab === "dashboard" && <Dashboard {...p} />}
        {tab === "assignments" && <Assignments {...p} />}
        {tab === "studyplan" && <StudyPlan {...p} />}
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
      {isConfigured ? (
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      ) : (
        <Setup />
      )}
    </>
  );
}
