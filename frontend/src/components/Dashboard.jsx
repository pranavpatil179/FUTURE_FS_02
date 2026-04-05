import { useEffect, useState } from 'react';
import api from '../api';
import TrendChart3D from './charts/TrendChart3D';
import PipelineDonut3D from './charts/PipelineDonut3D';
import SourceBars3D from './charts/SourceBars3D';

const STATUS_COLORS = {
  new: '#3b82f6',
  contacted: '#f59e0b',
  converted: '#10b981',
};

const SOURCE_COLORS = ['#6d28d9', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

// Recharts tooltip removed as we use 3D HTML tooltips now

export default function Dashboard({ refreshKey, onAddLead }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leads/stats').then(({ data }) => {
      setStats(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [refreshKey]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
      <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
    </div>
  );

  if (!stats) return null;

  const statusData = [
    { name: 'New', value: stats.newLeads, color: STATUS_COLORS.new },
    { name: 'Contacted', value: stats.contacted, color: STATUS_COLORS.contacted },
    { name: 'Converted', value: stats.converted, color: STATUS_COLORS.converted },
  ];

  const trendData = stats.trend || [];

  return (
    <>
      {/* Stats Strip */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(55, 95, 216, 0.15)', color: '#375fd8' }}>👥</div>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Leads</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(255, 126, 66, 0.15)', color: '#FF7E42' }}>🆕</div>
          <div className="stat-info">
            <div className="stat-value">{stats.newLeads}</div>
            <div className="stat-label">New Leads</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(255, 179, 67, 0.15)', color: '#FFB343' }}>📞</div>
          <div className="stat-info">
            <div className="stat-value">{stats.contacted}</div>
            <div className="stat-label">Contacted</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(66, 234, 255, 0.15)', color: '#42EAFF' }}>✅</div>
          <div className="stat-info">
            <div className="stat-value">{stats.converted}</div>
            <div className="stat-label">Converted</div>
            <div className="stat-change" style={{ color: '#42EAFF' }}>
              {stats.conversionRate}% rate
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="chart-grid">
        {/* Trend Chart */}
        <div className="chart-card">
          <div className="chart-card-title">Lead Activity</div>
          <div className="chart-card-sub">Last 7 days</div>
          <TrendChart3D data={trendData} />
        </div>

        {/* Status Chart */}
        <div className="chart-card">
          <div className="chart-card-title">Lead Pipeline</div>
          <div className="chart-card-sub">By current status</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <PipelineDonut3D data={statusData} />
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
              {statusData.map((s) => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: s.color, flexShrink: 0
                  }} />
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{s.name}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f0f4ff' }}>{s.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Source Bar Chart */}
      {stats.bySource?.length > 0 && (
        <div className="chart-card mb-6" style={{ marginBottom: 24, marginTop: 24 }}>
          <div className="chart-card-title">Leads by Source</div>
          <div className="chart-card-sub">Where your leads are coming from</div>
          <SourceBars3D data={stats.bySource} />
        </div>
      )}
    </>
  );
}
