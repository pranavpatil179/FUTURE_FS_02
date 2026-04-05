import { useEffect, useState } from 'react';
import api from '../api';
import PipelineDonut3D from './charts/PipelineDonut3D';
import TrendChart3D from './charts/TrendChart3D';
import SourceBars3D from './charts/SourceBars3D';

const STATUS_COLORS = { new: '#3b82f6', contacted: '#f59e0b', converted: '#10b981' };
const SOURCE_COLORS = ['#6d28d9', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];



function StatRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1e2d42' }}>
      <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{label}</span>
      <span style={{ fontSize: '1rem', fontWeight: 700, color: color || '#f0f4ff' }}>{value}</span>
    </div>
  );
}

export default function Reports({ refreshKey }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/leads/stats').then(({ data }) => setStats(data));
  }, [refreshKey]);

  if (!stats) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
      <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
    </div>
  );

  const statusData = [
    { name: 'New', value: stats.newLeads, color: STATUS_COLORS.new },
    { name: 'Contacted', value: stats.contacted, color: STATUS_COLORS.contacted },
    { name: 'Converted', value: stats.converted, color: STATUS_COLORS.converted },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f0f4ff' }}>📈 Reports & Analytics</h2>
      </div>

      <div className="chart-grid">
        {/* Summary Table */}
        <div className="chart-card">
          <div className="chart-card-title">Performance Summary</div>
          <div className="chart-card-sub">Overall lead metrics</div>
          <StatRow label="Total Leads" value={stats.total} />
          <StatRow label="New" value={stats.newLeads} color="#3b82f6" />
          <StatRow label="Contacted" value={stats.contacted} color="#f59e0b" />
          <StatRow label="Converted" value={stats.converted} color="#10b981" />
          <StatRow label="Conversion Rate" value={`${stats.conversionRate}%`} color="#a78bfa" />
        </div>

        {/* Pie chart */}
        <div className="chart-card">
          <div className="chart-card-title">Pipeline Breakdown</div>
          <div className="chart-card-sub">Distribution by status</div>
          <PipelineDonut3D data={statusData} />
        </div>
      </div>

      {/* Bar: status */}
      <div className="chart-card">
        <div className="chart-card-title">Leads by Status</div>
        <div className="chart-card-sub">Comparison across pipeline stages</div>
        <TrendChart3D 
          data={statusData.map(s => ({ name: s.name, count: s.value, color: s.color }))} 
        />
      </div>

      {/* Bar: source */}
      {stats.bySource?.length > 0 && (
        <div className="chart-card">
          <div className="chart-card-title">Leads by Source</div>
          <div className="chart-card-sub">Where your leads originate</div>
          <SourceBars3D data={stats.bySource} />
        </div>
      )}
    </div>
  );
}
