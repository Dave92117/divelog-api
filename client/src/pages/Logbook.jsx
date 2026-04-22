import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDives } from '../api';

function depthBadge(depth) {
  if (depth >= 30) return <span className="depth-badge deep">{depth}m</span>;
  if (depth >= 20) return <span className="depth-badge mid">{depth}m</span>;
  return <span className="depth-badge shallow">{depth}m</span>;
}

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

export default function Logbook() {
  const [dives, setDives] = useState([]);
  const [location, setLocation] = useState('');
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  function load() {
    const params = {};
    if (location) params.location = location;
    if (role) params.role = role;
    getDives(params).then(d => setDives(Array.isArray(d) ? d : []));
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="page">
      <div className="filter-bar">
        <input
          placeholder="Search location..."
          value={location}
          onChange={e => setLocation(e.target.value)}
          style={{ width: 180 }}
        />
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="diver">Diver</option>
          <option value="tender">Tender</option>
          <option value="standby_diver">Standby diver</option>
          <option value="dive_leader">Dive leader</option>
        </select>
        <button className="btn-ghost" onClick={load}>Search</button>
        <button className="btn-primary" onClick={() => navigate('/log')}>+ Log dive</button>
      </div>

      <div className="table-wrap">
        <table className="dive-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Location</th>
              <th>Depth</th>
              <th>Duration</th>
              <th>My role</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {dives.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--color-muted)', padding: '2rem' }}>No dives found</td></tr>
            )}
            {dives.map((d, i) => (
              <tr key={d.id} onClick={() => navigate(`/dives/${d.id}`)} style={{ cursor: 'pointer' }}>
                <td style={{ color: 'var(--muted)' }}>{dives.length - i}</td>
                <td>{new Date(d.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td>{d.location}</td>
                <td>{depthBadge(d.depth_m)}</td>
                <td>{d.duration_min} min</td>
                <td>{roleBadge(d.my_role)}</td>
                <td style={{ color: 'var(--muted)', fontSize: 12 }}>{d.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}