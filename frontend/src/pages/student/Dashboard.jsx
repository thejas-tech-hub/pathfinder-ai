import React, { useState, useEffect } from 'react';
import { getStudents, getStudentApplications, getEligibility } from '../../services/api';
import { CrsRing, MetricCard, StatusBadge, Spinner, EmptyState, ScoreBar } from '../../components/ui';
import { GraduationCap, Briefcase, CheckCircle2, Target, TrendingUp, Award, ChevronDown } from 'lucide-react';

export default function StudentDashboard() {
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [student, setStudent] = useState(null);
  const [applications, setApplications] = useState([]);
  const [eligibility, setEligibility] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getStudents().then(r => {
      setStudents(r.data);
      if (r.data.length > 0) setSelectedId(r.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    const s = students.find(s => s.id === selectedId);
    setStudent(s || null);
    Promise.all([
      getStudentApplications(selectedId),
      getEligibility(selectedId),
    ]).then(([apps, elig]) => {
      setApplications(apps.data);
      setEligibility(elig.data.eligibility || []);
    }).finally(() => setLoading(false));
  }, [selectedId]);

  const bestCRS = applications.filter(a => a.crs_score).reduce((best, a) => Math.max(best, a.crs_score), 0);
  const shortlisted = applications.filter(a => a.status === 'shortlisted').length;
  const eligibleCount = eligibility.filter(e => e.eligible).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title gradient-text">Student Dashboard</h1>
          <p className="text-[#64748b] text-sm mt-1">Track your placement journey</p>
        </div>
        <div className="relative">
          <select
            className="cyber-input pr-8 appearance-none cursor-pointer text-sm"
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            style={{ minWidth: 220 }}
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name} — {s.branch}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
        </div>
      </div>

      {loading && <div className="flex justify-center py-10"><Spinner size={32} /></div>}

      {student && !loading && (
        <>
          {/* Profile Card */}
          <div className="cyber-card mb-5 glow-purple">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-xl font-bold text-white shrink-0">
                {student.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">{student.name}</h2>
                    <p className="text-[#94a3b8] text-sm">{student.email}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="badge-purple">{student.branch}</span>
                      <span className="text-sm text-white font-semibold">CGPA: <span className="text-violet-400">{student.cgpa}</span></span>
                      <span className={`text-sm font-semibold ${student.active_backlogs === 0 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                        Backlogs: {student.active_backlogs}
                      </span>
                    </div>
                  </div>
                  {bestCRS > 0 && <CrsRing score={Math.round(bestCRS)} size={90} />}
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(student.skills || []).map(s => (
                    <span key={s} className="skill-chip">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            <MetricCard label="Best CRS Score" value={bestCRS.toFixed(1)} icon={Target} color="violet" sub="Career Readiness" />
            <MetricCard label="Eligible Drives" value={eligibleCount} icon={CheckCircle2} color="emerald" sub={`of ${eligibility.length} total`} />
            <MetricCard label="Applications" value={applications.length} icon={Briefcase} color="cyan" />
            <MetricCard label="Shortlisted" value={shortlisted} icon={Award} color="yellow" />
          </div>

          <div className="grid grid-cols-2 gap-5">
            {/* Drive Eligibility */}
            <div className="cyber-card">
              <h3 className="section-title"><CheckCircle2 size={16} className="text-violet-400" />Drive Eligibility Status</h3>
              <div className="space-y-2">
                {eligibility.length === 0 && <p className="text-[#64748b] text-sm">No drives available.</p>}
                {eligibility.map(e => (
                  <div key={e.drive_id} className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a1a] border border-[#1e1e4a]">
                    <div>
                      <p className="text-sm font-medium text-white">{e.company_name}</p>
                      <p className="text-xs text-[#94a3b8]">{e.job_role}</p>
                    </div>
                    <StatusBadge status={e.eligible ? 'eligible' : 'rejected'} />
                  </div>
                ))}
              </div>
            </div>

            {/* Applications with CRS */}
            <div className="cyber-card">
              <h3 className="section-title"><TrendingUp size={16} className="text-cyan-400" />Application Scores</h3>
              {applications.filter(a => a.crs_score).length === 0 && (
                <p className="text-[#64748b] text-sm">No scored applications yet. Browse drives to apply.</p>
              )}
              <div className="space-y-4">
                {applications.filter(a => a.crs_score).map(app => (
                  <div key={app.id} className="p-3 rounded-lg bg-[#0a0a1a] border border-[#1e1e4a]">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-white">{app.company_name}</p>
                        <p className="text-xs text-[#94a3b8]">{app.job_role}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-violet-400">{app.crs_score}</span>
                        <StatusBadge status={app.status} />
                      </div>
                    </div>
                    <ScoreBar label="Semantic Match" value={app.semantic_score || 0} color="violet" />
                    <ScoreBar label="Project Relevance" value={app.project_score || 0} color="cyan" />
                    <ScoreBar label="Completeness" value={app.completeness_score || 0} color="emerald" />
                    {app.missing_skills?.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-[#94a3b8] mb-1">Missing skills:</p>
                        {app.missing_skills.map(sk => <span key={sk} className="skill-chip-missing">{sk}</span>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
