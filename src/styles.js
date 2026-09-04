export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700&family=DM+Serif+Display&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%;width:100%;overflow:hidden;background:#faf8f5}
[data-sh="mobile-tool"]{display:none !important}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#ccc;border-radius:3px}
input,select,textarea,button{font-family:'DM Sans',sans-serif}
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
  root: { display: "flex", height: "100dvh", fontFamily: "'DM Sans',sans-serif", background: "#faf8f5", color: "#2b2b2b", overflow: "hidden" },
  loadWrap: { display: "flex", alignItems: "center", justifyContent: "center", height: "100dvh", background: "#faf8f5", fontFamily: "'DM Sans',sans-serif" },
  loadPulse: { fontFamily: "'DM Serif Display',serif", fontSize: 28, color: "#2b2b2b", opacity: 0.5 },

  sidebar: { width: 190, minWidth: 190, background: "#2b2b2b", color: "#faf8f5", display: "flex", flexDirection: "column", padding: "16px 10px", flexShrink: 0, overflow: "hidden", transition: "width 0.2s, min-width 0.2s" },
  sidebarCollapsed: { width: 56, minWidth: 56, padding: "16px 6px" },
  sidebarTop: { flex: 1 },
  sidebarBottom: { borderTop: "1px solid #3d3d3d", paddingTop: 12 },
  logo: { display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", marginBottom: 20, cursor: "pointer" },
  logoText: { fontFamily: "'DM Serif Display',serif", fontSize: 18, letterSpacing: "-0.5px", padding: "0 10px" },
  navBtn: { display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", border: "none", background: "transparent", color: "#a8a8a8", borderRadius: 7, cursor: "pointer", fontSize: 13, width: "100%", textAlign: "left", transition: "all 0.12s", fontWeight: 500 },
  navActive: { background: "#3d3d3d", color: "#faf8f5" },
  navCollapsed: { justifyContent: "center", padding: "10px" },
  navIcon: { fontSize: 15, width: 18, textAlign: "center", flexShrink: 0 },
  miniStat: { fontSize: 11, color: "#888", marginBottom: 4 },

  main: { flex: 1, overflow: "auto", padding: "28px 36px", minWidth: 0 },
  page: { maxWidth: 820, margin: "0 auto" },
  pageHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  pageTitle: { fontFamily: "'DM Serif Display',serif", fontSize: 26, fontWeight: 400 },
  secTitle: { fontFamily: "'DM Serif Display',serif", fontSize: 18, fontWeight: 400, marginBottom: 10 },
  subLabel: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "#999", marginBottom: 8 },

  greet: { marginBottom: 24 },
  greetH1: { fontFamily: "'DM Serif Display',serif", fontSize: 30, fontWeight: 400, marginBottom: 2 },
  greetSub: { color: "#888", fontSize: 14 },

  dashGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 28 },
  statCard: { background: "#fff", border: "1px solid #e8e0d8", borderRadius: 9, padding: "14px 16px", cursor: "pointer", textAlign: "left", transition: "transform 0.12s" },
  statVal: { fontSize: 26, fontWeight: 700, marginBottom: 2 },
  statLabel: { fontSize: 11, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" },

  dashSection: { background: "#fff", border: "1px solid #e8e0d8", borderRadius: 12, padding: "18px 20px", marginBottom: 16 },
  miniAssign: { display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f4f0ec" },
  miniAssignName: { fontWeight: 600, fontSize: 13 },
  miniAssignMeta: { display: "flex", gap: 6, alignItems: "center", marginTop: 2 },
  miniEventCard: { display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f4f0ec" },
  miniEvTime: { fontSize: 12, fontWeight: 600, color: "#888", width: 80, flexShrink: 0 },
  miniEvName: { fontSize: 13, fontWeight: 600, flex: 1 },

  list: { display: "flex", flexDirection: "column", gap: 6 },
  card: { display: "flex", alignItems: "flex-start", gap: 12, background: "#fff", border: "1px solid #e8e0d8", borderRadius: 9, padding: "12px 14px" },
  cardName: { fontWeight: 600, fontSize: 14, marginBottom: 3 },
  cardMeta: { display: "flex", gap: 6, alignItems: "center", fontSize: 12, flexWrap: "wrap" },
  cardDesc: { fontSize: 12, color: "#777", marginTop: 5, lineHeight: 1.4 },

  badge: { color: "#fff", padding: "1px 7px", borderRadius: 4, fontWeight: 600, fontSize: 10, textTransform: "uppercase" },
  tagSmall: { background: "#f0ece6", color: "#666", padding: "2px 7px", borderRadius: 4, fontWeight: 500, fontSize: 10 },
  dueTxt: { fontWeight: 600, fontSize: 11 },

  checkBtn: { width: 26, height: 26, borderRadius: "50%", border: "2px solid #ccc", background: "transparent", cursor: "pointer", fontSize: 13, color: "#ccc", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 },
  xBtn: { background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 13, padding: 3, flexShrink: 0 },
  editBtn: { background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 14, padding: "2px 6px", flexShrink: 0 },
  primaryBtn: { background: "#2b2b2b", color: "#faf8f5", border: "none", borderRadius: 7, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  ghostBtn: { background: "none", border: "1px solid #ddd", borderRadius: 7, padding: "7px 14px", fontSize: 12, color: "#888", cursor: "pointer" },
  closeBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#999" },

  filterRow: { display: "flex", gap: 5, marginBottom: 18, flexWrap: "wrap" },
  filterBtn: { padding: "5px 12px", borderRadius: 18, border: "1px solid #e0d8d0", background: "#fff", fontSize: 11, fontWeight: 500, cursor: "pointer", color: "#666" },
  filterActive: { background: "#2b2b2b", color: "#faf8f5", borderColor: "#2b2b2b" },

  formCard: { background: "#fff", border: "1px solid #e8e0d8", borderRadius: 10, padding: 18, marginBottom: 18, display: "flex", flexDirection: "column", gap: 10 },
  fRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  input: { padding: "9px 12px", border: "1px solid #e0d8d0", borderRadius: 7, fontSize: 13, outline: "none", background: "#faf8f5", flex: 1, minWidth: 110 },
  select: { padding: "9px 12px", border: "1px solid #e0d8d0", borderRadius: 7, fontSize: 13, outline: "none", background: "#faf8f5", cursor: "pointer" },
  toggleLabel: { display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#555" },

  doneHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  empty: { color: "#aaa", fontSize: 14, padding: "32px 0", textAlign: "center" },

  notesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10 },
  noteCard: { background: "#fff", border: "1px solid #e8e0d8", borderRadius: 10, padding: 14, cursor: "pointer", transition: "box-shadow 0.12s" },
  noteHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  noteTitle: { fontWeight: 700, fontSize: 14, marginBottom: 4 },
  noteBody: { fontSize: 12, color: "#666", lineHeight: 1.5, maxHeight: 54, overflow: "hidden" },
  noteFoot: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  fileCount: { fontSize: 11, color: "#457b9d", fontWeight: 600 },
  noteDate: { fontSize: 10, color: "#bbb" },

  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 },
  modalBox: { background: "#faf8f5", borderRadius: 14, padding: 24, width: "100%", maxWidth: 480, maxHeight: "80vh", overflow: "auto" },
  modalHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  modalTitle: { fontFamily: "'DM Serif Display',serif", fontSize: 20, fontWeight: 400 },
  modalInputRow: { display: "flex", gap: 8, marginTop: 14 },
  chipWrap: { display: "flex", gap: 6, flexWrap: "wrap" },
  chip: { background: "#fff", border: "1px solid #e0d8d0", borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 },
  chipX: { background: "none", border: "none", cursor: "pointer", color: "#c1121f", fontSize: 12, fontWeight: 700 },

  fileRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #f0ece6" },
  previewFrame: { width: "100%", height: 400, border: "1px solid #e8e0d8", borderRadius: 8 },
  previewImg: { maxWidth: "100%", maxHeight: 300, borderRadius: 8, border: "1px solid #e8e0d8" },

  searchWrap: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 1000, paddingTop: 80 },
  searchBox: { background: "#faf8f5", borderRadius: 14, padding: 20, width: "100%", maxWidth: 520, maxHeight: "70vh", overflow: "auto" },
  searchInput: { width: "100%", padding: "12px 16px", border: "1px solid #e0d8d0", borderRadius: 10, fontSize: 15, outline: "none", background: "#fff", fontFamily: "'DM Sans',sans-serif" },
  searchGroup: { marginTop: 16 },
  searchGroupTitle: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "#999", marginBottom: 6, paddingLeft: 4 },
  searchItem: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13 },

  settingsPanel: { background: "#fff", border: "1px solid #e8e0d8", borderRadius: 10, padding: 16, marginTop: 20, maxWidth: 320, margin: "20px auto 0" },
  settingsRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0ece6" },
  settingsLabel: { fontSize: 13, fontWeight: 500 },
  settingsInput: { width: 60, padding: "6px 8px", border: "1px solid #e0d8d0", borderRadius: 6, fontSize: 14, textAlign: "center", outline: "none" },

  schedNav: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 },
  viewTabs: { display: "flex", gap: 0, border: "1px solid #e0d8d0", borderRadius: 8, overflow: "hidden" },
  viewTab: { padding: "7px 16px", border: "none", background: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#888" },
  viewTabActive: { background: "#2b2b2b", color: "#faf8f5" },
  dateNav: { display: "flex", alignItems: "center", gap: 8 },
  arrowBtn: { width: 30, height: 30, border: "1px solid #e0d8d0", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" },
  dateLabel: { fontSize: 14, fontWeight: 600, minWidth: 120, textAlign: "center" },

  dailyGrid: { display: "flex", flexDirection: "column" },
  hourRow: { display: "flex", minHeight: 48, borderBottom: "1px solid #f0ece6" },
  hourLbl: { width: 64, fontSize: 11, color: "#aaa", fontWeight: 500, paddingTop: 6, flexShrink: 0 },
  hourSlot: { flex: 1, display: "flex", flexDirection: "column", gap: 4, padding: "4px 0" },
  schedBlock: { background: "#fff", border: "1px solid #e8e0d8", borderRadius: 7, padding: "8px 12px", display: "flex", alignItems: "center" },
  blockName: { fontWeight: 600, fontSize: 13 },
  blockMeta: { display: "flex", gap: 5, alignItems: "center", marginTop: 2 },

  weekGrid: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 0, border: "1px solid #e0d8d0", borderRadius: 10 },
  weekCol: { borderRight: "1px solid #f0ece6", minHeight: 180 },
  weekDayHead: { textAlign: "center", padding: "8px 4px", borderBottom: "1px solid #f0ece6", color: "#888" },
  weekEvents: { padding: 4 },
  weekEvent: { background: "#fff", borderRadius: 4, padding: "4px 6px", marginBottom: 3, fontSize: 11 },

  monthHeader: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 0, marginBottom: 4 },
  monthDayLabel: { textAlign: "center", fontSize: 11, fontWeight: 600, color: "#aaa", padding: 4 },
  monthGrid: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 0, border: "1px solid #e0d8d0", borderRadius: 10, overflow: "hidden" },
  monthCell: { minHeight: 72, borderRight: "1px solid #f0ece6", borderBottom: "1px solid #f0ece6", padding: 4 },
  monthDateNum: { fontSize: 13, fontWeight: 500, marginBottom: 2, color: "#555" },
  monthDot: { borderRadius: 3, padding: "1px 4px", marginBottom: 1, overflow: "hidden" },

  examDetails: { borderTop: "1px solid #f0ece6", marginTop: 10, paddingTop: 10, width: "100%" },
  examRow: { fontSize: 13, color: "#555", marginBottom: 6, lineHeight: 1.5 },

  timerWrap: { display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 16 },
  timerRing: { position: "relative", display: "flex", alignItems: "center", justifyContent: "center" },
  timerInner: { position: "absolute", textAlign: "center" },
  timerLabel: { fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#888", marginBottom: 2 },
  timerDigits: { fontFamily: "'DM Serif Display',serif", fontSize: 44, fontWeight: 400 },
  timerBtns: { display: "flex", gap: 10, marginTop: 20 },
  timerBtn: { background: "#c1121f", color: "#fff", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  sessCount: { marginTop: 16, fontSize: 13, color: "#888" },
};
