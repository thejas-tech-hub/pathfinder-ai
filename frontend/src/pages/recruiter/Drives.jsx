import React, { useState, useEffect } from 'react';
import { getDrives } from '../../services/api';
import { Spinner, StatusBadge } from '../../components/ui';
import { Building2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RecruiterDrives() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDrives().then(r => setDrives(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title gradient-text">My Drives</h1>
          <p className="text-[#64748b] text-sm mt-1">{drives.length} total drives</p>
        </div>
        <Link to="/recruiter/create-drive" className="cyber-btn-primary"><Plus size={16} /> Post Drive</Link>
      </div>

      {loading && <div className="flex justify-center py-20"><Spinner size={32} /></div>}

      <div className="space-y-3">
        {drives.map(d => (
          <div key={d.id} className="cyber-card flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-white">{d.company_name}</h3>
                <StatusBadge status={d.status} />
              </div>
              <p className="text-violet-400 text-sm">{d.job_role}</p>
              <p className="text-xs text-[#64748b] mt-1">{d.location} | {d.min_cgpa}+ CGPA | {d.package_min && `${d.package_min}–${d.package_max} LPA`}</p>
            </div>
            <Link to={`/recruiter/shortlist?driveId=${d.id}`} className="cyber-btn-secondary text-sm">
              View Candidates →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
