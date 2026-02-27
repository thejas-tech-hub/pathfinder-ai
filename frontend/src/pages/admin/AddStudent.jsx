import React, { useState } from 'react';
import { createStudent } from '../../services/api';
import { Alert, Spinner } from '../../components/ui';
import { Plus, X, UserPlus, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'MCA', 'MBA', 'ME', 'Civil'];

export default function AddStudent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', branch: 'CSE', cgpa: '',
    active_backlogs: 0, graduation_year: 2025,
    phone: '', skills: [], projects: [], certifications: [],
  });
  const [inputs, setInputs] = useState({ skill: '', project: '', cert: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const addItem = (field, inputKey) => {
    const val = inputs[inputKey].trim();
    if (val && !form[field].includes(val)) {
      set(field, [...form[field], val]);
      setInputs(p => ({ ...p, [inputKey]: '' }));
    }
  };
  const removeItem = (field, item) => set(field, form[field].filter(x => x !== item));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.cgpa || isNaN(parseFloat(form.cgpa))) { setError('Please enter a valid CGPA'); return; }
    setLoading(true); setError('');
    try {
      const res = await createStudent({
        ...form,
        cgpa: parseFloat(form.cgpa),
        active_backlogs: parseInt(form.active_backlogs),
        graduation_year: parseInt(form.graduation_year),
      });
      setSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add student');
    } finally { setLoading(false); }
  };

  if (success) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="p-4 bg-emerald-900/40 rounded-full mb-4">
        <CheckCircle2 size={40} className="text-emerald-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-1">Student Added!</h2>
      <p className="text-[#94a3b8] mb-1">{success.name} — <span className="text-violet-400 font-mono text-sm">{success.id}</span></p>
      <p className="text-[#64748b] text-sm mb-6">Student can now apply to drives and get CRS scored.</p>
      <div className="flex gap-3">
        <button className="cyber-btn-primary" onClick={() => { setSuccess(null); setForm({ name:'',email:'',branch:'CSE',cgpa:'',active_backlogs:0,graduation_year:2025,phone:'',skills:[],projects:[],certifications:[] }); }}>
          <Plus size={16} /> Add Another
        </button>
        <button className="cyber-btn-secondary" onClick={() => navigate('/admin/students')}>
          View All Students →
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl">
      <h1 className="page-title gradient-text mb-1">Add New Student</h1>
      <p className="text-[#64748b] text-sm mb-6">Register a new student profile in the system</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="cyber-card">
          <h3 className="section-title text-violet-400"><UserPlus size={16} />Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="cyber-label">Full Name *</label>
              <input className="cyber-input" required placeholder="e.g. Rahul Sharma"
                value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label className="cyber-label">Email *</label>
              <input type="email" className="cyber-input" required placeholder="student@college.edu"
                value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className="cyber-label">Phone</label>
              <input className="cyber-input" placeholder="9876543210"
                value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <label className="cyber-label">Graduation Year</label>
              <input type="number" className="cyber-input" min="2024" max="2030"
                value={form.graduation_year} onChange={e => set('graduation_year', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Academic Info */}
        <div className="cyber-card">
          <h3 className="section-title text-cyan-400">Academic Details</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="cyber-label">CGPA *</label>
              <input type="number" step="0.01" min="0" max="10" className="cyber-input" required
                placeholder="e.g. 8.5" value={form.cgpa} onChange={e => set('cgpa', e.target.value)} />
            </div>
            <div>
              <label className="cyber-label">Active Backlogs</label>
              <input type="number" min="0" max="20" className="cyber-input"
                value={form.active_backlogs} onChange={e => set('active_backlogs', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="cyber-label">Branch *</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {BRANCHES.map(b => (
                <button key={b} type="button" onClick={() => set('branch', b)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${form.branch === b ? 'bg-violet-600 text-white' : 'bg-[#0a0a1a] border border-[#1e1e4a] text-[#94a3b8] hover:border-violet-600'}`}>
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="cyber-card">
          <h3 className="section-title text-emerald-400">Skills, Projects & Certifications</h3>

          {[
            { label: 'Technical Skills', field: 'skills', key: 'skill', placeholder: 'e.g. Python, React...' },
            { label: 'Projects', field: 'projects', key: 'project', placeholder: 'e.g. E-commerce App...' },
            { label: 'Certifications', field: 'certifications', key: 'cert', placeholder: 'e.g. AWS Cloud Practitioner...' },
          ].map(({ label, field, key, placeholder }) => (
            <div key={field} className="mb-4">
              <label className="cyber-label">{label}</label>
              <div className="flex gap-2 mb-2">
                <input className="cyber-input flex-1 text-sm" placeholder={placeholder}
                  value={inputs[key]}
                  onChange={e => setInputs(p => ({ ...p, [key]: e.target.value }))}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem(field, key); } }} />
                <button type="button" className="cyber-btn-secondary px-3" onClick={() => addItem(field, key)}>
                  <Plus size={15} />
                </button>
              </div>
              <div className="flex flex-wrap">
                {form[field].map(item => (
                  <span key={item} className="skill-chip flex items-center gap-1 cursor-pointer"
                    onClick={() => removeItem(field, item)}>
                    {item} <X size={11} className="hover:text-red-400" />
                  </span>
                ))}
                {form[field].length === 0 && <p className="text-xs text-[#4a4a7a]">None added yet. Type and press Enter.</p>}
              </div>
            </div>
          ))}
        </div>

        {error && <Alert type="error" message={error} />}

        <button type="submit" className="cyber-btn-primary w-full justify-center py-3 text-base" disabled={loading}>
          {loading ? <><Spinner size={18} />Adding Student...</> : <><UserPlus size={18} />Add Student to System</>}
        </button>
      </form>
    </div>
  );
}
