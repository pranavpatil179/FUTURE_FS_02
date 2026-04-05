import { useState, useEffect } from 'react';
import api from '../api';

const SOURCE_ICONS = {
  website: '🌐',
  referral: '🤝',
  social: '📱',
  email: '📧',
  other: '📌',
};

function formatDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function formatRelative(dt) {
  if (!dt) return '';
  const diff = Date.now() - new Date(dt).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function LeadDetail({ leadData, onClose, onUpdated, onDeleted }) {
  const [lead, setLead] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!leadData?.id) return;
    setLoading(true);
    api.get(`/leads/${leadData.id}`).then(({ data }) => {
      setLead(data.lead);
      setNotes(data.notes);
      setStatus(data.lead.status);
      setLoading(false);
    });
  }, [leadData?.id]);

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    setSavingStatus(true);
    try {
      const { data } = await api.put(`/leads/${lead.id}`, { status: newStatus });
      setLead(data.lead);
      onUpdated();
    } finally {
      setSavingStatus(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      const { data } = await api.post(`/leads/${lead.id}/notes`, { text: noteText });
      setNotes([data.note, ...notes]);
      setNoteText('');
      onUpdated();
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    await api.delete(`/leads/${lead.id}/notes/${noteId}`);
    setNotes(notes.filter((n) => n.id !== noteId));
    onUpdated();
  };

  const handleDelete = async () => {
    if (!confirm(`Delete lead "${lead?.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    await api.delete(`/leads/${lead.id}`);
    onDeleted();
  };

  const initials = lead?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const statusGradients = {
    new: 'linear-gradient(135deg, #1e3a6e, #1e40af)',
    contacted: 'linear-gradient(135deg, #6b3f00, #92400e)',
    converted: 'linear-gradient(135deg, #064e3b, #065f46)',
  };

  return (
    <>
      <div className="panel-overlay" onClick={onClose} />
      <div className="lead-panel">
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
          </div>
        ) : (
          <>
            <div className="panel-header">
              <div
                className="panel-avatar"
                style={{ background: statusGradients[lead?.status] || 'linear-gradient(135deg, #6d28d9, #a78bfa)' }}
              >
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="panel-title">{lead?.name}</div>
                <div className="panel-email">{lead?.email}</div>
                <div className="panel-meta">
                  <span className={`badge badge-${lead?.status}`}>
                    {lead?.status}
                  </span>
                  {lead?.source && (
                    <span className="source-badge">
                      {SOURCE_ICONS[lead.source] || '📌'} {lead.source}
                    </span>
                  )}
                </div>
              </div>
              <button className="panel-close" onClick={onClose} id="panel-close">✕</button>
            </div>

            <div className="panel-body">
              {/* Details */}
              <div>
                <div className="panel-section-title">Contact Info</div>
                <div className="detail-grid">
                  <div className="detail-item">
                    <div className="detail-label">Phone</div>
                    <div className="detail-value">{lead?.phone || '—'}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Company</div>
                    <div className="detail-value">{lead?.company || '—'}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Added</div>
                    <div className="detail-value" style={{ fontSize: '0.8rem' }}>
                      {formatDate(lead?.created_at)}
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Last Updated</div>
                    <div className="detail-value" style={{ fontSize: '0.8rem' }}>
                      {formatDate(lead?.updated_at)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <div className="panel-section-title">Pipeline Status</div>
                <div className="status-select-wrapper">
                  <select
                    id="status-select"
                    className="status-select"
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={savingStatus}
                    style={{
                      color: status === 'new' ? '#3b82f6' : status === 'contacted' ? '#f59e0b' : '#10b981'
                    }}
                  >
                    <option value="new">🆕 New Lead</option>
                    <option value="contacted">📞 Contacted</option>
                    <option value="converted">✅ Converted</option>
                  </select>
                  {savingStatus && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: '0.8rem', color: '#4b6280' }}>
                      <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                      Saving...
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <div className="panel-section-title">
                  Follow-up Notes
                  {notes.length > 0 && (
                    <span style={{
                      background: '#1e2d42',
                      color: '#94a3b8',
                      borderRadius: 999,
                      padding: '2px 8px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      marginLeft: 4
                    }}>{notes.length}</span>
                  )}
                </div>

                <form className="note-form" onSubmit={handleAddNote}>
                  <textarea
                    id="note-input"
                    className="input"
                    placeholder="Add a follow-up note..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={3}
                    style={{ resize: 'none' }}
                  />
                  <button
                    id="add-note-btn"
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={addingNote || !noteText.trim()}
                  >
                    {addingNote ? <span className="spinner" /> : '📝'}
                    {addingNote ? 'Adding...' : 'Add Note'}
                  </button>
                </form>

                <div className="notes-list" style={{ marginTop: 12 }}>
                  {notes.length === 0 ? (
                    <div className="no-notes">No notes yet. Add your first follow-up above.</div>
                  ) : (
                    notes.map((note) => (
                      <div key={note.id} className="note-item">
                        <div className="note-text">{note.text}</div>
                        <div className="note-time">🕐 {formatRelative(note.created_at)}</div>
                        <button
                          className="note-delete"
                          onClick={() => handleDeleteNote(note.id)}
                          title="Delete note"
                        >
                          🗑️
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Danger Zone */}
              <div style={{
                padding: '16px',
                background: 'rgba(239,68,68,0.05)',
                border: '1px solid rgba(239,68,68,0.15)',
                borderRadius: 10,
                marginTop: 8
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ef4444', marginBottom: 8, letterSpacing: '0.5px' }}>
                  DANGER ZONE
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 12 }}>
                  Permanently delete this lead and all associated notes.
                </div>
                <button
                  id="delete-lead-btn"
                  className="btn btn-danger btn-sm"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? <span className="spinner" /> : '🗑️'}
                  {deleting ? 'Deleting...' : 'Delete Lead'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
