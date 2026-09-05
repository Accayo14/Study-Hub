export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700&family=DM+Serif+Display&display=swap');

/* Every colour in the app resolves through these. Light values are the
   originals, so light mode renders exactly as before. */
:root{
  color-scheme:light;
  --bg:#faf8f5; --surface:#ffffff; --surface-sunken:#faf8f5;
  --tag-bg:#f0ece6; --divider:#f4f0ec;
  --text:#2b2b2b; --text-2:#555555; --text-3:#666666; --text-dim:#888888;
  --text-faint:#999999; --text-ghost:#aaaaaa; --text-ghost-2:#bbbbbb; --outline:#cccccc;
  --border:#e8e0d8; --border-2:#e0d8d0; --border-soft:#f0ece6; --border-input:#dddddd;
  --ink:#2b2b2b; --ink-fg:#faf8f5;
  --side-bg:#2b2b2b; --side-fg:#faf8f5; --side-dim:#a8a8a8; --side-line:#3d3d3d; --side-active:#3d3d3d;
  --danger:#c1121f; --danger-bg:#fef2f2; --warn:#e07a5f; --gold:#d4a35a;
  --green:#6b9080; --green-bg:#f0fdf4; --blue:#457b9d; --violet:#5e60ce; --violet-bg:#e8e0f8;
  --slate:#8d99ae; --today-bg:#fdf8f0; --on-accent:#ffffff;
  --manage-bg:#f2ede7; --manage-border:#c9c0b4; --manage-fg:#5a5348;
  --grid-line:#ece7e0; --grid-half:#e0d6ca; --day-event-time:#8a8279;
  --overlay:rgba(0,0,0,0.35); --hover-filter:brightness(0.96);
}

/* Dark palette. Same token names, so nothing downstream changes. The accent
   hues are lightened, because a colour tuned for white paper goes muddy on a
   dark ground -- and --on-accent flips to dark text to stay readable on them. */
:root[data-theme="dark"]{
  color-scheme:dark;
  --bg:#15141a; --surface:#1d1c24; --surface-sunken:#24222c;
  --tag-bg:#2e2b38; --divider:#272531;
  --text:#eae7f0; --text-2:#c4c0ce; --text-3:#b0abbd; --text-dim:#948fa3;
  --text-faint:#857f95; --text-ghost:#757085; --text-ghost-2:#665f78; --outline:#4a4458;
  --border:#302d3b; --border-2:#383445; --border-soft:#2a2734; --border-input:#3d3949;
  --ink:#eae7f0; --ink-fg:#15141a;
  --side-bg:#100f15; --side-fg:#eae7f0; --side-dim:#8d8799; --side-line:#29262f; --side-active:#2c2937;
  --danger:#ff6b6b; --danger-bg:#3a1f24; --warn:#f0906f; --gold:#e0b571;
  --green:#7fae9b; --green-bg:#1d3329; --blue:#6aa5c9; --violet:#9092ea; --violet-bg:#2b2846;
  --slate:#9aa6bb; --today-bg:#241f2e; --on-accent:#15141a;
  --manage-bg:#2a2733; --manage-border:#423d4f; --manage-fg:#c4c0ce;
  --grid-line:#2b2836; --grid-half:#332f3f; --day-event-time:#9d97ab;
  --overlay:rgba(0,0,0,0.6); --hover-filter:brightness(1.18);
}
*{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%;width:100%;overflow:hidden;background:var(--bg)}
[data-sh="mobile-tool"]{display:none !important}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:var(--outline);border-radius:3px}
input,select,textarea,button{font-family:'DM Sans',sans-serif}

