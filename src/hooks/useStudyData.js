import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DEFAULT_SUBJECTS } from '../constants';

export function useStudyData(userId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Declared inside the effect so it cannot be referenced before it exists and
  // does not need to be a dependency of itself.
  useEffect(() => {
    if (!userId) return;

    const loadAllData = async () => {
      try {
        const [
          { data: subjects },
          { data: assignments },
          { data: notes },
          { data: scheduleEvents },
          { data: exams },
          { data: tasks },
        ] = await Promise.all([
          supabase.from('subjects').select('*').eq('user_id', userId).order('created_at'),
          supabase.from('assignments').select('*').eq('user_id', userId).order('created_at'),
          supabase.from('notes').select('*, note_files(*)').eq('user_id', userId).order('created_at', { ascending: false }),
          supabase.from('schedule_events').select('*').eq('user_id', userId).order('created_at'),
          supabase.from('exams').select('*').eq('user_id', userId).order('created_at'),
          supabase.from('tasks').select('*').eq('user_id', userId).order('created_at'),
        ]);

        let subjectNames;
        if (subjects && subjects.length > 0) {
          subjectNames = subjects.map(s => s.name);
        } else if (DEFAULT_SUBJECTS.length > 0) {
          await supabase.from('subjects').insert(DEFAULT_SUBJECTS.map(name => ({ user_id: userId, name })));
          subjectNames = [...DEFAULT_SUBJECTS];
        } else {
          // No seed list configured: the account starts with no courses.
          subjectNames = [];
        }

        setData({
          subjects: subjectNames,
          assignments: assignments || [],
          notes: (notes || []).map(n => ({
            ...n,
            fileCount: n.note_files?.length || 0,
            ts: new Date(n.created_at).getTime(),
          })),
          scheduleEvents: (scheduleEvents || []).map(e => ({
            ...e,
            startHour: e.start_hour,
            startMin: e.start_min,
            eventType: e.event_type,
            dayOfWeek: e.day_of_week,
          })),
          exams: exams || [],
          tasks: tasks || [],
          pomodoro: { work: 25, break: 5 },
        });
      } catch (err) {
        console.error('Failed to load data:', err);
        setData({
          subjects: [...DEFAULT_SUBJECTS],
          assignments: [],
          notes: [],
          scheduleEvents: [],
          exams: [],
          tasks: [],
          pomodoro: { work: 25, break: 5 },
        });
      }
      setLoading(false);
    };

    loadAllData();
  }, [userId]);

  // ── Subjects ──
  const addSubject = async (name) => {
    setData(prev => ({ ...prev, subjects: [...prev.subjects, name] }));
    await supabase.from('subjects').insert({ user_id: userId, name });
  };

  const removeSubject = async (name) => {
    setData(prev => ({ ...prev, subjects: prev.subjects.filter(s => s !== name) }));
    await supabase.from('subjects').delete().eq('user_id', userId).eq('name', name);
  };

  // ── Assignments ──
  const addAssignment = async (a) => {
    const { data: row } = await supabase.from('assignments')
      .insert({ user_id: userId, name: a.name, subject: a.subject, priority: a.priority, due: a.due, time: a.time || null, description: a.description, type: a.type || 'assignment' })
      .select().single();
    if (row) setData(prev => ({ ...prev, assignments: [...prev.assignments, row] }));
  };

  const toggleAssignment = async (id) => {
    const item = data.assignments.find(a => a.id === id);
    if (!item) return;
    setData(prev => ({ ...prev, assignments: prev.assignments.map(a => a.id === id ? { ...a, done: !a.done } : a) }));
    await supabase.from('assignments').update({ done: !item.done }).eq('id', id);
  };

  const deleteAssignment = async (id) => {
    setData(prev => ({ ...prev, assignments: prev.assignments.filter(a => a.id !== id) }));
    await supabase.from('assignments').delete().eq('id', id);
  };

  const clearDone = async () => {
    const doneIds = data.assignments.filter(a => a.done).map(a => a.id);
    if (!doneIds.length) return;
    setData(prev => ({ ...prev, assignments: prev.assignments.filter(a => !a.done) }));
    await supabase.from('assignments').delete().in('id', doneIds);
  };

  // ── Notes ──
  const addNote = async (n) => {
    const { data: row, error } = await supabase.from('notes')
      .insert({ user_id: userId, title: n.title, subject: n.subject, content: n.content })
      .select('*, note_files(*)').single();
    if (error) { console.error('addNote error:', error); alert('Failed to create note: ' + error.message); return null; }
    if (row) {
      const mapped = { ...row, fileCount: 0, ts: new Date(row.created_at).getTime() };
      setData(prev => ({ ...prev, notes: [mapped, ...prev.notes] }));
      return mapped;
    }
    return null;
  };

  const updateNote = async (id, upd) => {
    setData(prev => ({ ...prev, notes: prev.notes.map(n => n.id === id ? { ...n, ...upd } : n) }));
    const dbFields = {};
    if (upd.title !== undefined) dbFields.title = upd.title;
    if (upd.subject !== undefined) dbFields.subject = upd.subject;
    if (upd.content !== undefined) dbFields.content = upd.content;
    if (Object.keys(dbFields).length) {
      await supabase.from('notes').update(dbFields).eq('id', id);
    }
  };

  const deleteNote = async (id) => {
    const note = data.notes.find(n => n.id === id);
    if (note?.note_files?.length) {
      const paths = note.note_files.map(f => f.file_path);
      await supabase.storage.from('note-files').remove(paths);
    }
    setData(prev => ({ ...prev, notes: prev.notes.filter(n => n.id !== id) }));
    await supabase.from('notes').delete().eq('id', id);
  };

  // ── Note Files ──
  const uploadNoteFile = async (noteId, file) => {
    const filePath = `${userId}/${noteId}/${Date.now()}_${file.name}`;
    const { error: uploadErr } = await supabase.storage.from('note-files').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (uploadErr) {
      console.error('Storage upload error:', uploadErr);
      throw new Error(`Storage: ${uploadErr.message}`);
    }

    const { data: fileRecord, error: dbErr } = await supabase.from('note_files')
      .insert({ note_id: noteId, file_name: file.name, file_path: filePath, file_type: file.type, file_size: file.size })
      .select().single();
    if (dbErr) {
      console.error('note_files insert error:', dbErr);
      await supabase.storage.from('note-files').remove([filePath]);
      throw new Error(`DB: ${dbErr.message}`);
    }

    if (fileRecord) {
      setData(prev => ({
        ...prev,
        notes: prev.notes.map(n => {
          if (n.id !== noteId) return n;
          const files = [...(n.note_files || []), fileRecord];
          return { ...n, note_files: files, fileCount: files.length };
        }),
      }));
    }
    return fileRecord;
  };

  const deleteNoteFile = async (noteId, fileId, filePath) => {
    await supabase.storage.from('note-files').remove([filePath]);
    await supabase.from('note_files').delete().eq('id', fileId);
    setData(prev => ({
      ...prev,
      notes: prev.notes.map(n => {
        if (n.id !== noteId) return n;
        const files = (n.note_files || []).filter(f => f.id !== fileId);
        return { ...n, note_files: files, fileCount: files.length };
      }),
    }));
  };

  const getFileUrl = async (filePath) => {
    const { data: d } = await supabase.storage.from('note-files').createSignedUrl(filePath, 3600);
    return d?.signedUrl;
  };

  // ── Schedule Events ──
  const addEvent = async (e) => {
    const { data: row } = await supabase.from('schedule_events')
      .insert({
        user_id: userId, name: e.name, subject: e.subject, event_type: e.eventType,
        start_hour: e.startHour, start_min: e.startMin, duration: e.duration,
        recurring: e.recurring, day_of_week: e.dayOfWeek, date: e.recurring ? null : e.date,
      })
      .select().single();
    if (row) {
      setData(prev => ({
        ...prev,
        scheduleEvents: [...prev.scheduleEvents, {
          ...row, startHour: row.start_hour, startMin: row.start_min,
          eventType: row.event_type, dayOfWeek: row.day_of_week,
        }],
      }));
    }
  };

  const deleteEvent = async (id) => {
    setData(prev => ({ ...prev, scheduleEvents: prev.scheduleEvents.filter(e => e.id !== id) }));
    await supabase.from('schedule_events').delete().eq('id', id);
  };

  // ── Exams ──
  const addExam = async (e) => {
    const { data: row } = await supabase.from('exams')
      .insert({ user_id: userId, name: e.name, subject: e.subject, date: e.date, time: e.time, duration: e.duration || null, venue: e.venue, syllabus: e.syllabus, notes: e.notes })
      .select().single();
    if (row) setData(prev => ({ ...prev, exams: [...prev.exams, row] }));
  };

  const toggleExam = async (id) => {
    const item = data.exams.find(e => e.id === id);
    if (!item) return;
    setData(prev => ({ ...prev, exams: prev.exams.map(e => e.id === id ? { ...e, done: !e.done } : e) }));
    await supabase.from('exams').update({ done: !item.done }).eq('id', id);
  };

  const deleteExam = async (id) => {
    setData(prev => ({ ...prev, exams: prev.exams.filter(e => e.id !== id) }));
    await supabase.from('exams').delete().eq('id', id);
  };

  // ── Tasks ──
  const addTask = async (t) => {
    const { data: row } = await supabase.from('tasks')
      .insert({ user_id: userId, name: t.name, category: t.category, priority: t.priority, due: t.due || null, description: t.description })
      .select().single();
    if (row) setData(prev => ({ ...prev, tasks: [...prev.tasks, row] }));
  };

  const toggleTask = async (id) => {
    const item = data.tasks.find(t => t.id === id);
    if (!item) return;
    setData(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t) }));
    await supabase.from('tasks').update({ done: !item.done }).eq('id', id);
  };

  const deleteTask = async (id) => {
    setData(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
    await supabase.from('tasks').delete().eq('id', id);
  };

  // ── Update Operations ──
  const updateAssignment = async (id, fields) => {
    setData(prev => ({ ...prev, assignments: prev.assignments.map(a => a.id === id ? { ...a, ...fields } : a) }));
    await supabase.from('assignments').update(fields).eq('id', id);
  };

  const updateExam = async (id, fields) => {
    setData(prev => ({ ...prev, exams: prev.exams.map(e => e.id === id ? { ...e, ...fields } : e) }));
    await supabase.from('exams').update(fields).eq('id', id);
  };

  const updateTask = async (id, fields) => {
    setData(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === id ? { ...t, ...fields } : t) }));
    await supabase.from('tasks').update(fields).eq('id', id);
  };

  const updateEvent = async (id, fields) => {
    const dbFields = {};
    if (fields.name !== undefined) dbFields.name = fields.name;
    if (fields.subject !== undefined) dbFields.subject = fields.subject;
    if (fields.eventType !== undefined) dbFields.event_type = fields.eventType;
    if (fields.startHour !== undefined) dbFields.start_hour = fields.startHour;
    if (fields.startMin !== undefined) dbFields.start_min = fields.startMin;
    if (fields.duration !== undefined) dbFields.duration = fields.duration;
    if (fields.recurring !== undefined) dbFields.recurring = fields.recurring;
    if (fields.dayOfWeek !== undefined) dbFields.day_of_week = fields.dayOfWeek;
    if (fields.date !== undefined) dbFields.date = fields.date;
    setData(prev => ({ ...prev, scheduleEvents: prev.scheduleEvents.map(e => e.id === id ? { ...e, ...fields } : e) }));
    await supabase.from('schedule_events').update(dbFields).eq('id', id);
  };

  const updatePomodoro = (settings) => {
    setData(prev => ({ ...prev, pomodoro: { ...prev.pomodoro, ...settings } }));
  };

  return {
    D: data, loading,
    addSubject, removeSubject,
    addAssignment, toggleAssignment, deleteAssignment, clearDone, updateAssignment,
    addNote, updateNote, deleteNote, uploadNoteFile, deleteNoteFile, getFileUrl,
    addEvent, deleteEvent, updateEvent,
    addExam, toggleExam, deleteExam, updateExam,
    addTask, toggleTask, deleteTask, updateTask,
    updatePomodoro,
  };
}
