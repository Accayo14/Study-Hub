import { useState, useRef, useEffect } from 'react';
import { SubjectManager, SubjectSelect, SubjectFilter } from './SubjectManager';
import { S } from '../styles';

export default function Notes({ D, form, setForm, addSubject, removeSubject, addNote, updateNote, deleteNote, uploadNoteFile, deleteNoteFile, getFileUrl }) {
  const [filter, setFilter] = useState("all");
  const [showMgr, setShowMgr] = useState(false);
  const [openNote, setOpenNote] = useState(null);
  const uploadRef = useRef(null);
  const filtered = filter === "all" ? D.notes : D.notes.filter(n => n.subject === filter);

  const handleQuickUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    const title = files.length === 1
      ? files[0].name.replace(/\.[^.]+$/, '')
      : `Uploaded Notes - ${new Date().toLocaleDateString()}`;
    const note = await addNote({ title, subject: D.subjects[0] || '', content: '' });
    if (note) {
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) { alert(`${file.name} exceeds 10MB limit`); continue; }
        try { await uploadNoteFile(note.id, file); } catch (err) { alert(`Upload failed: ${err.message}`); }
      }
      setOpenNote(note.id);
    }
    e.target.value = '';
  };

  return (
    <div style={S.page}>
      {showMgr && <SubjectManager subjects={D.subjects} addSubject={addSubject} removeSubject={removeSubject} onClose={() => setShowMgr(false)} />}
      {openNote && (
        <NoteDetail
          note={D.notes.find(n => n.id === openNote)}
          subjects={D.subjects}
          onClose={() => setOpenNote(null)}
          updateNote={updateNote}
          uploadNoteFile={uploadNoteFile}
          deleteNoteFile={deleteNoteFile}
          getFileUrl={getFileUrl}
        />
      )}
      <div style={S.pageHead}>
        <h1 style={S.pageTitle}>Notes</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={S.ghostBtn} onClick={() => uploadRef.current?.click()}>📎 Upload Files</button>
          <input ref={uploadRef} type="file" multiple style={{ display: "none" }} onChange={handleQuickUpload}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.txt,.md,.zip,.rar" />
          <button style={S.primaryBtn} onClick={() => setForm(form === "note" ? null : "note")}>{form === "note" ? "✕ Cancel" : "+ Add Note"}</button>
        </div>
      </div>
      {form === "note" && <NoteForm subjects={D.subjects} onAdd={n => { addNote(n); setForm(null); }} />}
      <SubjectFilter subjects={D.subjects} filter={filter} setFilter={setFilter} onManage={() => setShowMgr(true)} />
      {filtered.length === 0 && <p style={S.empty}>No notes yet. Start capturing! ✏️</p>}
      <div style={S.notesGrid} data-sh="notes-grid">
        {filtered.map(n => (
          <div key={n.id} style={S.noteCard} onClick={() => setOpenNote(n.id)}>
            <div style={S.noteHead}>
              <span style={S.tagSmall}>{n.subject}</span>
              <button style={S.xBtn} onClick={e => { e.stopPropagation(); deleteNote(n.id); }}>✕</button>
            </div>
            <div style={S.noteTitle}>{n.title}</div>
            <div style={S.noteBody}>{n.content}</div>
            <div style={S.noteFoot}>
              {n.fileCount > 0 && <span style={S.fileCount}>📎 {n.fileCount} file{n.fileCount > 1 ? "s" : ""}</span>}
              <span style={S.noteDate}>{new Date(n.ts).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NoteForm({ subjects, onAdd }) {
  const [f, setF] = useState({ title: "", subject: subjects[0] || "", content: "" });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <div style={S.formCard}>
      <input style={S.input} placeholder="Note title..." value={f.title} onChange={e => set("title", e.target.value)} autoFocus />
      <SubjectSelect subjects={subjects} value={f.subject} onChange={v => set("subject", v)} />
      <textarea style={{ ...S.input, minHeight: 80 }} placeholder="Write your note content..." value={f.content} onChange={e => set("content", e.target.value)} />
      <button style={S.primaryBtn} onClick={() => { if (f.title.trim()) onAdd(f); }}>Save Note</button>
    </div>
  );
}

function NoteDetail({ note, subjects, onClose, updateNote, uploadNoteFile, deleteNoteFile, getFileUrl }) {
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content || '');
      setSubject(note.subject || '');
      setPreviewUrl(null);
      setPreviewType(null);
    }
  }, [note?.id]);

  if (!note) return null;

  const files = note.note_files || [];

  const saveField = (field, value) => {
    if (value !== note[field]) {
      updateNote(note.id, { [field]: value });
    }
  };

  const handleUpload = async (e) => {
    const fileList = e.target.files;
    if (!fileList?.length) return;
    setUploading(true);
    for (const file of fileList) {
      if (file.size > 10 * 1024 * 1024) { alert(`${file.name} exceeds 10MB limit`); continue; }
      try { await uploadNoteFile(note.id, file); } catch (err) { alert(`Upload failed: ${err.message}`); }
    }
    setUploading(false);
    e.target.value = '';
  };

  const handlePreview = async (f) => {
    const url = await getFileUrl(f.file_path);
    if (!url) return;
    if (f.file_type?.includes('image')) { setPreviewUrl(url); setPreviewType('image'); }
    else if (f.file_type?.includes('pdf')) { setPreviewUrl(url); setPreviewType('pdf'); }
    else { window.open(url, '_blank'); }
  };

  const handleDownload = async (f) => {
    const url = await getFileUrl(f.file_path);
    if (url) window.open(url, '_blank');
  };

  const getIcon = (type) => {
    if (type?.includes("pdf")) return "📄";
    if (type?.includes("sheet") || type?.includes("excel") || type?.includes("csv")) return "📊";
    if (type?.includes("image")) return "🖼️";
    if (type?.includes("presentation") || type?.includes("pptx")) return "📽️";
    if (type?.includes("word") || type?.includes("doc")) return "📝";
    return "📎";
  };

  return (
    <div style={S.modal} onClick={onClose}>
      <div style={{ ...S.modalBox, maxWidth: 680 }} onClick={e => e.stopPropagation()}>
        <div style={S.modalHead}>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 6 }}>
              <SubjectSelect subjects={subjects} value={subject}
                onChange={v => { setSubject(v); saveField('subject', v); }} />
            </div>
            <input
              style={{ ...S.input, fontFamily: "'DM Serif Display',serif", fontSize: 20, fontWeight: 400, border: "none", background: "transparent", padding: "4px 0", width: "100%" }}
              value={title} onChange={e => setTitle(e.target.value)}
              onBlur={() => saveField('title', title)} />
          </div>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>

        <textarea
          style={{ ...S.input, minHeight: 100, lineHeight: 1.7, fontSize: 14, marginBottom: 16, width: "100%" }}
          placeholder="Write your notes here..."
          value={content} onChange={e => setContent(e.target.value)}
          onBlur={() => saveField('content', content)} />

        {previewUrl && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h4 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 14, fontWeight: 400 }}>Preview</h4>
              <button style={S.ghostBtn} onClick={() => { setPreviewUrl(null); setPreviewType(null); }}>Close Preview</button>
            </div>
            {previewType === 'pdf' && <iframe src={previewUrl} style={S.previewFrame} title="PDF Preview" />}
            {previewType === 'image' && <img src={previewUrl} alt="Preview" style={S.previewImg} />}
          </div>
        )}

        <div style={{ borderTop: "1px solid #eee", paddingTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h4 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 16, fontWeight: 400 }}>
              Attachments {files.length > 0 && `(${files.length})`}
            </h4>
            <button style={S.primaryBtn} onClick={() => inputRef.current?.click()} disabled={uploading}>
              {uploading ? "Uploading..." : "📎 Upload File"}
            </button>
            <input ref={inputRef} type="file" multiple style={{ display: "none" }} onChange={handleUpload}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.txt,.md,.zip,.rar" />
          </div>
          {files.length === 0 && <p style={S.empty}>No files attached. Upload PDFs, docs, images (up to 10MB each).</p>}
          {files.map(f => (
            <div key={f.id} style={S.fileRow}>
              <span style={{ fontSize: 20 }}>{getIcon(f.file_type)}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{f.file_name}</div>
                <div style={{ fontSize: 11, color: "#999" }}>{(f.file_size / 1024).toFixed(1)} KB</div>
              </div>
              {(f.file_type?.includes('pdf') || f.file_type?.includes('image')) && (
                <button style={{ ...S.ghostBtn, padding: "4px 10px", fontSize: 12 }} onClick={() => handlePreview(f)}>Preview</button>
              )}
              <button style={{ ...S.ghostBtn, padding: "4px 10px", fontSize: 12 }} onClick={() => handleDownload(f)}>Download</button>
              <button style={S.xBtn} onClick={() => deleteNoteFile(note.id, f.id, f.file_path)}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
