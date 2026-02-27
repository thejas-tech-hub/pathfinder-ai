import React, { useState, useEffect } from 'react';
import { getDrives, getShortlist, approveShortlist } from '../../services/api';
import { CrsRing, Spinner, EmptyState, StatusBadge, ScoreBar } from '../../components/ui';
import { Users, Trophy, ChevronDown, CheckCircle2, Star } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function ShortlistView() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialDriveId = params.get('driveId') || '';

  const [drives, setDrives] = useState([]);
  const [selectedDriveId, setSelectedDriveId] = useState(initialDriveId);
  const [shortlist, setShortlist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shortlisting, setShortlisting] = useState('');

  useEffect(() => {
    getDrives().then(r => {
      setDrives(r.data);
      if (!selectedDriveId && r.data.length > 0) setSelectedDriveId(r.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedDriveId) return;
    setLoading(true);
    getShortlist(selectedDriveId).then(r => setShortlist(r.data)).finally(() => setLoading(false));
  }, [selectedDriveId]);

  const handleShortlist = async (studentId) => {
    setShortlisting(studentId);
    await approveShortlist(studentId, selectedDriveId, 'Recruiter');
    getShortlist(selectedDriveId).then(r => setShortlist(r.data));
    setShortlisting('');
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title gradient-text">Ranked Candidate Shortlist</h1>
          <p className="text-[#64748b] text-sm mt-1">AI-ranked by Career Readiness Score</p>
        </div>
        <div className="relative">
          <select className="cyber-input pr-8 appearance-none cursor-pointer text-sm" value={selectedDriveId} onChange={e => setSelectedDriveId(e.target.value)} style={{ minWidth: 240 }}>
            {drives.map(d => <option key={d.id} value={d.id}>{d.company_name} — {d.job_role}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
        </div>
      </div>

      {loading && <div className="flex justify-center py-20"><Spinner size={32} /></div>}

      {shortlist && !loading && (
        <>
          <div className="cyber-card mb-5 flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{shortlist.total_eligible}</p>
              <p className="text-xs text-[#94a3b8]">Eligible Candidates</p>
            </div>
            <div className="h-8 w-px bg-[#1e1e4a]" />
            <p className="text-sm text-[#94a3b8] flex-1">
              All candidates have passed the <strong className="text-violet-400">Policy Gateway</strong> and are ranked by AI-computed CRS scores.
            </p>
          </div>

          {shortlist.candidates.length === 0 && (
            <EmptyState icon={Users} title="No applicants yet" subtitle="Students need to apply to this drive first" />
          )}

          <div className="space-y-4">
            {shortlist.candidates.map(candidate => (
              <div key={candidate.student_id} className={`cyber-card border ${candidate.rank <= 3 ? 'border-violet-700/60' : 'border-[#1e1e4a]'}`}>
                <div className="flex items-start gap-4">
                  <div className="text-2xl font-bold w-10 text-center pt-1">{getRankBadge(candidate.rank)}</div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-base">{candidate.student_name}</h3>
                          <span className="badge-purple">{candidate.branch}</span>
                          <StatusBadge status={candidate.status} />
                        </div>
                        <p className="text-xs text-[#94a3b8] mt-0.5">
                          CGPA: <span className="text-white">{candidate.cgpa}</span> &nbsp;|&nbsp; {candidate.student_id}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <CrsRing score={Math.round(candidate.crs_score || 0)} size={72} />
                        {candidate.status !== 'shortlisted' ? (
                          <button
                            className="cyber-btn-primary text-sm px-4 py-2"
                            onClick={() => handleShortlist(candidate.student_id)}
                            disabled={shortlisting === candidate.student_id}
                          >
                            {shortlisting === candidate.student_id ? <Spinner size={14} /> : <Star size={14} />}
                            Shortlist
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-semibold">
                            <CheckCircle2 size={16} /> Shortlisted
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <ScoreBar label="Semantic Match (50%)" value={candidate.semantic_score || 0} color="violet" />
                      <ScoreBar label="Project Relevance (30%)" value={candidate.project_score || 0} color="cyan" />
                      <ScoreBar label="Completeness (20%)" value={candidate.completeness_score || 0} color="emerald" />
                    </div>

                    <div className="flex gap-4 mt-2">
                      {candidate.matched_skills?.length > 0 && (
                        <div>
                          <p className="text-xs text-[#64748b] mb-1">Matched:</p>
                          {candidate.matched_skills.slice(0, 5).map(sk => <span key={sk} className="skill-chip-matched">{sk}</span>)}
                        </div>
                      )}
                      {candidate.missing_skills?.length > 0 && (
                        <div>
                          <p className="text-xs text-[#64748b] mb-1">Missing:</p>
                          {candidate.missing_skills.slice(0, 5).map(sk => <span key={sk} className="skill-chip-missing">{sk}</span>)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
