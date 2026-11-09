const API_BASE = (typeof window !== 'undefined' && window.__KOMS_API_BASE__) ? window.__KOMS_API_BASE__ : '/api';

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('koms_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const masterId = localStorage.getItem('koms_master_id');
  if (masterId) {
    headers['x-master-id'] = masterId;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {})
    }
  };

  const res = await fetch(url, config);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
  }
  return data;
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  getMe: () => request('/auth/me'),
  getMasters: () => request('/auth/masters'),
  switchMaster: (masterId) => request('/auth/switch', {
    method: 'POST',
    body: JSON.stringify({ masterId })
  }),

  // Schedule
  getActiveSchedule: () => request('/schedule/active'),
  getScheduleHistory: () => request('/schedule/history'),
  updateSchedule: (data) => request('/schedule', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  generateRange: (start_date, end_date) => request('/schedule/generate-range', {
    method: 'POST',
    body: JSON.stringify({ start_date, end_date })
  }),

  // Sessions
  getSessions: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/sessions${q ? `?${q}` : ''}`);
  },
  getUpcomingSessions: () => request('/sessions/upcoming'),
  getTodaySessions: () => request('/sessions/today'),
  getSession: (id) => request(`/sessions/${id}`),
  createAdHocSession: (data) => request('/sessions/create-ad-hoc', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  cancelSession: (id) => request(`/sessions/${id}/cancel`, { method: 'POST' }),
  uncancelSession: (id) => request(`/sessions/${id}/uncancel`, { method: 'POST' }),

  // Attendance
  getSessionAttendance: (sessionId, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/attendance/session/${sessionId}${q ? `?${q}` : ''}`);
  },
  saveAttendance: (sessionId, records, reason) => request('/attendance/save', {
    method: 'POST',
    body: JSON.stringify({ class_session_id: sessionId, records, reason })
  }),
  editAttendanceAudit: (attendance_record_id, new_status, reason) => request('/attendance/edit-audit', {
    method: 'POST',
    body: JSON.stringify({ attendance_record_id, new_status, reason })
  }),
  getAuditLogs: () => request('/attendance/audit-logs'),

  // Monthly Register Sheet (Month-Wise & Date of Month)
  getMonthlyRegister: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/attendance/monthly-register${q ? `?${q}` : ''}`);
  },
  saveMonthlyRegister: (updates) => request('/attendance/monthly-register/save', {
    method: 'POST',
    body: JSON.stringify({ updates })
  }),
  recordSingleAttendance: (class_session_id, student_id, status) => request('/attendance/record-single', {
    method: 'POST',
    body: JSON.stringify({ class_session_id, student_id, status })
  }),

  // Students & Previous Student Records
  getStudents: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/students${q ? `?${q}` : ''}`);
  },
  getStudent: (id) => request(`/students/${id}`),
  getNextStudentCode: () => request('/students/next-code'),
  createStudent: (data) => request('/students', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateStudent: (id, data) => request(`/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  pauseStudent: (id, data = {}) => request(`/students/${id}/pause`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  resumeStudent: (id) => request(`/students/${id}/resume`, {
    method: 'POST'
  }),
  getStudentAttendanceHistory: (studentId, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/students/${studentId}/attendance-history${q ? `?${q}` : ''}`);
  },

  // Reports
  getMonthlyReport: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/reports/monthly${q ? `?${q}` : ''}`);
  },
  getExportCsvUrl: (year, month) => `/api/reports/export-csv?year=${year}&month=${month}`,

  // Dashboard
  getDashboardStats: () => request('/dashboard/stats'),

  // Master Specific Hierarchy & Schedule APIs (Part 10)
  master: {
    getWeeklySchedule: () => request('/master/schedule/weekly'),
    updateWeeklySchedule: (data) => request('/master/schedule/weekly', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getScheduleSessions: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/master/schedule/sessions${q ? `?${q}` : ''}`);
    },
    getAttendanceSessions: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/master/attendance/sessions${q ? `?${q}` : ''}`);
    },
    getSession: (id) => request(`/master/attendance/sessions/${id}`),
    getSessionStudents: (id) => request(`/master/attendance/sessions/${id}/students`),
    saveSessionAttendance: (id, records, reason) => request(`/master/attendance/sessions/${id}/save`, {
      method: 'POST',
      body: JSON.stringify({ records, reason })
    }),
    updateAttendanceRecord: (id, status, reason) => request(`/master/attendance/records/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ attendance_status: status, reason })
    }),
    getRecordAudit: (id) => request(`/master/attendance/records/${id}/audit`),
    getHistoryYears: () => request('/master/attendance/history/years'),
    getHistoryMonths: (year) => request(`/master/attendance/history/months?year=${year}`),
    getHistorySessions: (year, month) => request(`/master/attendance/history/sessions?year=${year}&month=${month}`),
    getSessionSummary: (id) => request(`/master/attendance/history/sessions/${id}/summary`),
    getSessionStudentsHistory: (id) => request(`/master/attendance/history/sessions/${id}/students`),
    getStudentAttendanceHistory: (studentId, params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/master/students/${studentId}/attendance-history${q ? `?${q}` : ''}`);
    }
  }
};
