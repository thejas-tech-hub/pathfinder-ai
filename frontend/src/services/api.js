import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 30000,
});

// Students
export const getStudents = () => API.get('/students');
export const getStudent = (id) => API.get(`/students/${id}`);
export const createStudent = (data) => API.post('/students', data);
export const uploadResume = (formData) => API.post('/upload-resume', formData);
export const getEligibility = (studentId) => API.get(`/eligibility/${studentId}`);
export const getStudentApplications = (studentId) => API.get(`/applications/${studentId}`);

// Drives
export const getDrives = () => API.get('/drives');
export const getDrive = (id) => API.get(`/drives/${id}`);
export const createDrive = (data) => API.post('/create-drive', data);
export const updateDriveStatus = (id, status) => API.put(`/drives/${id}/status?status=${status}`);

// Applications
export const applyToDrive = (studentId, driveId) =>
  API.post('/apply', { student_id: studentId, drive_id: driveId });
export const getShortlist = (driveId) => API.get(`/shortlist/${driveId}`);
export const approveShortlist = (studentId, driveId, approvedBy = 'TPO') =>
  API.post('/shortlist/approve', { student_id: studentId, drive_id: driveId, approved_by: approvedBy });

// Audit
export const getAuditLogs = (params = {}) => API.get('/audit-logs', { params });
export const exportLogsJSON = (params = {}) => API.get('/audit-logs/export/json', { params, responseType: 'blob' });
export const exportLogsCSV = (params = {}) => API.get('/audit-logs/export/csv', { params, responseType: 'blob' });

// Analytics
export const getAnalytics = () => API.get('/analytics/overview');
export const getDriveAnalytics = (driveId) => API.get(`/analytics/drive/${driveId}`);

export default API;
