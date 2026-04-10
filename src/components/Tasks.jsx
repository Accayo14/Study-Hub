import { useState } from 'react';
import { dueInfo, TASK_CATEGORIES, PRIORITIES, P_COLORS } from '../constants';
import { S } from '../styles';

function useCustomCategories() {
  const [custom, setCustom] = useState(() => {
    try { return JSON.parse(localStorage.getItem("studyhub_task_cats") || "[]"); } catch { return []; }
  });
  const all = [...TASK_CATEGORIES, ...custom];
  const addCategory = (name) => {
    if (all.includes(name)) return;
    const next = [...custom, name];
    setCustom(next);
    localStorage.setItem("studyhub_task_cats", JSON.stringify(next));
  };
  const removeCategory = (name) => {
    if (TASK_CATEGORIES.includes(name)) return;
    const next = custom.filter(c => c !== name);
    setCustom(next);
    localStorage.setItem("studyhub_task_cats", JSON.stringify(next));
  };
  return { categories: all, customCategories: custom, addCategory, removeCategory };
}

export default function Tasks({ D, form, setForm, addTask, toggleTask, deleteTask, updateTask }) {
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [showCatMgr, setShowCatMgr] = useState(false);
  const { categories, customCategories, addCategory, removeCategory } = useCustomCategories();
  const pending = D.tasks.filter(t => !t.done);
  const done = D.tasks.filter(t => t.done);
  const filtered = filter === "all" ? pending : pending.filter(t => t.category === filter);
  const sorted = [...filtered].sort((a, b) => (a.due && b.due ? new Date(a.due) - new Date(b.due) : a.due ? -1 : 1));

  return (
    <div style={S.page}>
      {showCatMgr && <CategoryManager categories={categories} customCategories={customCategories} addCategory={addCategory} removeCategory={removeCategory} onClose={() => setShowCatMgr(false)} />}
      <div style={S.pageHead}><h1 style={S.pageTitle}>Other Tasks</h1>
        <button style={S.primaryBtn} onClick={() => { setForm(form === "task" ? null : "task"); setEditing(null); }}>
          {form === "task" && !editing ? "✕ Cancel" : "+ Add Task"}
        </button>
      </div>
      {(form === "task" || editing) && (
        <TaskForm editing={editing} categories={categories}
          onAdd={t => { addTask(t); setForm(null); }}
          onSave={(id, fields) => { updateTask(id, fields); setEditing(null); }}
          onCancel={() => { setEditing(null); setForm(null); }} />
      )}
      <div style={S.filterRow}>
        {["all", ...categories].map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{ ...S.filterBtn, ...(filter === c ? S.filterActive : {}) }}>
            {c === "all" ? "All" : c}
          </button>
        ))}
        <button style={{ ...S.filterBtn, border: "1px dashed #c0b8a8" }} onClick={() => setShowCatMgr(true)}>+ Category</button>
      </div>
      {sorted.length === 0 && <p style={S.empty}>No tasks here. Add clubs, personal errands, side projects...</p>}
      <div style={S.list}>
        {sorted.map(t => {
          const di = t.due ? dueInfo(t.due) : null;
          return (
            <div key={t.id} style={S.card}>
              <button style={S.checkBtn} onClick={() => toggleTask(t.id)}>○</button>
              <div style={{ flex: 1 }}>
                <div style={S.cardName}>{t.name}</div>
                <div style={S.cardMeta}>
                  <span style={{ ...S.badge, background: P_COLORS[t.priority] }}>{t.priority}</span>
                  <span style={S.tagSmall}>{t.category}</span>
                  {di && <span style={{ ...S.dueTxt, color: di.cls === "overdue" ? "#c1121f" : "#888" }}>{di.text}</span>}
                </div>
                {t.description && <div style={S.cardDesc}>{t.description}</div>}
              </div>
              <button style={S.editBtn} onClick={() => { setEditing(t); setForm(null); }} title="Edit">✎</button>
              <button style={S.xBtn} onClick={() => deleteTask(t.id)}>✕</button>
            </div>
          );
        })}
      </div>
      {done.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <h2 style={S.secTitle}>✓ Done ({done.length})</h2>
          {done.map(t => (
            <div key={t.id} style={{ ...S.card, opacity: 0.45 }}>
              <button style={{ ...S.checkBtn, color: "#6b9080" }} onClick={() => toggleTask(t.id)}>●</button>
              <div style={{ flex: 1, textDecoration: "line-through" }}><div style={S.cardName}>{t.name}</div></div>
              <button style={S.xBtn} onClick={() => deleteTask(t.id)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TaskForm({ editing, categories, onAdd, onSave, onCancel }) {
  const initial = editing
    ? { name: editing.name, category: editing.category, priority: editing.priority, due: editing.due || '', description: editing.description || '' }
    : { name: "", category: categories[0] || "Personal", priority: "Medium", due: "", description: "" };
  const [f, setF] = useState(initial);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    if (!f.name.trim()) return;
    if (editing) onSave(editing.id, { name: f.name.trim(), category: f.category, priority: f.priority, due: f.due || null, description: f.description });
    else onAdd({ ...f, name: f.name.trim() });
  };

  return (
    <div style={S.formCard}>
      <input style={S.input} placeholder="Task name..." value={f.name} onChange={e => set("name", e.target.value)} autoFocus />
      <div style={S.fRow}>
        <select style={S.select} value={f.category} onChange={e => set("category", e.target.value)}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select style={S.select} value={f.priority} onChange={e => set("priority", e.target.value)}>
          {PRIORITIES.map(p => <option key={p}>{p}</option>)}
        </select>
        <input style={S.input} type="date" value={f.due} onChange={e => set("due", e.target.value)} />
      </div>
      <textarea style={{ ...S.input, minHeight: 40 }} placeholder="Description (optional)..." value={f.description} onChange={e => set("description", e.target.value)} />
      <div style={S.fRow}>
        <button style={S.primaryBtn} onClick={handleSubmit}>{editing ? "Save Changes" : "Add Task"}</button>
        {editing && <button style={S.ghostBtn} onClick={onCancel}>Cancel</button>}
      </div>
    </div>
  );
}

function CategoryManager({ categories, customCategories, addCategory, removeCategory, onClose }) {
  const [val, setVal] = useState("");
  return (
    <div style={S.modal} onClick={onClose}>
      <div style={S.modalBox} onClick={e => e.stopPropagation()}>
        <div style={S.modalHead}>
          <h3 style={S.modalTitle}>Manage Categories</h3>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={S.chipWrap}>
          {categories.map(c => (
            <div key={c} style={S.chip}>
              {c}
              {customCategories.includes(c) && <button style={S.chipX} onClick={() => removeCategory(c)}>✕</button>}
            </div>
          ))}
        </div>
        <div style={S.modalInputRow}>
          <input style={S.input} placeholder="New category name..." value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && val.trim()) { addCategory(val.trim()); setVal(""); } }} />
          <button style={S.primaryBtn} onClick={() => { if (val.trim()) { addCategory(val.trim()); setVal(""); } }}>Add</button>
        </div>
      </div>
    </div>
  );
}
