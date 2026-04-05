import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LeadTable from './components/LeadTable';
import LeadDetail from './components/LeadDetail';
import AddLeadModal from './components/AddLeadModal';
import Reports from './components/Reports';

// Map sidebar nav IDs → status filter for the lead table (null means show dashboard)
const NAV_STATUS_MAP = {
  dashboard: null,
  all: '',
  new: 'new',
  contacted: 'contacted',
  converted: 'converted',
  reports: null,
};

// Which nav IDs show the lead table
const SHOWS_TABLE = new Set(['all', 'new', 'contacted', 'converted']);

// Page title map
const PAGE_TITLES = {
  dashboard: { title: '📊 CRM Dashboard', sub: 'Overview and analytics' },
  all: { title: '👥 All Leads', sub: 'Manage your full lead list' },
  new: { title: '🆕 New Leads', sub: 'Fresh leads awaiting contact' },
  contacted: { title: '📞 Contacted Leads', sub: 'Leads you\'ve already reached out to' },
  converted: { title: '✅ Converted Leads', sub: 'Leads who became clients' },
  reports: { title: '📈 Reports', sub: 'Analytics and performance metrics' },
};

export default function App() {
  const [user, setUser] = useState({ id: 1, name: "Admin User", email: "admin@leadflow.com" });
  const [activeNav, setActiveNav] = useState('dashboard');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [theme, setTheme] = useState(() => localStorage.getItem('leadflow_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('leadflow_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogin = (userData) => setUser(userData);

  const handleLogout = () => {
    localStorage.removeItem('leadflow_token');
    localStorage.removeItem('leadflow_user');
    setUser(null);
    setSelectedLead(null);
  };

  const handleNav = (id) => {
    setActiveNav(id);
    setSelectedLead(null); // close any open panel when navigating
  };

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  const handleAddLead = () => setShowAddModal(true);

  const handleLeadAdded = () => {
    setShowAddModal(false);
    handleRefresh();
    // if currently on a pipeline view, stay there; else go to all
    if (!SHOWS_TABLE.has(activeNav)) setActiveNav('all');
  };

  const handleLeadDeleted = () => {
    setSelectedLead(null);
    handleRefresh();
  };

  const page = PAGE_TITLES[activeNav] || PAGE_TITLES.dashboard;
  const forceStatus = NAV_STATUS_MAP[activeNav];
  const showDashboard = activeNav === 'dashboard';
  const showTable = SHOWS_TABLE.has(activeNav);
  const showReports = activeNav === 'reports';

  return (
    <div className="app-layout">
      <Sidebar
        user={user}
        onLogout={handleLogout}
        activeNav={activeNav}
        onNav={handleNav}
      />

      <main className="main-content">
        {/* Top Bar */}
        <header className="topbar">
          <div>
            <div className="topbar-title">{page.title}</div>
            <div className="topbar-subtitle">{page.sub}</div>
          </div>
          <div className="topbar-actions">
            <div style={{
              padding: '6px 14px',
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 999,
              fontSize: '0.78rem',
              color: '#10b981',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              Live
            </div>
            <button 
              className="btn" 
              style={{ padding: '6px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              id="topbar-add-lead"
              className="btn btn-primary btn-sm"
              onClick={handleAddLead}
            >
              ＋ New Lead
            </button>
          </div>
        </header>

        <div className="page-content">
          {/* Dashboard view: analytics + full table */}
          {showDashboard && (
            <>
              <Dashboard refreshKey={refreshKey} />
              <LeadTable
                onSelectLead={setSelectedLead}
                refreshKey={refreshKey}
                onAdd={handleAddLead}
                forceStatus=""
              />
            </>
          )}

          {/* Pipeline / filtered table views */}
          {showTable && (
            <LeadTable
              onSelectLead={setSelectedLead}
              refreshKey={refreshKey}
              onAdd={handleAddLead}
              forceStatus={forceStatus}
            />
          )}

          {/* Reports view */}
          {showReports && <Reports refreshKey={refreshKey} />}
        </div>
      </main>

      {/* Lead Detail Panel */}
      {selectedLead && (
        <LeadDetail
          leadData={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdated={handleRefresh}
          onDeleted={handleLeadDeleted}
        />
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <AddLeadModal
          onClose={() => setShowAddModal(false)}
          onAdded={handleLeadAdded}
        />
      )}
    </div>
  );
}
