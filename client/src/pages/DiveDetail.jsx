import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDive, deleteDive } from '../api';

const roleMap = {
  diver: { label: 'Diver', cls: 'rb-diver', avatarCls: 'role-diver' },
  tender: { label: 'Tender', cls: 'rb-tender', avatarCls: 'role-tender' },
  standby_diver: { label: 'Standby diver', cls: 'rb-standby', avatarCls: 'role-standby' },
  dive_leader: { label: 'Dive leader', cls: 'rb-leader', avatarCls: 'role-leader' },
};

function initials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function DiveDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dive, setDive] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getDive(id).then(setDive);
  }, [id]);

  async function handleDelete() {
    if (!confirm('Delete this dive?')) return;
    setDeleting(true);
    await deleteDive(id);
    navigate('/logbook');
  }

  if (!dive) return <div className="page" style={{ color: 'var(--color-muted)' }}>Loading...</div>;

  const r = roleMap[dive.my_role] || { label: dive.my_role, cls: '', avatarCls: '' };

  return (
    <div className="page">
      <button className="back-link" onClick={() => navigate('/logbook')}>
        ← Back to logbook
      </button>

      <div className="detail-card">
        <div className="detail-header">
          <div className="detail-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2C6.13 2 3 5.13 3 9c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S8.62 6.5 10 6.5s2.5 1.12 2.5 2.5S11.38 11.5 10 11.5z" fill="#1D9E75"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{dive.location}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              {new Date(dive.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
          <button
            className="btn-ghost"
            style={{ marginLeft: 'auto', color: '#E24B4A', borderColor: '#E24B4A' }}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>

        <div className="detail-body">
          <div className="detail-section">
            <div className="detail-section-label">DIVE INFO</div>
            <div className="detail-row"><span className="detail-key">Max depth</span><span className="detail-val">{dive.depth_m}m</span></div>
            <div className="detail-row"><span className="detail-key">Duration</span><span className="detail-val">{dive.duration_min} minutes</span></div>
            {dive.visibility_m && <div className="detail-row"><span className="detail-key">Visibility</span><span className="detail-val">{dive.visibility_m}m</span></div>}
            {dive.water_temp_c && <div className="detail-row"><span className="detail-key">Water temp</span><span className="detail-val">{dive.water_temp_c}°C</span></div>}
            <div className="detail-row">
              <span className="detail-key">My role</span>
              <span className="detail-val"><span className={`role-badge ${r.cls}`}>{r.label}</span></span>
            </div>
            {dive.notes && <div className="detail-row"><span className="detail-key">Notes</span><span className="detail-val">{dive.notes}</span></div>}
          </div>

          {dive.team && dive.team.length > 0 && (
            <div className="detail-section" style={{ marginBottom: 0 }}>
              <div className="detail-section-label">DIVE TEAM</div>
              <div className="team-grid">
                {dive.team.map((m, i) => {
                  const mr = roleMap[m.role] || { label: m.role, cls: '', avatarCls: '' };
                  return (
                    <div key={i} className="team-member">
                      <div className={`member-avatar ${mr.avatarCls}`}>{initials(m.name)}</div>
                      <div className="member-info">
                        <div className="member-name">{m.name}</div>
                        <span className={`role-badge ${mr.cls}`}>{mr.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}