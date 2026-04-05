import { useState } from 'react';
import api from '../api';

const SOURCES = ['website', 'referral', 'social', 'email', 'other'];

export default function AddLeadModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', source: 'website'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/leads', form);
      onAdded();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add lead');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">➕ Add New Lead</div>
          <button className="panel-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="error-alert" style={{ marginBottom: 16 }}>⚠️ {error}</div>}

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="new-name">Full Name *</label>
              <input id="new-name" className="input" placeholder="Jane Doe" value={form.name} onChange={set('name')} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="new-email">Email *</label>
              <input id="new-email" className="input" type="email" placeholder="jane@company.com" value={form.email} onChange={set('email')} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="new-phone">Phone</label>
              <input id="new-phone" className="input" placeholder="+1-555-0100" value={form.phone} onChange={set('phone')} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="new-company">Company</label>
              <input id="new-company" className="input" placeholder="Acme Corp" value={form.company} onChange={set('company')} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="new-source">Lead Source</label>
            <select id="new-source" className="input" value={form.source} onChange={set('source')}>
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s === 'website' ? '🌐' : s === 'referral' ? '🤝' : s === 'social' ? '📱' : s === 'email' ? '📧' : '📌'} {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button id="submit-add-lead" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : '✅'}
              {loading ? 'Adding...' : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