button:not(:disabled){cursor:pointer}
button:not(:disabled):hover{filter:var(--hover-filter)}
:focus-visible{outline:2px solid var(--violet);outline-offset:2px;border-radius:4px}
[data-sh="nav-btn"]:hover,[data-sh="mobile-tool"]:hover{background:var(--side-active);color:var(--side-fg)}
[data-sh="row"]{transition:border-color .12s}
[data-sh="row"]:hover{border-color:var(--outline)}
[data-sh="icon-btn"]{opacity:.5;transition:opacity .12s,color .12s}
[data-sh="row"]:hover [data-sh="icon-btn"],[data-sh="icon-btn"]:focus-visible{opacity:1}
[data-sh="icon-btn"]:hover{opacity:1;color:var(--text)}
[data-sh="del-btn"]:hover{color:var(--danger)}
@media(max-width:1024px){
  [data-sh="dash-cols"]{grid-template-columns:1fr !important}
  [data-sh="dash-grid"]{grid-template-columns:repeat(2,1fr) !important}
}
@media(max-width:768px){
  [data-sh="root"]{flex-direction:column !important}
  [data-sh="sidebar"]{width:100% !important;min-width:100% !important;flex-direction:row !important;align-items:center !important;padding:6px 8px !important;overflow:hidden !important;height:auto !important;max-height:52px !important;min-height:auto !important;flex-shrink:0 !important}
  [data-sh="sidebar-top"]{display:flex !important;flex-direction:row !important;align-items:center !important;gap:2px !important;overflow-x:auto !important;overflow-y:hidden !important;flex:1 1 auto !important;min-width:0 !important}
  [data-sh="sidebar-bottom"]{display:none !important}
  [data-sh="sidebar-clock"]{display:none !important}
  [data-sh="main"]{padding:16px !important}
  [data-sh="dash-grid"]{grid-template-columns:repeat(2,1fr) !important}
  [data-sh="notes-grid"]{grid-template-columns:1fr !important}
  [data-sh="dash-cols"]{grid-template-columns:1fr !important}
  [data-sh="week-grid"]{grid-template-columns:repeat(3,1fr) !important}
  [data-sh="logo"]{margin-bottom:0 !important;display:none !important}
  [data-sh="logo-text"],[data-sh="nav-label"],[data-sh="search-btn"]{display:none !important}
  [data-sh="nav-btn"],[data-sh="mobile-tool"]{padding:8px !important;font-size:16px !important;justify-content:center !important;width:auto !important;flex:0 0 auto !important}
  [data-sh="hamburger"]{display:none !important}
  [data-sh="mobile-tool"]{display:flex !important}
  [data-sh="sidebar"]{padding-left:calc(8px + env(safe-area-inset-left)) !important;padding-right:calc(8px + env(safe-area-inset-right)) !important}
  [data-sh="main"]{padding-bottom:calc(16px + env(safe-area-inset-bottom)) !important}
}
`;

export const S = {
  root: { display: "flex", height: "100dvh", fontFamily: "'DM Sans',sans-serif", background: "var(--bg)", color: "var(--text)", overflow: "hidden" },
  loadWrap: { display: "flex", alignItems: "center", justifyContent: "center", height: "100dvh", background: "var(--bg)", fontFamily: "'DM Sans',sans-serif" },
  loadPulse: { fontFamily: "'DM Serif Display',serif", fontSize: 28, color: "var(--text)", opacity: 0.5 },

  sidebar: { width: 190, minWidth: 190, background: "var(--side-bg)", color: "var(--side-fg)", display: "flex", flexDirection: "column", padding: "16px 10px", flexShrink: 0, overflow: "hidden", transition: "width 0.2s, min-width 0.2s" },
  sidebarCollapsed: { width: 56, minWidth: 56, padding: "16px 6px" },
  sidebarTop: { flex: 1 },
  sidebarBottom: { borderTop: "1px solid var(--side-line)", paddingTop: 12 },
  logo: { display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", marginBottom: 20, cursor: "pointer" },
  logoText: { fontFamily: "'DM Serif Display',serif", fontSize: 18, letterSpacing: "-0.5px", padding: "0 10px" },
  navBtn: { display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", border: "none", background: "transparent", color: "var(--side-dim)", borderRadius: 7, cursor: "pointer", fontSize: 13, width: "100%", textAlign: "left", transition: "all 0.12s", fontWeight: 500 },
  navActive: { background: "var(--side-active)", color: "var(--side-fg)" },
  navCollapsed: { justifyContent: "center", padding: "10px" },
  navIcon: { fontSize: 15, width: 18, textAlign: "center", flexShrink: 0 },
  miniStat: { fontSize: 11, color: "var(--text-dim)", marginBottom: 4 },

  main: { flex: 1, overflow: "auto", padding: "28px 36px", minWidth: 0 },
  page: { maxWidth: 820, margin: "0 auto" },
  pageHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  pageTitle: { fontFamily: "'DM Serif Display',serif", fontSize: 26, fontWeight: 400 },
  secTitle: { fontFamily: "'DM Serif Display',serif", fontSize: 18, fontWeight: 400, marginBottom: 10 },
  subLabel: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-faint)", marginBottom: 8 },

  greet: { marginBottom: 24 },
  greetH1: { fontFamily: "'DM Serif Display',serif", fontSize: 30, fontWeight: 400, marginBottom: 2 },
  greetSub: { color: "var(--text-dim)", fontSize: 14 },

  dashGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 28 },
  statCard: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 9, padding: "14px 16px", cursor: "pointer", textAlign: "left", transition: "transform 0.12s" },
  statVal: { fontSize: 26, fontWeight: 700, marginBottom: 2 },
  statLabel: { fontSize: 11, color: "var(--text-dim)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" },

  dashSection: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px", marginBottom: 16 },
  miniAssign: { display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--divider)" },
  miniAssignName: { fontWeight: 600, fontSize: 13 },
  miniAssignMeta: { display: "flex", gap: 6, alignItems: "center", marginTop: 2 },
  miniEventCard: { display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--divider)" },
  miniEvTime: { fontSize: 12, fontWeight: 600, color: "var(--text-dim)", width: 80, flexShrink: 0 },
  miniEvName: { fontSize: 13, fontWeight: 600, flex: 1 },

  list: { display: "flex", flexDirection: "column", gap: 6 },
  card: { display: "flex", alignItems: "flex-start", gap: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 9, padding: "12px 14px" },
  cardName: { fontWeight: 600, fontSize: 14, marginBottom: 3 },
  cardMeta: { display: "flex", gap: 6, alignItems: "center", fontSize: 12, flexWrap: "wrap" },
  cardDesc: { fontSize: 12, color: "var(--text-3)", marginTop: 5, lineHeight: 1.4 },

  badge: { color: "var(--on-accent)", padding: "1px 7px", borderRadius: 4, fontWeight: 600, fontSize: 10, textTransform: "uppercase" },
  tagSmall: { background: "var(--tag-bg)", color: "var(--text-3)", padding: "2px 7px", borderRadius: 4, fontWeight: 500, fontSize: 10 },
  dueTxt: { fontWeight: 600, fontSize: 11 },
  duePill: { fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap", letterSpacing: "0.2px" },
  courseLine: { fontSize: 13, fontWeight: 700, letterSpacing: "0.2px", marginBottom: 2 },
  rowSub: { display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: "var(--text-dim)", flexWrap: "wrap" },

  checkBtn: { width: 26, height: 26, borderRadius: "50%", border: "2px solid var(--outline)", background: "transparent", cursor: "pointer", fontSize: 13, color: "var(--outline)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 },
  xBtn: { background: "none", border: "none", cursor: "pointer", color: "var(--text-ghost)", fontSize: 14, padding: "6px 8px", lineHeight: 1, flexShrink: 0 },
  editBtn: { background: "none", border: "none", cursor: "pointer", color: "var(--text-ghost)", fontSize: 14, padding: "6px 8px", lineHeight: 1, flexShrink: 0 },
  primaryBtn: { background: "var(--ink)", color: "var(--ink-fg)", border: "none", borderRadius: 7, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  ghostBtn: { background: "none", border: "1px solid var(--border-input)", borderRadius: 7, padding: "7px 14px", fontSize: 12, color: "var(--text-dim)", cursor: "pointer" },
  closeBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "var(--text-faint)" },

  filterRow: { display: "flex", gap: 5, marginBottom: 18, flexWrap: "wrap" },
  filterBtn: { padding: "5px 12px", borderRadius: 18, border: "1px solid var(--border-2)", background: "var(--surface)", fontSize: 11, fontWeight: 500, cursor: "pointer", color: "var(--text-3)" },
  filterActive: { background: "var(--ink)", color: "var(--ink-fg)", borderColor: "var(--ink)" },
  // Sits at the end of a filter row but is an action, not a filter, so it is
  // pushed to the right and given its own weight.
  manageBtn: { marginLeft: "auto", padding: "5px 13px", borderRadius: 18, border: "1px solid var(--manage-border)", background: "var(--manage-bg)", fontSize: 11, fontWeight: 600, color: "var(--manage-fg)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" },

  formCard: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 18, marginBottom: 18, display: "flex", flexDirection: "column", gap: 10 },
  fRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  input: { padding: "9px 12px", border: "1px solid var(--border-2)", borderRadius: 7, fontSize: 13, outline: "none", background: "var(--bg)", flex: 1, minWidth: 110 },
  select: { padding: "9px 12px", border: "1px solid var(--border-2)", borderRadius: 7, fontSize: 13, outline: "none", background: "var(--bg)", cursor: "pointer" },
  toggleLabel: { display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-2)" },

  doneHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  empty: { color: "var(--text-ghost)", fontSize: 14, padding: "32px 0", textAlign: "center" },
  // Inside a dashboard card the tall version leaves a conspicuous void.
  emptyMini: { color: "var(--text-ghost)", fontSize: 13, padding: "6px 0 2px" },

  notesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10 },
  noteCard: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 14, cursor: "pointer", transition: "box-shadow 0.12s" },
  noteHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  noteTitle: { fontWeight: 700, fontSize: 14, marginBottom: 4 },
  noteBody: { fontSize: 12, color: "var(--text-3)", lineHeight: 1.5, maxHeight: 54, overflow: "hidden" },
  noteFoot: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  fileCount: { fontSize: 11, color: "var(--blue)", fontWeight: 600 },
  noteDate: { fontSize: 10, color: "var(--text-ghost-2)" },

  modal: { position: "fixed", inset: 0, background: "var(--overlay)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 },
  modalBox: { background: "var(--bg)", borderRadius: 14, padding: 24, width: "100%", maxWidth: 480, maxHeight: "80vh", overflow: "auto" },
  modalHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  modalTitle: { fontFamily: "'DM Serif Display',serif", fontSize: 20, fontWeight: 400 },
  modalInputRow: { display: "flex", gap: 8, marginTop: 14 },
  chipWrap: { display: "flex", gap: 6, flexWrap: "wrap" },
  chip: { background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 },
  chipX: { background: "none", border: "none", cursor: "pointer", color: "var(--danger)", fontSize: 12, fontWeight: 700 },

  fileRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border-soft)" },
  previewFrame: { width: "100%", height: 400, border: "1px solid var(--border)", borderRadius: 8 },
  previewImg: { maxWidth: "100%", maxHeight: 300, borderRadius: 8, border: "1px solid var(--border)" },

  searchWrap: { position: "fixed", inset: 0, background: "var(--overlay)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 1000, paddingTop: 80 },
  searchBox: { background: "var(--bg)", borderRadius: 14, padding: 20, width: "100%", maxWidth: 520, maxHeight: "70vh", overflow: "auto" },
  searchInput: { width: "100%", padding: "12px 16px", border: "1px solid var(--border-2)", borderRadius: 10, fontSize: 15, outline: "none", background: "var(--surface)", fontFamily: "'DM Sans',sans-serif" },
  searchGroup: { marginTop: 16 },
  searchGroupTitle: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-faint)", marginBottom: 6, paddingLeft: 4 },
  searchItem: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13 },

  settingsPanel: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, marginTop: 20, maxWidth: 320, margin: "20px auto 0" },
  settingsRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-soft)" },
  settingsLabel: { fontSize: 13, fontWeight: 500 },
  settingsInput: { width: 60, padding: "6px 8px", border: "1px solid var(--border-2)", borderRadius: 6, fontSize: 14, textAlign: "center", outline: "none" },

  schedNav: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 },
  viewTabs: { display: "flex", gap: 0, border: "1px solid var(--border-2)", borderRadius: 8, overflow: "hidden" },
  viewTab: { padding: "7px 16px", border: "none", background: "var(--surface)", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "var(--text-dim)" },
  viewTabActive: { background: "var(--ink)", color: "var(--ink-fg)" },
  dateNav: { display: "flex", alignItems: "center", gap: 8 },
  arrowBtn: { width: 30, height: 30, border: "1px solid var(--border-2)", borderRadius: 6, background: "var(--surface)", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" },
  dateLabel: { fontSize: 14, fontWeight: 600, minWidth: 120, textAlign: "center" },

  // Daily view is a real time axis: one hour is a fixed number of pixels and
  // every event is placed and sized from its start time and duration.
  dayWrap: { display: "flex", border: "1px solid var(--border-2)", borderRadius: 10, background: "var(--surface)", padding: "14px 12px 14px 0", overflow: "hidden" },
  dayGutter: { position: "relative", width: 64, flexShrink: 0 },
  dayHourLbl: { position: "absolute", right: 10, transform: "translateY(-50%)", fontSize: 11, color: "var(--text-ghost)", fontWeight: 500, whiteSpace: "nowrap" },
  dayTrack: { position: "relative", flex: 1, minWidth: 0 },
  dayHourLine: { position: "absolute", left: 0, right: 0, borderTop: "1px solid var(--grid-line)" },
  dayHalfLine: { position: "absolute", left: 0, right: 0, borderTop: "1px dotted var(--grid-half)" },
  dayEvent: { position: "absolute", boxSizing: "border-box", borderRadius: 6, padding: "3px 8px", overflow: "hidden", cursor: "pointer" },
  dayEventName: { fontWeight: 600, fontSize: 12, lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  dayEventTime: { fontSize: 10, color: "var(--day-event-time)", lineHeight: 1.35 },
  dayEventBtns: { position: "absolute", top: 2, right: 4, display: "flex", gap: 2 },
  dayEmpty: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-ghost-2)", fontSize: 13, pointerEvents: "none" },

  dayPicker: { display: "flex", gap: 4, flexWrap: "wrap" },
  dayToggle: { width: 38, padding: "8px 0", borderRadius: 7, border: "1px solid var(--border-2)", background: "var(--bg)", fontSize: 11, fontWeight: 600, color: "var(--text-dim)", cursor: "pointer" },
  dayToggleOn: { background: "var(--ink)", borderColor: "var(--ink)", color: "var(--ink-fg)" },
  blockName: { fontWeight: 600, fontSize: 13 },
  blockMeta: { display: "flex", gap: 5, alignItems: "center", marginTop: 2 },

  weekGrid: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 0, border: "1px solid var(--border-2)", borderRadius: 10 },
  weekCol: { borderRight: "1px solid var(--border-soft)", minHeight: 180 },
  weekDayHead: { textAlign: "center", padding: "8px 4px", borderBottom: "1px solid var(--border-soft)", color: "var(--text-dim)" },
  weekEvents: { padding: 4 },
  weekEvent: { background: "var(--surface)", borderRadius: 4, padding: "4px 6px", marginBottom: 3, fontSize: 11 },

  monthHeader: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 0, marginBottom: 4 },
  monthDayLabel: { textAlign: "center", fontSize: 11, fontWeight: 600, color: "var(--text-ghost)", padding: 4 },
  monthGrid: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 0, border: "1px solid var(--border-2)", borderRadius: 10, overflow: "hidden" },
  monthCell: { minHeight: 72, borderRight: "1px solid var(--border-soft)", borderBottom: "1px solid var(--border-soft)", padding: 4 },
  monthDateNum: { fontSize: 13, fontWeight: 500, marginBottom: 2, color: "var(--text-2)" },
  monthDot: { borderRadius: 3, padding: "1px 4px", marginBottom: 1, overflow: "hidden" },

  examDetails: { borderTop: "1px solid var(--border-soft)", marginTop: 10, paddingTop: 10, width: "100%" },
  examRow: { fontSize: 13, color: "var(--text-2)", marginBottom: 6, lineHeight: 1.5 },

  timerWrap: { display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 16 },
  timerRing: { position: "relative", display: "flex", alignItems: "center", justifyContent: "center" },
  timerInner: { position: "absolute", textAlign: "center" },
  timerLabel: { fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "var(--text-dim)", marginBottom: 2 },
  timerDigits: { fontFamily: "'DM Serif Display',serif", fontSize: 44, fontWeight: 400 },
  timerBtns: { display: "flex", gap: 10, marginTop: 20 },
  timerBtn: { background: "var(--danger)", color: "var(--on-accent)", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  sessCount: { marginTop: 16, fontSize: 13, color: "var(--text-dim)" },
};

const DUE_TONE = {
  overdue:  { background: "var(--danger)", color: "var(--on-accent)" },
  today:    { background: "var(--warn)", color: "var(--on-accent)" },
  tomorrow: { background: "var(--tag-bg)", color: "var(--warn)" },
  soon:     { background: "var(--tag-bg)", color: "var(--gold)" },
  later:    { background: "var(--tag-bg)", color: "var(--text-dim)" },
};

export const duePill = (cls) => ({ ...S.duePill, ...(DUE_TONE[cls] || DUE_TONE.later) });
