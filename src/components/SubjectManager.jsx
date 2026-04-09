import { useState } from 'react';
import { S } from '../styles';

export function SubjectManager({ subjects, addSubject, removeSubject, onClose }) {
  const [val, setVal] = useState("");
  return (
    <div style={S.modal} onClick={onClose}>
      <div style={S.modalBox} onClick={e => e.stopPropagation()}>
        <div style={S.modalHead}>
          <h3 style={S.modalTitle}>Manage Courses</h3>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={S.chipWrap}>
          {subjects.map(s => (
            <div key={s} style={S.chip}>
              {s}
              <button style={S.chipX} onClick={() => removeSubject(s)}>✕</button>
            </div>
          ))}
        </div>
        <div style={S.modalInputRow}>
          <input style={S.input} placeholder="New course name..." value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && val.trim()) { addSubject(val.trim()); setVal(""); } }} />
          <button style={S.primaryBtn} onClick={() => { if (val.trim()) { addSubject(val.trim()); setVal(""); } }}>Add</button>
        </div>
      </div>
    </div>
  );
}

export function SubjectSelect({ subjects, value, onChange }) {
  return (
    <select style={S.select} value={value} onChange={e => onChange(e.target.value)}>
      {subjects.map(s => <option key={s}>{s}</option>)}
    </select>
  );
}

export function SubjectFilter({ subjects, filter, setFilter, onManage }) {
  return (
    <div style={S.filterRow}>
      {["all", ...subjects].map(s => (
        <button key={s} onClick={() => setFilter(s)}
          style={{ ...S.filterBtn, ...(filter === s ? S.filterActive : {}) }}>
          {s === "all" ? "All" : s}
        </button>
      ))}
      <button style={{ ...S.filterBtn, border: "1px dashed #c0b8a8" }} onClick={onManage}>+ Course</button>
    </div>
  );
}
