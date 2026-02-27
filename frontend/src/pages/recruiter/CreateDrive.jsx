import React, { useState } from 'react';
import { createDrive } from '../../services/api';
import { Alert, Spinner } from '../../components/ui';
import { Plus, X, Wand2, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'MCA', 'MBA', 'ME', 'Civil'];

export default function CreateDrive() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    company_name: '',
    job_role: '',
    jd_text: '',
    required_skills: [],
    min_cgpa: 6.0,
    max_backlogs: 0,
    eligible_branches: ['CSE', 'IT'],
    location: '',
    package_min: '',
    package_max: '',
    drive_date: '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const set = (field, value) => setForm(p => ({ ...p, [field]: value }));

  const addSkill = () => {
    if (skillInput.trim() && !form.required_skills.includes(skillInput.trim())) {
      set('required_skills', [...form.required_skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const toggleBranch = (b) => {
    set('eligible_branches', form.eligible_branches.includes(b)
      ? form.eligible_branches.filter(x => x !== b)
      : [...form.eligible_branches, b]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await createDrive({
        ...form,
        package_min: form.package_min ? parseFloat(form.package_min) : null,
        package_max: form.package_max ? parseFloat(form.package_max) : null,
        min_cgpa: parseFloat(form.min_cgpa),
        max_backlogs: parseInt(form.max_backlogs),
      });
      setSuccess(true);
      setTimeout(() => navigate('/recruiter/drives'), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create drive');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="p-4 bg-emerald-900/40 rounded-full mb-4">
        <CheckCircle2 size={40} className="text-emerald-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-1">Drive Created!</h2>
      <p className="text-[#94a3b8]">Redirecting to drives list...</p>
    </div>
  );

  return (
    <div className="max-w-2xl">
      <h1 className="page-title gradient-text mb-1">Post Placement Drive</h1>
      <p className="text-[#64748b] text-sm mb-6">AI will auto-extract required skills from your JD</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="cyber-card">
          <h3 className="section-title text-violet-400"><Wand2 size={16} />Company & Role</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="cyber-label">Company Name *</label>
              <input className="cyber-input" required placeholder="e.g. Google" value={form.company_name} onChange={e => set('company_name', e.target.value)} />
            </div>
            <div>
              <label className="cyber-label">Job Role *</label>
              <input className="cyber-input" required placeholder="e.g. Software Engineer" value={form.job_role} onChange={e => set('job_role', e.target.value)} />
            </div>
          </div>
          <div className="mt-4">
            <label className="cyber-label">Job Description</label>
            <textarea className="cyber-input" rows={5} placeholder="Paste the full JD here. AI will auto-extract required skills..." value={form.jd_text} onChange={e => set('jd_text', e.target.value)} />
            <p className="text-xs text-[#64748b] mt-1">💡 AI will extract required skills from JD if you don't add them manually</p>
          </div>
        </div>

        <div className="cyber-card">
          <h3 className="section-title text-cyan-400">Required Skills</h3>
          <div className="flex gap-2 mb-3">
            <input
              className="cyber-input flex-1"
              placeholder="Add a skill (e.g. React, Python...)"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            />
            <button type="button" className="cyber-btn-secondary px-4" onClick={addSkill}><Plus size={16} /></button>
          </div>
          <div className="flex flex-wrap">
            {form.required_skills.map(sk => (
              <span key={sk} className="skill-chip flex items-center gap-1">
                {sk}
                <X size={12} className="cursor-pointer hover:text-red-400" onClick={() => set('required_skills', form.required_skills.filter(s => s !== sk))} />
              </span>
            ))}
            {form.required_skills.length === 0 && <p className="text-xs text-[#64748b]">No skills added. AI will extract from JD.</p>}
          </div>
        </div>

        <div className="cyber-card">
          <h3 className="section-title text-emerald-400">Eligibility Rules</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="cyber-label">Minimum CGPA</label>
              <input type="number" step="0.1" min="0" max="10" className="cyber-input" value={form.min_cgpa} onChange={e => set('min_cgpa', e.target.value)} />
            </div>
            <div>
              <label className="cyber-label">Max Active Backlogs</label>
              <input type="number" min="0" max="10" className="cyber-input" value={form.max_backlogs} onChange={e => set('max_backlogs', e.target.value)} />
            </div>
            <div>
              <label className="cyber-label">Package Min (LPA)</label>
              <input type="number" step="0.5" className="cyber-input" placeholder="e.g. 6" value={form.package_min} onChange={e => set('package_min', e.target.value)} />
            </div>
            <div>
              <label className="cyber-label">Package Max (LPA)</label>
              <input type="number" step="0.5" className="cyber-input" placeholder="e.g. 12" value={form.package_max} onChange={e => set('package_max', e.target.value)} />
            </div>
          </div>

          <div className="mb-4">
            <label className="cyber-label">Eligible Branches</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {BRANCHES.map(b => (
                <button key={b} type="button"
                  onClick={() => toggleBranch(b)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${form.eligible_branches.includes(b) ? 'bg-violet-600 text-white' : 'bg-[#0a0a1a] border border-[#1e1e4a] text-[#94a3b8] hover:border-violet-600'}`}
                >{b}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="cyber-label">Location</label>
              <input className="cyber-input" placeholder="e.g. Bangalore / Remote" value={form.location} onChange={e => set('location', e.target.value)} />
            </div>
            <div>
              <label className="cyber-label">Drive Date</label>
              <input type="date" className="cyber-input" value={form.drive_date} onChange={e => set('drive_date', e.target.value)} />
            </div>
          </div>
        </div>

        {error && <Alert type="error" message={error} />}

        <button type="submit" className="cyber-btn-primary w-full justify-center py-3 text-base" disabled={loading}>
          {loading ? <><Spinner size={18} />Creating Drive...</> : <><Plus size={18} />Create Placement Drive</>}
        </button>
      </form>
    </div>
  );
}
