import React, { useState, useEffect } from 'react';
import { getStudents } from '../../services/api';
import { Spinner, StatusBadge } from '../../components/ui';
import { GraduationCap, Search } from 'lucide-react';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudents().then(r => setStudents(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.branch.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title gradient-text">Student Registry</h1>
          <p className="text-[#64748b] text-sm mt-1">{students.length} registered students</p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
          <input className="cyber-input pl-9 text-sm" placeholder="Search by name, branch, ID..." value={search} onChange={e => setSearch(e.target.value)} style={{ minWidth: 260 }} />
        </div>
      </div>

      {loading && <div className="flex justify-center py-20"><Spinner size={32} /></div>}

      {!loading && (
        <div className="cyber-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e1e4a]">
                  <th className="table-header">Student</th>
                  <th className="table-header">ID</th>
                  <th className="table-header">Branch</th>
                  <th className="table-header">CGPA</th>
                  <th className="table-header">Backlogs</th>
                  <th className="table-header">Skills</th>
                  <th className="table-header">Resume</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-[#0d0d20] transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-xs font-bold text-white">
                          {s.name.charAt(0)}
                        </div>
                        <span className="font-medium">{s.name}</span>
                      </div>
                    </td>
                    <td className="table-cell mono text-xs text-[#94a3b8]">{s.id}</td>
                    <td className="table-cell"><span className="badge-purple">{s.branch}</span></td>
                    <td className="table-cell">
                      <span className={`font-semibold ${s.cgpa >= 8 ? 'text-emerald-400' : s.cgpa >= 7 ? 'text-yellow-400' : 'text-red-400'}`}>{s.cgpa}</span>
                    </td>
                    <td className="table-cell">
                      <span className={s.active_backlogs === 0 ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>{s.active_backlogs}</span>
                    </td>
                    <td className="table-cell">
                      <span className="text-[#94a3b8] text-xs">{s.skills?.slice(0, 3).join(', ')}{s.skills?.length > 3 ? ` +${s.skills.length - 3}` : ''}</span>
                    </td>
                    <td className="table-cell">
                      {s.resume_text ? <span className="badge-green">Uploaded</span> : <span className="badge-yellow">Missing</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center py-10 text-[#64748b]">No students found.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
