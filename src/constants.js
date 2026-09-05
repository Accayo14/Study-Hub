// Courses seeded into a brand new account on first sign-in. Empty so that
// anyone signing up starts clean and adds their own with "+ Course";
// a personal fork can list its own course codes here instead.
export const DEFAULT_SUBJECTS = [];
export const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
export const P_COLORS = { Low: "#6b9080", Medium: "#d4a35a", High: "#e07a5f", Urgent: "#c1121f" };
export const TASK_CATEGORIES = ["Club / Society", "Sports", "Personal", "Freelance", "Volunteering", "Other"];
export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const HOURS = Array.from({ length: 18 }, (_, i) => i + 5);

export const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "◉" },
  { id: "schedule", label: "Schedule", icon: "▦" },
  { id: "exams", label: "Exams", icon: "✦" },
  { id: "assignments", label: "Assignments", icon: "✓" },
  { id: "studyplan", label: "Study Plan", icon: "📖" },
  { id: "tasks", label: "Other Tasks", icon: "◈" },
  { id: "notes", label: "Notes", icon: "✎" },
  { id: "focus", label: "Focus", icon: "⏱" },
];

export const fmtH = (h, m = 0, use24h = false) => {
  if (use24h) {
    const hh = String(h).padStart(2, "0");
    return m ? `${hh}:${String(m).padStart(2, "0")}` : `${hh}:00`;
  }
  const ap = h >= 12 ? "PM" : "AM";
  const hh = h % 12 || 12;
  return m ? `${hh}:${String(m).padStart(2, "0")} ${ap}` : `${hh} ${ap}`;
};

export const toISO = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};
export const today = () => toISO(new Date());
export const isSameDay = (a, b) => toISO(a) === toISO(b);

export function dueInfo(d) {
  // Compare calendar dates only (no time-of-day influence)
  const now = new Date();
  const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // Parse the due date as local midnight
  const [y, m, day] = d.split("-").map(Number);
  const dueMid = new Date(y, m - 1, day);
  const diff = Math.round((dueMid - todayMid) / 864e5);
  if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, cls: "overdue", urgent: true };
  if (diff === 0) return { text: "Today", cls: "today", urgent: true };
  if (diff === 1) return { text: "Tomorrow", cls: "tomorrow", urgent: true };
  if (diff <= 7) return { text: `${diff} days left`, cls: "soon", urgent: false };
  return { text: new Date(y, m - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric" }), cls: "later", urgent: false };
}
