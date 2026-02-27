import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, GraduationCap, Building2, Users, Shield, Brain, FileText, ArrowRight, Zap } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] flex flex-col">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center flex-1 py-20 px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-900/40 border border-violet-700/50 text-violet-300 text-xs font-semibold mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400 cyber-pulse" />
          algoRhythmss · Hackathon 2026
        </div>

        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="p-3 bg-violet-600 rounded-2xl">
            <Cpu size={32} className="text-white" />
          </div>
          <h1 className="text-6xl font-black">
            <span className="gradient-text">PathFinder</span>
            <span className="text-white"> AI</span>
          </h1>
        </div>

        <p className="text-xl text-[#94a3b8] max-w-2xl mb-3">
          Trust-First Intelligent Campus Placement ERP
        </p>
        <p className="text-[#64748b] max-w-xl mb-10">
          Deterministic rule filtering + Local AI semantic matching + Explainable audit logs.
          Built for colleges, recruiters, and students.
        </p>

        {/* Role Cards */}
        <div className="grid grid-cols-3 gap-5 max-w-3xl w-full mb-10">
          <Link to="/student" className="cyber-card hover:border-violet-600 transition-all group p-6 text-center">
            <div className="p-3 bg-violet-900/40 rounded-xl inline-flex mb-3 group-hover:bg-violet-900/60 transition-all">
              <GraduationCap size={24} className="text-violet-400" />
            </div>
            <h3 className="font-bold text-white mb-1">Student Portal</h3>
            <p className="text-xs text-[#64748b] mb-4">Upload resume, track eligibility, get CRS score</p>
            <span className="text-violet-400 text-sm font-semibold flex items-center justify-center gap-1">
              Enter <ArrowRight size={14} />
            </span>
          </Link>

          <Link to="/recruiter" className="cyber-card hover:border-cyan-600 transition-all group p-6 text-center">
            <div className="p-3 bg-cyan-900/40 rounded-xl inline-flex mb-3 group-hover:bg-cyan-900/60 transition-all">
              <Building2 size={24} className="text-cyan-400" />
            </div>
            <h3 className="font-bold text-white mb-1">Recruiter Hub</h3>
            <p className="text-xs text-[#64748b] mb-4">Post drives, get AI-ranked candidate lists</p>
            <span className="text-cyan-400 text-sm font-semibold flex items-center justify-center gap-1">
              Enter <ArrowRight size={14} />
            </span>
          </Link>

          <Link to="/admin" className="cyber-card hover:border-emerald-600 transition-all group p-6 text-center">
            <div className="p-3 bg-emerald-900/40 rounded-xl inline-flex mb-3 group-hover:bg-emerald-900/60 transition-all">
              <Users size={24} className="text-emerald-400" />
            </div>
            <h3 className="font-bold text-white mb-1">Admin / TPO</h3>
            <p className="text-xs text-[#64748b] mb-4">Analytics, audit logs, drive management</p>
            <span className="text-emerald-400 text-sm font-semibold flex items-center justify-center gap-1">
              Enter <ArrowRight size={14} />
            </span>
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 max-w-3xl w-full text-left">
          {[
            { icon: Shield, color: 'text-violet-400', title: 'Policy Gateway', desc: 'Hard rules run first. CGPA, backlogs, branch — zero bias, 100% deterministic.' },
            { icon: Brain, color: 'text-cyan-400', title: 'AI Semantic Matcher', desc: 'Local NLP with all-MiniLM-L6-v2. No external APIs. Zero data leakage.' },
            { icon: FileText, color: 'text-emerald-400', title: 'Audit Trail', desc: 'Every decision logged with timestamp, reasoning, and exportable evidence.' },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="p-4 rounded-xl bg-[#12122a] border border-[#1e1e4a]">
              <Icon size={20} className={`${color} mb-2`} />
              <h4 className="font-semibold text-white text-sm mb-1">{title}</h4>
              <p className="text-xs text-[#64748b]">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CRS Formula */}
      <div className="border-t border-[#1e1e4a] py-6 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-violet-400" />
              <span className="text-[#94a3b8]">CRS = <span className="text-violet-400">Semantic Match (50%)</span> + <span className="text-cyan-400">Project Relevance (30%)</span> + <span className="text-emerald-400">Completeness (20%)</span></span>
            </div>
          </div>
          <p className="text-xs text-[#4a4a7a]">Thejas · Raghavendra · Abhishek · Abhijith</p>
        </div>
      </div>
    </div>
  );
}
