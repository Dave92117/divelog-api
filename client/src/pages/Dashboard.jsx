import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats, getDives } from '../api';

function roleBadge(role) {
  const map = {
    diver: { label: 'Diver', cls: 'rb-diver' },
    tender: { label: 'Tender', cls: 'rb-tender' },
    standby_diver: { label: 'Standby', cls: 'rb-standby' },
    dive_leader: { label: 'Dive leader', cls: 'rb-leader' },
  };
  const r = map[role] || { label: role, cls: '' };
  return <span className={`role-badge ${r.cls}`}>{r.label}</span>;
}

function depthBadge(depth) {
  if (depth >= 30) return <span className="depth-badge deep">{depth}m</span>;
  if (depth >= 20) return <span className="depth-badge mid">{depth}m</span>;
  return <span className="depth-badge shallow">{depth}m</span>;
}

function fmtBottomTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [dives, setDives] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getStats().then(setStats);
    getDives().then(d => setDives(Array.isArray(d) ? d.slice(0, 5) : []));
  }, []);

  return (
    <div className="page">
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">TOTAL DIVES</div>
          <div className="stat-val">{stats?.total_dives ?? '—'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">DEEPEST DIVE</div>
          <div className="stat-val">{stats?.deepest_dive_m ? `${stats.deepest_dive_m}m` : '—'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">BOTTOM TIME</div>
          <div className="stat-val">{stats?.total_bottom_time_min ? fmtBottomTime(stats.total_bottom_time_min) : '—'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">FAVOURITE SITE</div>
          <div className="stat-val" style={{ fontSize: 15 }}>{stats?.most_dived_location ?? '—'}</div>
        </div>
      </div>

      <div className="section-header">
        <span className="section-title">Recent dives</span>
        <button className="btn-ghost" onClick={() => navigate('/logbook')}>View all</button>
      </div>

      <div className="table-wrap">
        <table className="dive-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Location</th>
              <th>Depth</th>
              <th>Duration</th>
              <th>My role</th>
            </tr>
          </thead>
          <tbody>
            {dives.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-muted)', padding: '2rem' }}>No dives logged yet</td></tr>
            )}
            {dives.map(d => (
              <tr key={d.id} onClick={() => navigate(`/dives/${d.id}`)} style={{ cursor: 'pointer' }}>
                <td>{new Date(d.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td>{d.location}</td>
                <td>{depthBadge(d.depth_m)}</td>
                <td>{d.duration_min} min</td>
                <td>{roleBadge(d.my_role)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}