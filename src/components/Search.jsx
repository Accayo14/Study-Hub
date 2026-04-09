import { useState, useEffect, useRef } from 'react';
import { S } from '../styles';

export default function Search({ D, onClose, onNavigate }) {
  const [q, setQ] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const lq = q.toLowerCase().trim();
  const results = [];

  if (lq.length >= 2) {
    const matchAssignments = D.assignments.filter(a =>
      a.name.toLowerCase().includes(lq) || a.subject?.toLowerCase().includes(lq) || a.description?.toLowerCase().includes(lq)
    );
    if (matchAssignments.length) results.push({ type: 'assignments', label: 'Assignments', icon: '✓', items: matchAssignments.slice(0, 5) });

    const matchNotes = D.notes.filter(n =>
      n.title.toLowerCase().includes(lq) || n.subject?.toLowerCase().includes(lq) || n.content?.toLowerCase().includes(lq)
    );
    if (matchNotes.length) results.push({ type: 'notes', label: 'Notes', icon: '✎', items: matchNotes.slice(0, 5) });

    const matchExams = D.exams.filter(e =>
      e.name.toLowerCase().includes(lq) || e.subject?.toLowerCase().includes(lq) || e.syllabus?.toLowerCase().includes(lq)
    );
    if (matchExams.length) results.push({ type: 'exams', label: 'Exams', icon: '✦', items: matchExams.slice(0, 5) });

    const matchTasks = D.tasks.filter(t =>
      t.name.toLowerCase().includes(lq) || t.category?.toLowerCase().includes(lq) || t.description?.toLowerCase().includes(lq)
    );
    if (matchTasks.length) results.push({ type: 'tasks', label: 'Other Tasks', icon: '◈', items: matchTasks.slice(0, 5) });

    const matchEvents = D.scheduleEvents.filter(e =>
      e.name.toLowerCase().includes(lq) || e.subject?.toLowerCase().includes(lq)
    );
    if (matchEvents.length) results.push({ type: 'schedule', label: 'Schedule', icon: '▦', items: matchEvents.slice(0, 5) });
  }

  return (
    <div style={S.searchWrap} onClick={onClose}>
      <div style={S.searchBox} onClick={e => e.stopPropagation()}>
        <input ref={inputRef} style={S.searchInput} placeholder="Search assignments, notes, exams..."
          value={q} onChange={e => setQ(e.target.value)}
          onKeyDown={e => { if (e.key === 'Escape') onClose(); }} />
        {lq.length >= 2 && results.length === 0 && <p style={{ ...S.empty, padding: "20px 0" }}>No results found.</p>}
        {results.map(group => (
          <div key={group.type} style={S.searchGroup}>
            <div style={S.searchGroupTitle}>{group.icon} {group.label}</div>
            {group.items.map(item => (
              <div key={item.id} style={S.searchItem}
                onMouseEnter={e => { e.currentTarget.style.background = '#f0ece6'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                onClick={() => { onNavigate(group.type); onClose(); }}>
                <span style={{ fontWeight: 600 }}>{item.name || item.title}</span>
                {item.subject && <span style={S.tagSmall}>{item.subject}</span>}
              </div>
            ))}
          </div>
        ))}
        {lq.length < 2 && <p style={{ ...S.empty, padding: "20px 0", fontSize: 13 }}>Type at least 2 characters to search...</p>}
      </div>
    </div>
  );
}
