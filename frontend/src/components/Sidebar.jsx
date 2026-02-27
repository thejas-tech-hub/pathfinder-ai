import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Upload, FileSearch, TrendingUp, GraduationCap,
  Building2, Users, ClipboardList, BarChart3, FileText, UserPlus, Cpu
} from 'lucide-react';

const STUDENT_LINKS = [
  { to: '/student', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/student/resume', icon: Upload, label: 'Upload Resume' },
  { to: '/student/drives', icon: FileSearch, label: 'Browse Drives' },
  { to: '/student/applications', icon: ClipboardList, label: 'My Applications' },
  { to: '/student/career', icon: TrendingUp, label: 'Career Roadmap' },
];

const RECRUITER_LINKS = [
  { to: '/recruiter', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/recruiter/create-drive', icon: Building2, label: 'Post Drive' },
  { to: '/recruiter/drives', icon: FileSearch, label: 'My Drives' },
  { to: '/recruiter/shortlist', icon: Users, label: 'Shortlist' },
];

const ADMIN_LINKS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/students', icon: GraduationCap, label: 'Students' },
  { to: '/admin/add-student', icon: UserPlus, label: 'Add Student' },
  { to: '/admin/drives', icon: Building2, label: 'Drives' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/audit', icon: FileText, label: 'Audit Logs' },
];

function NavGroup({ title, links }) {
  const location = useLocation();
  return (
    <div className="mb-6">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#4a4a7a] mb-2 px-4">{title}</p>
      {links.map(({ to, icon: Icon, label, exact }) => {
        const active = exact
          ? location.pathname === to
          : location.pathname === to || location.pathname.startsWith(to + '/');
        return (
          <NavLink key={to} to={to} className={active ? 'nav-link-active' : 'nav-link'}>
            <Icon size={16} className={active ? 'text-violet-400' : ''} />
            {label}
          </NavLink>
        );
      })}
    </div>
  );
}

export default function Sidebar({ role }) {
  const links = role === 'student' ? STUDENT_LINKS : role === 'recruiter' ? RECRUITER_LINKS : ADMIN_LINKS;
  const titles = { student: 'Student Portal', recruiter: 'Recruiter Hub', admin: 'Admin / TPO' };

  return (
    <aside className="w-60 bg-[#0d0d20] border-r border-[#1e1e4a] flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="p-5 border-b border-[#1e1e4a]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-violet-600 rounded-lg">
            <Cpu size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm leading-none">PathFinder AI</h1>
            <p className="text-[10px] text-violet-400 mt-0.5">algoRhythmss</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <NavGroup title={titles[role]} links={links} />
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#1e1e4a]">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400 cyber-pulse" />
          <span className="text-xs text-emerald-400 font-medium">AI Engine Online</span>
        </div>
        <p className="text-[10px] text-[#4a4a7a]">Hackathon 2026 MVP</p>
      </div>
    </aside>
  );
}
