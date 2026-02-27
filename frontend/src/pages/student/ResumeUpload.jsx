import React, { useState, useEffect, useRef } from 'react';
import { getStudents, uploadResume } from '../../services/api';
import { Alert, Spinner } from '../../components/ui';
import { Upload, FileText, Wand2, ChevronDown, FilePlus } from 'lucide-react';

export default function ResumeUpload() {
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadMode, setUploadMode] = useState('text'); // 'text' or 'pdf'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    getStudents().then(r => {
      setStudents(r.data);
      if (r.data.length > 0) setSelectedId(r.data[0].id);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploadMode === 'text' && !resumeText.trim()) {
      setError('Please paste your resume text'); return;
    }
    if (uploadMode === 'pdf' && !pdfFile) {
      setError('Please select a PDF file'); return;
    }
    setLoading(true); setError(''); setResult(null);
    try {
      const form = new FormData();
      form.append('student_id', selectedId);
      if (uploadMode === 'pdf') {
        form.append('file', pdfFile);
      } else {
        form.append('resume_text', resumeText);
      }
      const r = await uploadResume(form);
      setResult(r.data);
      setPdfFile(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Try pasting text instead.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="page-title gradient-text mb-1">Upload Resume</h1>
      <p className="text-[#64748b] text-sm mb-6">AI will extract your skills automatically</p>

      <div className="cyber-card mb-5">
        {/* Student Selector */}
        <div className="mb-5">
          <label className="cyber-label">Select Student Profile</label>
          <div className="relative">
            <select className="cyber-input pr-8 appearance-none cursor-pointer"
              value={selectedId} onChange={e => setSelectedId(e.target.value)}>
              {students.map(s => <option key={s.id} value={s.id}>{s.name} — {s.id}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-5">
          <button type="button"
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${uploadMode === 'text' ? 'bg-violet-600 text-white' : 'bg-[#0a0a1a] border border-[#1e1e4a] text-[#94a3b8] hover:border-violet-600'}`}
            onClick={() => setUploadMode('text')}>
            <FileText size={14} /> Paste Text
          </button>
          <button type="button"
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${uploadMode === 'pdf' ? 'bg-violet-600 text-white' : 'bg-[#0a0a1a] border border-[#1e1e4a] text-[#94a3b8] hover:border-violet-600'}`}
            onClick={() => setUploadMode('pdf')}>
            <FilePlus size={14} /> Upload PDF
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {uploadMode === 'text' ? (
            <div>
              <label className="cyber-label">Resume Content</label>
              <textarea className="cyber-input font-mono text-xs" rows={12}
                placeholder={`Paste your resume here...\n\nExample:\nJohn Doe - Software Engineer\nSkills: Python, React, PostgreSQL, Docker, AWS\nProjects: E-commerce Platform, Real-time Chat App\nCertifications: AWS Cloud Practitioner\nCGPA: 8.5 | CSE | 2025`}
                value={resumeText} onChange={e => setResumeText(e.target.value)} />
            </div>
          ) : (
            <div>
              <label className="cyber-label">Upload PDF Resume</label>
              <div
                className="border-2 border-dashed border-[#1e1e4a] hover:border-violet-600 rounded-xl p-10 text-center cursor-pointer transition-all"
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type === 'application/pdf') setPdfFile(f); }}>
                <input ref={fileRef} type="file" accept=".pdf" className="hidden"
                  onChange={e => setPdfFile(e.target.files[0])} />
                {pdfFile ? (
                  <div>
                    <div className="text-4xl mb-2">📄</div>
                    <p className="text-white font-semibold">{pdfFile.name}</p>
                    <p className="text-[#94a3b8] text-sm mt-1">{(pdfFile.size / 1024).toFixed(1)} KB</p>
                    <button type="button" className="text-xs text-red-400 mt-2 hover:text-red-300"
                      onClick={e => { e.stopPropagation(); setPdfFile(null); }}>Remove</button>
                  </div>
                ) : (
                  <div>
                    <Upload size={32} className="text-[#4a4a7a] mx-auto mb-3" />
                    <p className="text-white font-semibold">Drop PDF here or click to browse</p>
                    <p className="text-[#64748b] text-sm mt-1">Supports .pdf files</p>
                    <p className="text-[#4a4a7a] text-xs mt-1">
                      💡 Tip: Install <code className="text-violet-400">pip install pdfminer.six</code> for best PDF extraction
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mt-4">
            <button type="submit" className="cyber-btn-primary" disabled={loading}>
              {loading ? <Spinner size={16} /> : <Wand2 size={16} />}
              {loading ? 'Extracting Skills...' : 'Upload & Extract Skills'}
            </button>
            <button type="button" className="cyber-btn-secondary"
              onClick={() => { setResumeText(''); setPdfFile(null); setResult(null); setError(''); }}>
              <FileText size={16} /> Clear
            </button>
          </div>
        </form>

        {error && <div className="mt-3"><Alert type="error" message={error} /></div>}
      </div>

      {result && (
        <div className="cyber-card glow-green">
          <h3 className="section-title text-emerald-400">
            <Upload size={16} className="text-emerald-400" /> Resume Uploaded Successfully!
          </h3>
          <p className="text-sm text-[#94a3b8] mb-3">
            AI extracted <strong className="text-white">{result.extracted_skills?.length || 0}</strong> new skills
          </p>
          <div className="mb-3">
            <p className="cyber-label">Newly Extracted Skills</p>
            <div className="flex flex-wrap">
              {result.extracted_skills?.length === 0
                ? <span className="text-sm text-[#64748b]">No standard tech skills detected. Try adding Python, React, etc.</span>
                : (result.extracted_skills || []).map(sk => <span key={sk} className="skill-chip">{sk}</span>)}
            </div>
          </div>
          <div>
            <p className="cyber-label">Total Skill Profile ({result.total_skills?.length})</p>
            <div className="flex flex-wrap">
              {(result.total_skills || []).map(sk => <span key={sk} className="skill-chip">{sk}</span>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
