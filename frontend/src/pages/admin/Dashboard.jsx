import React, { useState, useEffect } from 'react';
import { getAnalytics, getStudents, getDrives } from '../../services/api';
import { MetricCard, Spinner, StatusBadge } from '../../components/ui';
import { GraduationCap, Building2, Users, BarChart3, TrendingUp, Award, CheckCircle2, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAnalytics(), getStudents(), getDrives()]).then(([a, s, d]) => {
      setAnalytics(a.data);
      setStudents(s.data);
      setDrives(d.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>;

  const cgpaGroups = [
    { range: '9.0–10', count: students.filter(s => s.cgpa >= 9).length },
    { range: '8.0–9.0', count: students.filter(s => s.cgpa >= 8 && s.cgpa < 9).length },
    { range: '7.0–8.0', count: students.filter(s => s.cgpa >= 7 && s.cgpa < 8).length },
    { range: '6.0–7.0', count: students.filter(s => s.cgpa >= 6 && s.cgpa < 7).length },
    { range: '< 6.0', count: students.filter(s => s.cgpa < 6).length },
  ];

  const branchData = [...new Set(students.map(s => s.branch))].map(b => ({
    branch: b,
    count: students.filter(s => s.branch === b).length,
  }));

  const appPieData = [
    { name: 'Eligible', value: analytics?.eligible || 0 },
    { name: 'Shortlisted', value: analytics?.shortlisted || 0 },
    { name: 'Rejected', value: analytics?.rejected || 0 },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title gradient-text">Admin / TPO Dashboard</h1>
        <p className="text-[#64748b] text-sm mt-1">Platform analytics and oversight</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Students" value={analytics?.total_students || 0} icon={GraduationCap} color="violet" />
        <MetricCard label="Active Drives" value={analytics?.active_drives || 0} icon={Building2} color="cyan" />
        <MetricCard label="Applications" value={analytics?.total_applications || 0} icon={Users} color="emerald" />
        <MetricCard label="Placement Rate" value={`${analytics?.placement_rate || 0}%`} icon={Award} color="yellow" />
      </div>

      <div className="grid grid-cols-3 gap-5 mb-5">
        {/* CGPA Distribution */}
        <div className="cyber-card col-span-2">
          <h3 className="section-title"><BarChart3 size={16} className="text-violet-400" />CGPA Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={cgpaGroups} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ background: '#12122a', border: '1px solid #1e1e4a', borderRadius: 8, color: '#e2e8f0' }} />
              <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Application Status Pie */}
        <div className="cyber-card">
          <h3 className="section-title"><TrendingUp size={16} className="text-cyan-400" />Application Status</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={appPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                {appPieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#12122a', border: '1px solid #1e1e4a', borderRadius: 8, color: '#e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1 mt-1">
            {appPieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                <span className="text-[#94a3b8]">{d.name}</span>
                <span className="text-white font-semibold ml-auto">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Drives Table */}
      <div className="cyber-card mb-5">
        <h3 className="section-title"><Building2 size={16} className="text-emerald-400" />Active Drives Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e1e4a]">
                <th className="table-header">Company</th>
                <th className="table-header">Role</th>
                <th className="table-header">Min CGPA</th>
                <th className="table-header">Max Backlogs</th>
                <th className="table-header">Package</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody>
              {drives.map(d => (
                <tr key={d.id} className="hover:bg-[#0d0d20]">
                  <td className="table-cell font-medium">{d.company_name}</td>
                  <td className="table-cell text-violet-400">{d.job_role}</td>
                  <td className="table-cell">{d.min_cgpa}</td>
                  <td className="table-cell">{d.max_backlogs}</td>
                  <td className="table-cell">{d.package_min && `${d.package_min}–${d.package_max} LPA`}</td>
                  <td className="table-cell"><StatusBadge status={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Branch Distribution */}
      <div className="cyber-card">
        <h3 className="section-title"><GraduationCap size={16} className="text-yellow-400" />Students by Branch</h3>
        <div className="flex gap-4 flex-wrap">
          {branchData.map((b, i) => (
            <div key={b.branch} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0a0a1a] border border-[#1e1e4a]">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="text-sm text-white font-semibold">{b.branch}</span>
              <span className="text-xs text-[#94a3b8]">{b.count} students</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
