import React, { useState, useEffect } from 'react';
import { getDrives, getStudents, applyToDrive, getEligibility } from '../../services/api';
import { Alert, Spinner, PolicyCheckRow, CrsRing, StatusBadge, ScoreBar } from '../../components/ui';
import { Briefcase, MapPin, DollarSign, GraduationCap, Zap, ChevronDown } from 'lucide-react';

export default function BrowseDrives() {
  const [drives, setDrives] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [eligibility, setEligibility] = useState({});
  const [applying, setApplying] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDrives(), getStudents()]).then(([d, s]) => {
      setDrives(d.data.filter(dr => dr.status === 'active'));
      setStudents(s.data);
      if (s.data.length) setSelectedId(s.data[0].id);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    getEligibility(selectedId).then(r => {
      const map = {};
      (r.data.eligibility || []).forEach(e => { map[e.drive_id] = e; });
      setEligibility(map);
    });
  }, [selectedId]);

  const handleApply = async (driveId) => {
    setApplying(driveId);
    try {
      const r = await applyToDrive(selectedId, driveId);
      setResults(prev => ({ ...prev, [driveId]: r.data }));
    } catch (err) {
      setResults(prev => ({ ...prev, [driveId]: { error: err.response?.data?.detail || 'Error' } }));
    } finally {
      setApplying('');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title gradient-text">Browse Drives</h1>
          <p className="text-[#64748b] text-sm mt-1">{drives.length} active placement drives</p>
        </div>
        <div className="relative">
          <select className="cyber-input pr-8 appearance-none cursor-pointer text-sm" value={selectedId} onChange={e => setSelectedId(e.target.value)} style={{ minWidth: 220 }}>
            {students.map(s => <option key={s.id} value={s.id}>{s.name} — {s.branch}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {drives.map(drive => {
          const elig = eligibility[drive.id];
          const res = results[drive.id];
          return (
            <div key={drive.id} className={`cyber-card border ${elig?.eligible ? 'border-emerald-800/50' : elig ? 'border-red-900/40' : 'border-[#1e1e4a]'}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white">{drive.company_name}</h3>
                    <StatusBadge status={drive.status} />
                  </div>
                  <p className="text-violet-400 font-medium">{drive.job_role}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-[#94a3b8]">
                    {drive.location && <span className="flex items-center gap-1"><MapPin size={13} />{drive.location}</span>}
                    {drive.package_min && <span className="flex items-center gap-1"><DollarSign size={13} />{drive.package_min}–{drive.package_max} LPA</span>}
                    <span className="flex items-center gap-1"><GraduationCap size={13} />Min CGPA: {drive.min_cgpa}</span>
                  </div>
                </div>
                {elig && (
                  <div className={`px-3 py-2 rounded-lg text-sm font-bold ${elig.eligible ? 'bg-emerald-900/40 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
                    {elig.eligible ? '✓ Eligible' : '✗ Not Eligible'}
                  </div>
                )}
              </div>

              {/* Skills */}
              <div className="flex flex-wrap mb-4">
                {(drive.required_skills || []).map(sk => <span key={sk} className="skill-chip">{sk}</span>)}
              </div>

              {/* Policy Checks */}
              {elig && (
                <div className="bg-[#0a0a1a] rounded-lg p-3 mb-4">
                  <p className="text-xs text-[#64748b] mb-2 font-medium uppercase tracking-wider">Policy Check Results</p>
                  {elig.checks?.map((c, i) => <PolicyCheckRow key={i} check={c} />)}
                </div>
              )}

              {/* Apply Result */}
              {res && !res.error && (
                <div className="bg-[#0a0a1a] rounded-lg p-4 mb-4 border border-[#1e1e4a]">
                  <div className="flex items-start gap-4">
                    {res.crs && <CrsRing score={Math.round(res.crs.crs_score)} size={80} />}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`font-bold text-lg ${res.status === 'ELIGIBLE' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {res.status}
                        </span>
                      </div>
                      {res.crs && (
                        <>
                          <ScoreBar label="Semantic Skill Match (50%)" value={res.crs.semantic_score} color="violet" />
                          <ScoreBar label="Project Relevance (30%)" value={res.crs.project_score} color="cyan" />
                          <ScoreBar label="Resume Completeness (20%)" value={res.crs.completeness_score} color="emerald" />
                          {res.crs.missing_skills?.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-[#94a3b8] mb-1">Missing skills:</p>
                              {res.crs.missing_skills.map(sk => <span key={sk} className="skill-chip-missing">{sk}</span>)}
                            </div>
                          )}
                          {res.crs.improvement_suggestions && (
                            <div className="mt-2 space-y-1">
                              {res.crs.improvement_suggestions.map((s, i) => (
                                <p key={i} className="text-xs text-[#94a3b8]">{s}</p>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                      {res.status === 'REJECTED' && (
                        <p className="text-sm text-red-400">{res.policy_result?.reasoning}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {res?.error && <Alert type="error" message={res.error} />}
              {res?.message && <Alert type="info" message={res.message} />}

              <button
                className={`cyber-btn-primary w-full justify-center ${!elig?.eligible ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => handleApply(drive.id)}
                disabled={applying === drive.id || !elig?.eligible || !!res}
              >
                {applying === drive.id ? <><Spinner size={16} />Processing AI Match...</> : <><Zap size={16} />{res ? 'Applied' : 'Apply & Get CRS Score'}</>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
