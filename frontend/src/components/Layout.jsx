import React from 'react';
import Sidebar from './Sidebar';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Layout({ role, children }) {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  return (
    <div className="flex min-h-screen bg-[#0a0a1a]">
      <Sidebar role={role} />
      <main className="flex-1 ml-60">
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-[#0a0a1a]/95 backdrop-blur border-b border-[#1e1e4a] px-6 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm text-[#94a3b8]">
              {segments.map((seg, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <ChevronRight size={14} />}
                  <span className={i === segments.length - 1 ? 'text-white font-medium capitalize' : 'capitalize'}>
                    {seg.replace(/-/g, ' ')}
                  </span>
                </React.Fragment>
              ))}
            </div>
            <RoleSwitcher currentRole={role} />
          </div>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

function RoleSwitcher({ currentRole }) {
  const roles = [
    { id: 'student', label: 'Student', to: '/student' },
    { id: 'recruiter', label: 'Recruiter', to: '/recruiter' },
    { id: 'admin', label: 'Admin / TPO', to: '/admin' },
  ];
  return (
    <div className="flex items-center gap-1 bg-[#12122a] border border-[#1e1e4a] rounded-lg p-1">
      {roles.map((r) => (
        <Link key={r.id} to={r.to}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all duration-200 ${
            currentRole === r.id
              ? 'bg-violet-600 text-white'
              : 'text-[#94a3b8] hover:text-white'
          }`}>
          {r.label}
        </Link>
      ))}
    </div>
  );
}
