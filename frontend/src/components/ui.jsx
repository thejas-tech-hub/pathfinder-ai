import React from 'react';
import { AlertCircle, CheckCircle2, XCircle, Info, Loader2 } from 'lucide-react';

// ── CRS Score Ring ─────────────────────────────────────────────────────────
export function CrsRing({ score, size = 100 }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#1e1e4a" strokeWidth="8" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth="8" fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-xl font-bold text-white">{score}</span>
        <p className="text-[10px] text-[#94a3b8] -mt-0.5">CRS</p>
      </div>
    </div>
  );
}

// ── Score Bar ──────────────────────────────────────────────────────────────
export function ScoreBar({ label, value, max = 100, color = 'violet' }) {
  const colors = {
    violet: 'bg-violet-500',
    cyan: 'bg-cyan-500',
    emerald: 'bg-emerald-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-xs text-[#94a3b8]">{label}</span>
        <span className="text-xs font-semibold text-white">{value.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 bg-[#1e1e4a] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${colors[color]}`}
          style={{ width: `${pct}%`, transition: 'width 0.8s ease' }}
        />
      </div>
    </div>
  );
}

// ── Status Badge ───────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    eligible: { cls: 'badge-green', label: 'Eligible' },
    shortlisted: { cls: 'badge-cyan', label: 'Shortlisted' },
    rejected: { cls: 'badge-red', label: 'Rejected' },
    pending: { cls: 'badge-yellow', label: 'Pending' },
    active: { cls: 'badge-green', label: 'Active' },
    closed: { cls: 'badge-red', label: 'Closed' },
    completed: { cls: 'badge-purple', label: 'Completed' },
  };
  const entry = map[status?.toLowerCase()] || { cls: 'badge-yellow', label: status };
  return <span className={entry.cls}>{entry.label}</span>;
}

// ── Alert ──────────────────────────────────────────────────────────────────
export function Alert({ type = 'info', message }) {
  const config = {
    info: { Icon: Info, cls: 'bg-blue-900/30 border-blue-700/50 text-blue-300' },
    success: { Icon: CheckCircle2, cls: 'bg-emerald-900/30 border-emerald-700/50 text-emerald-300' },
    error: { Icon: XCircle, cls: 'bg-red-900/30 border-red-700/50 text-red-300' },
    warning: { Icon: AlertCircle, cls: 'bg-yellow-900/30 border-yellow-700/50 text-yellow-300' },
  };
  const { Icon, cls } = config[type];
  return (
    <div className={`flex items-center gap-2.5 p-3.5 rounded-lg border text-sm ${cls}`}>
      <Icon size={16} className="shrink-0" />
      <span>{message}</span>
    </div>
  );
}

// ── Loading Spinner ────────────────────────────────────────────────────────
export function Spinner({ size = 20 }) {
  return <Loader2 size={size} className="loading-spin text-violet-400" />;
}

// ── Empty State ────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-full bg-[#1e1e4a] mb-4">
        <Icon size={32} className="text-[#4a4a7a]" />
      </div>
      <p className="text-white font-semibold mb-1">{title}</p>
      <p className="text-[#94a3b8] text-sm">{subtitle}</p>
    </div>
  );
}

// ── Policy Check Row ───────────────────────────────────────────────────────
export function PolicyCheckRow({ check }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-[#1e1e4a] last:border-0">
      <div className="mt-0.5">
        {check.passed
          ? <CheckCircle2 size={15} className="text-emerald-400" />
          : <XCircle size={15} className="text-red-400" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">{check.rule}</span>
          <span className={`text-xs font-semibold ${check.passed ? 'text-emerald-400' : 'text-red-400'}`}>
            {check.passed ? 'PASS' : 'FAIL'}
          </span>
        </div>
        <p className="text-xs text-[#94a3b8] mt-0.5">{check.detail}</p>
      </div>
    </div>
  );
}

// ── Metric Card ────────────────────────────────────────────────────────────
export function MetricCard({ label, value, icon: Icon, color = 'violet', sub }) {
  const colors = {
    violet: 'text-violet-400 bg-violet-900/30',
    cyan: 'text-cyan-400 bg-cyan-900/30',
    emerald: 'text-emerald-400 bg-emerald-900/30',
    yellow: 'text-yellow-400 bg-yellow-900/30',
    red: 'text-red-400 bg-red-900/30',
  };
  return (
    <div className="cyber-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#94a3b8] text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {sub && <p className="text-xs text-[#64748b] mt-1">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${colors[color]}`}>
          <Icon size={20} className={colors[color].split(' ')[0]} />
        </div>
      </div>
    </div>
  );
}
