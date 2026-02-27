import React, { useState, useEffect } from 'react';
import { getStudents, getStudentApplications } from '../../services/api';
import { CrsRing, ScoreBar, Spinner } from '../../components/ui';
import { TrendingUp, BookOpen, Code, Award, ChevronDown, Lightbulb } from 'lucide-react';

const SKILL_RESOURCES = {
  'Python': 'https://docs.python.org/3/',
  'React': 'https://react.dev/',
  'Java': 'https://dev.java/',
  'Spring Boot': 'https://spring.io/projects/spring-boot',
  'Docker': 'https://docs.docker.com/',
  'Kubernetes': 'https://kubernetes.io/docs/',
  'Machine Learning': 'https://www.coursera.org/learn/machine-learning',
  'SQL': 'https://www.w3schools.com/sql/',
  'AWS': 'https://aws.amazon.com/training/',
  'System Design': 'https://github.com/donnemartin/system-design-primer',
};

export default function CareerRoadmap() {
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

  const allMissing = [...new Set(applications.flatMap(a => a.missing_skills || []))];
  const bestApp = applications.filter(a => a.crs_score).sort((a, b) => b.crs_score - a.crs_score)[0];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title gradient-text">Career Roadmap</h1>
          <p className="text-[#64748b] text-sm mt-1">AI-generated skill gap analysis and improvement plan</p>
        </div>
        <div className="relative">
          <select className="cyber-input pr-8 appearance-none cursor-pointer text-sm" value={selectedId} onChange={e => setSelectedId(e.target.value)} style={{ minWidth: 220 }}>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
        </div>
      </div>

      {loading && <div className="flex justify-center py-20"><Spinner size={32} /></div>}

      {!loading && (
        <div className="grid grid-cols-2 gap-5">
          {/* Best CRS Overview */}
          <div className="cyber-card glow-purple">
            <h3 className="section-title"><TrendingUp size={16} className="text-violet-400" />Your Best Performance</h3>
            {bestApp ? (
              <div className="flex items-center gap-5">
                <CrsRing score={Math.round(bestApp.crs_score)} size={110} />
                <div className="flex-1">
                  <p className="text-sm text-[#94a3b8] mb-1">Best CRS for {bestApp.company_name}</p>
                  <ScoreBar label="Semantic Skill Match (50%)" value={bestApp.semantic_score || 0} color="violet" />
                  <ScoreBar label="Project Relevance (30%)" value={bestApp.project_score || 0} color="cyan" />
                  <ScoreBar label="Resume Completeness (20%)" value={bestApp.completeness_score || 0} color="emerald" />
                </div>
              </div>
            ) : (
              <p className="text-[#64748b] text-sm">Apply to drives to see your CRS analysis here.</p>
            )}
          </div>

          {/* Skill Gaps */}
          <div className="cyber-card">
            <h3 className="section-title"><Lightbulb size={16} className="text-yellow-400" />Skill Gaps to Fill</h3>
            {allMissing.length === 0 ? (
              <p className="text-emerald-400 text-sm">🎉 No critical skill gaps detected across your applications!</p>
            ) : (
              <div>
                <p className="text-xs text-[#64748b] mb-3">These skills appear in JDs but are missing from your profile:</p>
                {allMissing.map(sk => (
                  <div key={sk} className="flex items-center justify-between py-2 border-b border-[#1e1e4a] last:border-0">
                    <span className="skill-chip-missing">{sk}</span>
                    {SKILL_RESOURCES[sk] ? (
                      <a href={SKILL_RESOURCES[sk]} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                        <BookOpen size={12} /> Learn →
                      </a>
                    ) : (
                      <a href={`https://www.coursera.org/search?query=${encodeURIComponent(sk)}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                        <BookOpen size={12} /> Search →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Improvement Tips */}
          <div className="cyber-card col-span-2">
            <h3 className="section-title"><Code size={16} className="text-cyan-400" />Personalized Improvement Plan</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  phase: 'Week 1–2', title: 'Core Skills Sprint',
                  icon: '🎯',
                  items: allMissing.slice(0, 2).length > 0
                    ? [`Start learning ${allMissing[0] || 'your top missing skill'}`, 'Complete 1 mini project using new skill', 'Document it on GitHub']
                    : ['Strengthen DSA fundamentals', 'Solve 10 LeetCode problems', 'Review OOP concepts']
                },
                {
                  phase: 'Week 3–4', title: 'Project Building',
                  icon: '🔨',
                  items: ['Build a real-world project', 'Deploy to cloud (Vercel/Heroku)', 'Write clean README with screenshots']
                },
                {
                  phase: 'Week 5–6', title: 'Profile Boost',
                  icon: '🚀',
                  items: ['Get a relevant certification', 'Contribute to open source', 'Update resume and re-run CRS']
                },
              ].map(step => (
                <div key={step.phase} className="bg-[#0a0a1a] rounded-lg p-4 border border-[#1e1e4a]">
                  <div className="text-2xl mb-2">{step.icon}</div>
                  <p className="text-xs text-violet-400 font-semibold mb-0.5">{step.phase}</p>
                  <p className="text-sm font-bold text-white mb-3">{step.title}</p>
                  <ul className="space-y-1.5">
                    {step.items.map((item, i) => (
                      <li key={i} className="text-xs text-[#94a3b8] flex items-start gap-1.5">
                        <span className="text-violet-500 mt-0.5">▸</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
