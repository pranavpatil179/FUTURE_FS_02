const NAV_ITEMS = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard', section: 'main' },
  { id: 'all', icon: '👥', label: 'All Leads', section: 'main' },
  { id: 'new', icon: '🆕', label: 'New Leads', section: 'pipeline' },
  { id: 'contacted', icon: '📞', label: 'Contacted', section: 'pipeline' },
  { id: 'converted', icon: '✅', label: 'Converted', section: 'pipeline' },
  { id: 'reports', icon: '📈', label: 'Reports', section: 'analytics' },
];

export default function Sidebar({ user, onLogout, activeNav, onNav }) {
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'A';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-text">⚡ LeadFlow</div>
        <div className="logo-sub">CRM Dashboard</div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main</div>
        {NAV_ITEMS.filter((n) => n.section === 'main').map((item) => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            className={`nav-item${activeNav === item.id ? ' active' : ''}`}
            onClick={() => onNav(item.id)}
            style={{ width: '100%', textAlign: 'left', background: 'none', border: activeNav === item.id ? undefined : '1px solid transparent', cursor: 'pointer' }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}

        <div className="nav-section-label">Pipeline</div>
        {NAV_ITEMS.filter((n) => n.section === 'pipeline').map((item) => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            className={`nav-item${activeNav === item.id ? ' active' : ''}`}
            onClick={() => onNav(item.id)}
            style={{ width: '100%', textAlign: 'left', background: 'none', border: activeNav === item.id ? undefined : '1px solid transparent', cursor: 'pointer' }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}

        <div className="nav-section-label">Analytics</div>
        {NAV_ITEMS.filter((n) => n.section === 'analytics').map((item) => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            className={`nav-item${activeNav === item.id ? ' active' : ''}`}
            onClick={() => onNav(item.id)}
            style={{ width: '100%', textAlign: 'left', background: 'none', border: activeNav === item.id ? undefined : '1px solid transparent', cursor: 'pointer' }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'Admin'}</div>
            <div className="user-role">Administrator</div>
          </div>
          <button
            className="logout-btn"
            onClick={onLogout}
            title="Logout"
            id="logout-btn"
          >
            🚪
          </button>
        </div>
      </div>
    </aside>
  );
}
