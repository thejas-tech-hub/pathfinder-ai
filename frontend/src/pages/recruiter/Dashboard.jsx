import React, { useState, useEffect } from 'react';
import { getDrives, getAnalytics } from '../../services/api';
import { MetricCard, StatusBadge, Spinner, EmptyState } from '../../components/ui';
import { Briefcase, Users, TrendingUp, Building2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RecruiterDashboard() {
  const [drives, setDrives] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDrives(), getAnalytics()]).then(([d, a]) => {
      setDrives(d.data);
      setAnalytics(a.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title gradient-text">Recruiter Hub</h1>
          <p className="text-[#64748b] text-sm mt-1">Manage drives and discover top candidates</p>
        </div>
        <Link to="/recruiter/create-drive" className="cyber-btn-primary">
          <Plus size={16} /> Post New Drive
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Drives" value={analytics?.total_drives || 0} icon={Building2} color="violet" />
        <MetricCard label="Active Drives" value={analytics?.active_drives || 0} icon={Briefcase} color="cyan" />
        <MetricCard label="Total Applicants" value={analytics?.total_applications || 0} icon={Users} color="emerald" />
        <MetricCard label="Shortlisted" value={analytics?.shortlisted || 0} icon={TrendingUp} color="yellow" />
      </div>

      <div className="cyber-card">
        <h3 className="section-title"><Building2 size={16} className="text-violet-400" />Your Drives</h3>
        {drives.length === 0 && (
          <EmptyState icon={Building2} title="No drives yet" subtitle="Post your first placement drive to get started" />
        )}
        <div className="space-y-3">
          {drives.map(drive => (
            <div key={drive.id} className="flex items-center justify-between p-4 rounded-lg bg-[#0a0a1a] border border-[#1e1e4a] hover:border-violet-700/50 transition-all">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white">{drive.company_name}</p>
                  <StatusBadge status={drive.status} />
                </div>
                <p className="text-sm text-violet-400">{drive.job_role}</p>
                <p className="text-xs text-[#64748b] mt-1">
                  CGPA ≥ {drive.min_cgpa} | Max Backlogs: {drive.max_backlogs} | {drive.location}
                </p>
              </div>
              <Link to={`/recruiter/shortlist?driveId=${drive.id}`} className="cyber-btn-secondary text-sm">
                <Users size={14} /> View Candidates
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
