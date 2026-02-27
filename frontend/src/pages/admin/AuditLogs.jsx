import React, { useState, useEffect } from 'react';
import { getAuditLogs, exportLogsJSON, exportLogsCSV } from '../../services/api';
import { Spinner, StatusBadge } from '../../components/ui';
import { FileText, Download, Filter, CheckCircle2, XCircle, Brain, Star } from 'lucide-react';

const ACTION_ICONS = {
  POLICY_REJECTED: <XCircle size={14} className="text-red-400" />,
  AI_SCORED: <Brain size={14} className="text-violet-400" />,
  SHORTLISTED: <Star size={14} className="text-yellow-400" />,
  APPLIED: <CheckCircle2 size={14} className="text-cyan-400" />,
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [studentFilter, setStudentFilter] = useState('');
  const [driveFilter, setDriveFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = (params = {}) => {
    setLoading(true);
    getAuditLogs({ ...params, limit: 200 }).then(r => setLogs(r.data)).finally(() => setLoading(false));
  };

  const handleFilter = () => {
    const params = {};
    if (studentFilter) params.student_id = studentFilter;
    if (driveFilter) params.drive_id = driveFilter;
    fetchLogs(params);
  };

  const downloadFile = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
  };

  const handleExportJSON = async () => {
    const r = await exportLogsJSON();
    downloadFile(new Blob([r.data], { type: 'application/json' }), 'audit_logs.json');
  };

  const handleExportCSV = async () => {
    const r = await exportLogsCSV();
    downloadFile(new Blob([r.data], { type: 'text/csv' }), 'audit_logs.csv');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title gradient-text">Governance Audit Trail</h1>
          <p className="text-[#64748b] text-sm mt-1">Immutable, timestamped decision log for every placement action</p>
        </div>
        <div className="flex gap-2">
          <button className="cyber-btn-secondary text-sm" onClick={handleExportJSON}>
            <Download size={14} /> Export JSON
          </button>
          <button className="cyber-btn-secondary text-sm" onClick={handleExportCSV}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="cyber-card mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter size={15} className="text-violet-400" />
          <input className="cyber-input flex-1 text-sm" placeholder="Filter by Student ID (e.g. STU_2024_0001)" value={studentFilter} onChange={e => setStudentFilter(e.target.value)} />
          <input className="cyber-input flex-1 text-sm" placeholder="Filter by Drive ID (e.g. DRIVE_TCS_2026)" value={driveFilter} onChange={e => setDriveFilter(e.target.value)} />
          <button className="cyber-btn-primary text-sm px-4 py-2" onClick={handleFilter}>Apply Filter</button>
          <button className="cyber-btn-secondary text-sm px-4 py-2" onClick={() => { setStudentFilter(''); setDriveFilter(''); fetchLogs(); }}>Reset</button>
        </div>
      </div>

      {loading && <div className="flex justify-center py-10"><Spinner size={32} /></div>}

      {!loading && (
        <div className="space-y-2">
          <p className="text-xs text-[#64748b] mb-3">{logs.length} log entries found</p>
          {logs.map(log => (
            <div key={log.id} className="cyber-card border border-[#1e1e4a] cursor-pointer hover:border-violet-800/50 transition-all" onClick={() => setExpanded(expanded === log.id ? null : log.id)}>
              <div className="flex items-center gap-3">
                <div className="shrink-0">{ACTION_ICONS[log.action] || <FileText size={14} className="text-[#64748b]" />}</div>
                <div className="flex-1 grid grid-cols-5 gap-3 text-sm items-center">
                  <span className="font-mono text-xs text-[#64748b]">{new Date(log.timestamp).toLocaleString()}</span>
                  <span className="text-violet-300 font-medium">{log.student_id}</span>
                  <span className="text-cyan-300 text-xs">{log.drive_id}</span>
                  <span className={`font-semibold text-xs ${
                    log.action === 'POLICY_REJECTED' ? 'text-red-400' :
                    log.action === 'SHORTLISTED' ? 'text-yellow-400' :
                    log.action === 'AI_SCORED' ? 'text-violet-400' : 'text-cyan-400'
                  }`}>{log.action}</span>
                  <div className="flex items-center gap-2">
                    {log.ai_score != null && <span className="badge-purple text-xs">CRS: {log.ai_score}</span>}
                    {log.final_decision && <StatusBadge status={log.final_decision.toLowerCase()} />}
                  </div>
                </div>
              </div>

              {expanded === log.id && (
                <div className="mt-3 pt-3 border-t border-[#1e1e4a]">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0a0a1a] rounded-lg p-3">
                      <p className="text-xs text-[#64748b] mb-2 font-semibold uppercase tracking-wider">Reasoning</p>
                      <p className="text-sm text-[#94a3b8]">{log.reasoning || 'N/A'}</p>
                    </div>
                    <div className="bg-[#0a0a1a] rounded-lg p-3">
                      <p className="text-xs text-[#64748b] mb-2 font-semibold uppercase tracking-wider">Details</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between"><span className="text-[#64748b]">Log ID:</span> <span className="text-white mono">{log.id.slice(0, 8)}...</span></div>
                        <div className="flex justify-between"><span className="text-[#64748b]">Policy Check:</span> <span className={log.policy_check === 'PASSED' ? 'text-emerald-400' : 'text-red-400'}>{log.policy_check || 'N/A'}</span></div>
                        <div className="flex justify-between"><span className="text-[#64748b]">AI Score:</span> <span className="text-violet-400">{log.ai_score != null ? `${log.ai_score}/100` : 'Not computed'}</span></div>
                        <div className="flex justify-between"><span className="text-[#64748b]">Actor:</span> <span className="text-white">{log.actor}</span></div>
                        {log.missing_skills?.length > 0 && (
                          <div><span className="text-[#64748b]">Missing skills: </span><span className="text-red-300">{log.missing_skills.join(', ')}</span></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-center py-16 text-[#64748b]">
              No audit logs found. Run the demo flow to generate logs.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
