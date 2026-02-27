import React, { useState, useEffect } from 'react';
import { getDrives, updateDriveStatus } from '../../services/api';
import { Spinner, StatusBadge } from '../../components/ui';
import { Building2, MapPin, GraduationCap, Calendar } from 'lucide-react';

export default function AdminDrives() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDrives().then(r => setDrives(r.data)).finally(() => setLoading(false));
  }, []);

  const handleStatus = async (driveId, newStatus) => {
    await updateDriveStatus(driveId, newStatus);
    setDrives(prev => prev.map(d => d.id === driveId ? { ...d, status: newStatus } : d));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title gradient-text">Drives Management</h1>
        <p className="text-[#64748b] text-sm mt-1">Manage and control placement drives</p>
      </div>

      {loading && <div className="flex justify-center py-20"><Spinner size={32} /></div>}

      <div className="space-y-4">
        {drives.map(drive => (
          <div key={drive.id} className="cyber-card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-white text-base">{drive.company_name}</h3>
                  <StatusBadge status={drive.status} />
                </div>
                <p className="text-violet-400 text-sm mb-2">{drive.job_role}</p>
                <div className="flex flex-wrap gap-4 text-xs text-[#94a3b8]">
                  <span className="flex items-center gap-1"><GraduationCap size={12} />Min CGPA: {drive.min_cgpa} | Backlogs ≤ {drive.max_backlogs}</span>
                  {drive.location && <span className="flex items-center gap-1"><MapPin size={12} />{drive.location}</span>}
                  {drive.drive_date && <span className="flex items-center gap-1"><Calendar size={12} />{drive.drive_date}</span>}
                  {drive.package_min && <span>{drive.package_min}–{drive.package_max} LPA</span>}
                </div>
                <div className="flex flex-wrap mt-2">
                  {(drive.eligible_branches || []).map(b => <span key={b} className="badge-purple mr-1 mb-1">{b}</span>)}
                </div>
                <div className="flex flex-wrap mt-1">
                  {(drive.required_skills || []).slice(0, 6).map(sk => <span key={sk} className="skill-chip">{sk}</span>)}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                {drive.status === 'active' && (
                  <>
                    <button className="cyber-btn-secondary text-xs px-3 py-1.5" onClick={() => handleStatus(drive.id, 'completed')}>
                      Mark Completed
                    </button>
                    <button className="cyber-btn-danger text-xs" onClick={() => handleStatus(drive.id, 'closed')}>
                      Close Drive
                    </button>
                  </>
                )}
                {drive.status !== 'active' && (
                  <button className="cyber-btn-secondary text-xs px-3 py-1.5" onClick={() => handleStatus(drive.id, 'active')}>
                    Reopen
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
