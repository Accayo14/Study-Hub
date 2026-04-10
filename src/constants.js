export const DEFAULT_SUBJECTS = ["ME218", "ME213", "ME230", "ME444", "ME228", "ME219", "DE250", "DS303"];
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

export const toISO = (d) => new Date(d).toISOString().slice(0, 10);
export const today = () => toISO(new Date());
export const isSameDay = (a, b) => toISO(a) === toISO(b);

export function dueInfo(d) {
  const date = new Date(d + "T23:59:59");
  const now = new Date();
  const diff = Math.floor((date - now) / 864e5);
  if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, cls: "overdue", urgent: true };
  if (diff === 0) return { text: "Today", cls: "today", urgent: true };
  if (diff === 1) return { text: "Tomorrow", cls: "tomorrow", urgent: true };
  if (diff <= 7) return { text: `${diff} days left`, cls: "soon", urgent: false };
  return { text: new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }), cls: "later", urgent: false };
}
