import { useState, useRef } from 'react';
import { SubjectManager, SubjectSelect, SubjectFilter } from './SubjectManager';
import { S } from '../styles';

export default function Notes({ D, form, setForm, addSubject, removeSubject, addNote, updateNote, deleteNote, uploadNoteFile, deleteNoteFile, getFileUrl }) {
  const [filter, setFilter] = useState("all");
  const [showMgr, setShowMgr] = useState(false);
  const [openNote, setOpenNote] = useState(null);
  const filtered = filter === "all" ? D.notes : D.notes.filter(n => n.subject === filter);

  return (
    <div style={S.page}>
      {showMgr && <SubjectManager subjects={D.subjects} addSubject={addSubject} removeSubject={removeSubject} onClose={() => setShowMgr(false)} />}
      {openNote && (
        <NoteDetail
          note={D.notes.find(n => n.id === openNote)}
          onClose={() => setOpenNote(null)}
          updateNote={updateNote}
          uploadNoteFile={uploadNoteFile}
          deleteNoteFile={deleteNoteFile}
          getFileUrl={getFileUrl}
        />
      )}
      <div style={S.pageHead}><h1 style={S.pageTitle}>Notes</h1>
        <button style={S.primaryBtn} onClick={() => setForm(form === "note" ? null : "note")}>{form === "note" ? "✕ Cancel" : "+ Add Note"}</button>
      </div>
      {form === "note" && <NoteForm subjects={D.subjects} onAdd={n => { addNote(n); setForm(null); }} />}
      <SubjectFilter subjects={D.subjects} filter={filter} setFilter={setFilter} onManage={() => setShowMgr(true)} />
      {filtered.length === 0 && <p style={S.empty}>No notes yet. Start capturing! ✏️</p>}
      <div style={S.notesGrid}>
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

function NoteDetail({ note, onClose, updateNote, uploadNoteFile, deleteNoteFile, getFileUrl }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  if (!note) return null;

  const files = note.note_files || [];

  const handleUpload = async (e) => {
    const fileList = e.target.files;
    if (!fileList?.length) return;
    setUploading(true);
    for (const file of fileList) {
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large (max 10MB per file)`);
        continue;
      }
      try {
        await uploadNoteFile(note.id, file);
      } catch (err) {
        alert(`Failed to upload ${file.name}: ${err.message}`);
      }
    }
    setUploading(false);
    e.target.value = '';
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
      <div style={{ ...S.modalBox, maxWidth: 640 }} onClick={e => e.stopPropagation()}>
        <div style={S.modalHead}>
          <div>
            <span style={S.tagSmall}>{note.subject}</span>
            <h3 style={{ ...S.modalTitle, marginTop: 4 }}>{note.title}</h3>
          </div>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.7, color: "#444", whiteSpace: "pre-wrap", marginBottom: 20, maxHeight: 200, overflow: "auto" }}>
          {note.content || "No text content."}
        </div>

        <div style={{ borderTop: "1px solid #eee", paddingTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h4 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, fontWeight: 400 }}>Attachments</h4>
            <button style={S.primaryBtn} onClick={() => inputRef.current?.click()} disabled={uploading}>
              {uploading ? "Uploading..." : "📎 Upload File"}
            </button>
            <input ref={inputRef} type="file" multiple style={{ display: "none" }} onChange={handleUpload}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.png,.jpg,.jpeg,.txt,.md,.zip" />
          </div>
          {files.length === 0 && <p style={S.empty}>No files attached yet. Upload PDFs, docs, images, and more (up to 10MB each).</p>}
          {files.map(f => (
            <div key={f.id} style={S.fileRow}>
              <span style={{ fontSize: 20 }}>{getIcon(f.file_type)}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{f.file_name}</div>
                <div style={{ fontSize: 11, color: "#999" }}>{(f.file_size / 1024).toFixed(1)} KB</div>
              </div>
              <button style={{ ...S.ghostBtn, padding: "4px 10px", fontSize: 12 }} onClick={() => handleDownload(f)}>↓ Download</button>
              <button style={S.xBtn} onClick={() => deleteNoteFile(note.id, f.id, f.file_path)}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
