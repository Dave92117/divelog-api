import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logDive } from '../api';

const ROLES = [
  { value: 'diver', label: 'Diver' },
  { value: 'tender', label: 'Tender' },
  { value: 'standby_diver', label: 'Standby diver' },
  { value: 'dive_leader', label: 'Dive leader' },
];

export default function LogDive() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    date: today, location: '', depth_m: '', duration_min: '',
    my_role: 'diver', visibility_m: '', water_temp_c: '', notes: '',
  });
  const [team, setTeam] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function addMember() {
    setTeam(t => [...t, { name: '', role: 'diver' }]);
  }

  function updateMember(i, field, value) {
    setTeam(t => t.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
  }

  function removeMember(i) {
    setTeam(t => t.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        depth_m: parseFloat(form.depth_m),
        duration_min: parseInt(form.duration_min),
        visibility_m: form.visibility_m ? parseFloat(form.visibility_m) : null,
        water_temp_c: form.water_temp_c ? parseFloat(form.water_temp_c) : null,
        notes: form.notes || null,
        team: team.filter(m => m.name.trim()),
      };
      const data = await logDive(payload);
      if (data.id) {
        navigate(`/dives/${data.id}`);
      } else {
        setError(data.error || 'Failed to log dive');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="form-card">
        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 16 }}>Log a dive</div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <p className="form-section-title">DIVE INFO</p>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input placeholder="e.g. Ågotnes pier" value={form.location} onChange={e => set('location', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Max depth (m)</label>
              <input type="number" step="0.1" placeholder="28" value={form.depth_m} onChange={e => set('depth_m', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Duration (min)</label>
              <input type="number" placeholder="45" value={form.duration_min} onChange={e => set('duration_min', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Visibility (m)</label>
              <input type="number" step="0.1" placeholder="12" value={form.visibility_m} onChange={e => set('visibility_m', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Water temp (°C)</label>
              <input type="number" step="0.1" placeholder="14" value={form.water_temp_c} onChange={e => set('water_temp_c', e.target.value)} />
            </div>
            <div className="form-group form-full">
              <label className="form-label">Notes</label>
              <textarea placeholder="Spotted a seal near the pier..." value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>

            <p className="form-section-title">DIVE TEAM</p>
            <div className="form-group form-full">
              <label className="form-label">My role on this dive</label>
              <select value={form.my_role} onChange={e => set('my_role', e.target.value)} style={{ maxWidth: 220 }}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            <div className="form-group form-full">
              <label className="form-label">Team members</label>
              {team.map((m, i) => (
                <div key={i} className="team-form-row">
                  <input placeholder="Name" value={m.name} onChange={e => updateMember(i, 'name', e.target.value)} />
                  <select value={m.role} onChange={e => updateMember(i, 'role', e.target.value)}>
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                  <button type="button" className="btn-icon" onClick={() => removeMember(i)}>×</button>
                </div>
              ))}
              <button type="button" className="add-member-btn" onClick={addMember}>+ Add team member</button>
            </div>

            {error && <p className="error-msg form-full">{error}</p>}
            <div className="form-actions form-full">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save dive'}
              </button>
              <button type="button" className="btn-ghost" onClick={() => navigate('/logbook')}>Cancel</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}