import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DEFAULT_SUBJECTS } from '../constants';

export function useStudyData(userId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    loadAllData();
  }, [userId]);

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
      if (!subjects || subjects.length === 0) {
        const defaults = DEFAULT_SUBJECTS.map(name => ({ user_id: userId, name }));
        await supabase.from('subjects').insert(defaults);
        subjectNames = [...DEFAULT_SUBJECTS];
      } else {
        subjectNames = subjects.map(s => s.name);
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
      .insert({ user_id: userId, name: a.name, subject: a.subject, priority: a.priority, due: a.due, description: a.description })
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
    const { data: row } = await supabase.from('notes')
      .insert({ user_id: userId, title: n.title, subject: n.subject, content: n.content })
      .select('*, note_files(*)').single();
    if (row) setData(prev => ({ ...prev, notes: [{ ...row, fileCount: 0, ts: new Date(row.created_at).getTime() }, ...prev.notes] }));
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
    const { error: uploadErr } = await supabase.storage.from('note-files').upload(filePath, file);
    if (uploadErr) throw uploadErr;

    const { data: fileRecord } = await supabase.from('note_files')
      .insert({ note_id: noteId, file_name: file.name, file_path: filePath, file_type: file.type, file_size: file.size })
      .select().single();

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
      .insert({ user_id: userId, name: e.name, subject: e.subject, date: e.date, time: e.time, venue: e.venue, syllabus: e.syllabus, notes: e.notes })
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

  return {
    D: data, loading,
    addSubject, removeSubject,
    addAssignment, toggleAssignment, deleteAssignment, clearDone,
    addNote, updateNote, deleteNote, uploadNoteFile, deleteNoteFile, getFileUrl,
    addEvent, deleteEvent,
    addExam, toggleExam, deleteExam,
    addTask, toggleTask, deleteTask,
  };
}
