import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import Landing from './pages/Landing';
import Layout from './components/Layout';

// Student
import StudentDashboard from './pages/student/Dashboard';
import ResumeUpload from './pages/student/ResumeUpload';
import BrowseDrives from './pages/student/BrowseDrives';
import StudentApplications from './pages/student/Applications';
import CareerRoadmap from './pages/student/CareerRoadmap';

// Recruiter
import RecruiterDashboard from './pages/recruiter/Dashboard';
import CreateDrive from './pages/recruiter/CreateDrive';
import RecruiterDrives from './pages/recruiter/Drives';
import ShortlistView from './pages/recruiter/Shortlist';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminDrives from './pages/admin/Drives';
import AuditLogs from './pages/admin/AuditLogs';
import AddStudent from './pages/admin/AddStudent';

const S = ({ children }) => <Layout role="student">{children}</Layout>;
const R = ({ children }) => <Layout role="recruiter">{children}</Layout>;
const A = ({ children }) => <Layout role="admin">{children}</Layout>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        {/* Student */}
        <Route path="/student" element={<S><StudentDashboard /></S>} />
        <Route path="/student/resume" element={<S><ResumeUpload /></S>} />
        <Route path="/student/drives" element={<S><BrowseDrives /></S>} />
        <Route path="/student/applications" element={<S><StudentApplications /></S>} />
        <Route path="/student/career" element={<S><CareerRoadmap /></S>} />

        {/* Recruiter */}
        <Route path="/recruiter" element={<R><RecruiterDashboard /></R>} />
        <Route path="/recruiter/create-drive" element={<R><CreateDrive /></R>} />
        <Route path="/recruiter/drives" element={<R><RecruiterDrives /></R>} />
        <Route path="/recruiter/shortlist" element={<R><ShortlistView /></R>} />

        {/* Admin */}
        <Route path="/admin" element={<A><AdminDashboard /></A>} />
        <Route path="/admin/students" element={<A><AdminStudents /></A>} />
        <Route path="/admin/add-student" element={<A><AddStudent /></A>} />
        <Route path="/admin/drives" element={<A><AdminDrives /></A>} />
        <Route path="/admin/analytics" element={<A><AdminDashboard /></A>} />
        <Route path="/admin/audit" element={<A><AuditLogs /></A>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
