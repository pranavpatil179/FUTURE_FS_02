import { useState, useEffect, useRef } from 'react';
import api from '../api';

const STATUS_ORDER = ['new', 'contacted', 'converted'];

const SOURCE_ICONS = {
  website: '🌐',
  referral: '🤝',
  social: '📱',
  email: '📧',
  other: '📌',
};

function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      {status === 'new' ? 'New' : status === 'contacted' ? 'Contacted' : 'Converted'}
    </span>
  );
}

function formatDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function LeadTable({ onSelectLead, refreshKey, onAdd, forceStatus }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const debounceRef = useRef(null);

  const fetchLeads = async (s = search, st = statusFilter, src = sourceFilter) => {
    setLoading(true);
    try {
      const params = {};
      if (s) params.search = s;
      if (st) params.status = st;
      if (src) params.source = src;
      const { data } = await api.get('/leads', { params });
      setLeads(data.leads);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Sync when sidebar navigation changes forceStatus
  useEffect(() => {
    const s = forceStatus || '';
    setStatusFilter(s);
    fetchLeads(search, s, sourceFilter);
  }, [forceStatus, refreshKey]);

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchLeads(val, statusFilter, sourceFilter), 300);
  };

  const handleStatusFilter = (val) => {
    setStatusFilter(val);
    fetchLeads(search, val, sourceFilter);
  };

  const handleSourceFilter = (val) => {
    setSourceFilter(val);
    fetchLeads(search, statusFilter, val);
  };

  const handleRowClick = (lead) => {
    setSelectedId(lead.id);
    onSelectLead(lead);
  };

  return (
    <div className="table-container">
      <div className="table-header">
        <div>
          <div className="table-header-title">
            {forceStatus === 'new' ? '🆕 New Leads'
              : forceStatus === 'contacted' ? '📞 Contacted Leads'
              : forceStatus === 'converted' ? '✅ Converted Leads'
              : '👥 All Leads'}
          </div>
        </div>
        <span className="table-header-count">{leads.length} records</span>

        <div className="table-filters">
          <div className="input-wrapper" style={{ position: 'relative' }}>
            <span className="input-icon" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#4b6280', fontSize: '0.85rem' }}>🔍</span>
            <input
              id="lead-search"
              className="search-input"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <select
            id="status-filter"
            className="filter-select"
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="new">🆕 New</option>
            <option value="contacted">📞 Contacted</option>
            <option value="converted">✅ Converted</option>
          </select>

          <select
            id="source-filter"
            className="filter-select"
            value={sourceFilter}
            onChange={(e) => handleSourceFilter(e.target.value)}
          >
            <option value="">All Sources</option>
            <option value="website">🌐 Website</option>
            <option value="referral">🤝 Referral</option>
            <option value="social">📱 Social</option>
            <option value="email">📧 Email</option>
          </select>

          <button id="add-lead-btn" className="btn btn-primary btn-sm" onClick={onAdd}>
            ＋ Add Lead
          </button>
        </div>
      </div>

      {loading ? (
        <div className="table-empty">
          <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, margin: '40px auto' }} />
        </div>
      ) : leads.length === 0 ? (
        <div className="table-empty">
          <div className="table-empty-icon">🔍</div>
          <div className="table-empty-text">No leads found</div>
          <div className="table-empty-sub">Try adjusting your search or filters</div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Contact</th>
                <th>Company</th>
                <th>Source</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => handleRowClick(lead)}
                  className={selectedId === lead.id ? 'selected' : ''}
                >
                  <td>
                    <div className="lead-name">{lead.name}</div>
                    <div className="lead-email">{lead.email}</div>
                  </td>
                  <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                    {lead.company || '—'}
                  </td>
                  <td>
                    <span className="source-badge">
                      {SOURCE_ICONS[lead.source] || '📌'} {lead.source}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={lead.status} />
                  </td>
                  <td style={{ color: '#4b6280', fontSize: '0.82rem' }}>
                    {lead.notes_count > 0 ? (
                      <span style={{ color: '#94a3b8' }}>💬 {lead.notes_count}</span>
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                  <td style={{ color: '#4b6280', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {formatDate(lead.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
