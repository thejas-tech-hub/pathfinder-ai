import React, { useState, useEffect } from 'react';
import { getStudents, getStudentApplications } from '../../services/api';
import { Spinner, StatusBadge, CrsRing, EmptyState } from '../../components/ui';
import { ClipboardList, ChevronDown } from 'lucide-react';

export default function StudentApplications() {
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getStudents().then(r => {
      setStudents(r.data);
      if (r.data.length) setSelectedId(r.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    getStudentApplications(selectedId).then(r => setApplications(r.data)).finally(() => setLoading(false));
  }, [selectedId]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title gradient-text">My Applications</h1>
          <p className="text-[#64748b] text-sm mt-1">Track all your placement drive applications</p>
        </div>
        <div className="relative">
          <select className="cyber-input pr-8 appearance-none cursor-pointer text-sm" value={selectedId} onChange={e => setSelectedId(e.target.value)} style={{ minWidth: 220 }}>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
        </div>
      </div>

      {loading && <div className="flex justify-center py-20"><Spinner size={32} /></div>}

      {!loading && applications.length === 0 && (
        <EmptyState icon={ClipboardList} title="No applications yet" subtitle="Browse drives and apply to see results here" />
      )}

      <div className="space-y-4">
        {applications.map(app => (
          <div key={app.id} className={`cyber-card border ${app.status === 'shortlisted' ? 'border-yellow-700/50' : app.status === 'rejected' ? 'border-red-900/40' : 'border-[#1e1e4a]'}`}>
            <div className="flex items-center gap-4">
              {app.crs_score && <CrsRing score={Math.round(app.crs_score)} size={72} />}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-white">{app.company_name || app.drive_id}</h3>
                  <StatusBadge status={app.status} />
                </div>
                <p className="text-sm text-violet-400">{app.job_role}</p>
                {app.location && <p className="text-xs text-[#64748b]">{app.location}</p>}
                {app.package_min && <p className="text-xs text-[#64748b]">{app.package_min}–{app.package_max} LPA</p>}
                {app.matched_skills?.length > 0 && (
                  <div className="mt-2 flex flex-wrap">
                    {app.matched_skills.map(sk => <span key={sk} className="skill-chip-matched">{sk}</span>)}
                  </div>
                )}
              </div>
              <div className="text-right text-xs text-[#64748b]">
                {app.applied_at && new Date(app.applied_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
