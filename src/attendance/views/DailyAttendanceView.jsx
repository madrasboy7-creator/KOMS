import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { 
  UserCheck, 
  Search, 
  Check, 
  X, 
  Clock, 
  Calendar, 
  Save, 
  CheckCheck, 
  RotateCcw, 
  AlertCircle, 
  ShieldCheck, 
  ChevronRight,
  FileEdit,
  History
} from 'lucide-react';

export function DailyAttendanceView({ preselectedSessionId }) {
  const { currentMaster, addToast } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(preselectedSessionId || null);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [roster, setRoster] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Edit Reason Modal State (for Section 10 finalized attendance corrections)
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditTarget, setAuditTarget] = useState(null);
  const [auditReason, setAuditReason] = useState('');

  // Initial load of sessions
  const loadAvailableSessions = async () => {
    try {
      setLoading(true);
      const res = await api.getSessions().catch(() => ({ sessions: [] }));
      const sessList = res?.sessions || [];
      setSessions(sessList);

      if (!selectedSessionId && sessList.length > 0) {
        const todaySession = sessList.find((s) => s.is_today);
        const pendingSession = sessList.find((s) => s.status !== 'completed');
        const defaultChoice = todaySession || pendingSession || sessList[0];
        setSelectedSessionId(defaultChoice.id);
      }
    } catch (err) {
      addToast('Failed to load class sessions: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentMaster) {
      loadAvailableSessions();
    }
  }, [currentMaster]);

  useEffect(() => {
    if (preselectedSessionId) {
      setSelectedSessionId(preselectedSessionId);
    }
  }, [preselectedSessionId]);

  // Load roster when selectedSessionId changes
  const loadSessionRoster = async (sessionId) => {
    if (!sessionId) return;
    try {
      setLoading(true);
      const res = await api.getSessionAttendance(sessionId).catch(() => ({ session: null, roster: [] }));
      setSessionDetails(res?.session || null);
      setRoster(res?.roster || []);
    } catch (err) {
      addToast('Failed to load session roster: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSessionId) {
      loadSessionRoster(selectedSessionId);
    }
  }, [selectedSessionId]);

  // Bulk action: Mark All Students Present
  const handleMarkAllPresent = () => {
    setRoster((prev) => prev.map((s) => ({ ...s, attendance_status: 'PRESENT' })));
    addToast('Marked all active students as PRESENT. Click Save Attendance to commit.', 'info');
  };

  // Bulk action: Reset all to NOT MARKED
  const handleResetAll = () => {
    setRoster((prev) => prev.map((s) => ({ ...s, attendance_status: 'NOT MARKED' })));
    addToast('Reset roster attendance markers to Not Marked.', 'info');
  };

  // Mark Individual Attendance status
  const handleStatusChange = (studentId, newStatus) => {
    const student = roster.find((s) => s.id === studentId);
    if (!student) return;

    if (sessionDetails?.status === 'completed' && student.record_id && student.attendance_status !== newStatus) {
      setAuditTarget({
        studentId: student.id,
        studentRecordId: student.record_id,
        studentName: student.student_name,
        oldStatus: student.attendance_status,
        newStatus: newStatus,
      });
      setAuditReason('');
      setAuditModalOpen(true);
      return;
    }

    setRoster((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, attendance_status: newStatus } : s))
    );
  };

  // Confirm Finalized Attendance Edit with Reason
  const handleConfirmAuditEdit = async () => {
    if (!auditReason.trim()) {
      addToast('Please enter a reason for the attendance correction.', 'error');
      return;
    }

    try {
      setSaving(true);
      await api.editAttendanceAudit(auditTarget.studentRecordId, auditTarget.newStatus, auditReason.trim());
      addToast(`Attendance for ${auditTarget.studentName} updated to ${auditTarget.newStatus} with audit entry.`, 'success');
      setAuditModalOpen(false);
      await loadSessionRoster(selectedSessionId);
    } catch (err) {
      addToast('Failed to edit attendance: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Save Attendance to Database
  const handleSaveAttendance = async () => {
    if (!selectedSessionId) return;

    try {
      setSaving(true);
      const records = roster.map((s) => ({
        student_id: s.id,
        status: s.attendance_status,
      }));

      const res = await api.saveAttendance(selectedSessionId, records);
      const summary = res?.summary || {};
      addToast(
        `Attendance saved successfully! (${summary.present_count || presentCount} Present, ${summary.absent_count || absentCount} Absent, ${summary.leave_count || leaveCount} Leave)`,
        'success'
      );
      
      await Promise.all([loadAvailableSessions(), loadSessionRoster(selectedSessionId)]);
    } catch (err) {
      addToast('Failed to save attendance: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Compute live counts
  let presentCount = 0;
  let absentCount = 0;
  let leaveCount = 0;
  let unmarkedCount = 0;

  for (const s of roster) {
    if (s.attendance_status === 'PRESENT') presentCount++;
    else if (s.attendance_status === 'ABSENT') absentCount++;
    else if (s.attendance_status === 'LEAVE') leaveCount++;
    else unmarkedCount++;
  }

  // Filter roster
  const filteredRoster = roster.filter((student) => {
    const matchesSearch =
      student.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.student_code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || student.attendance_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* 1. TOP SESSION SELECTOR BAR */}
      <div className="p-4 md:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider mb-0.5">
            <UserCheck className="w-4 h-4" />
            <span>Class Session Attendance</span>
          </div>
          <h2 className="font-display text-lg md:text-xl font-bold text-slate-900">
            Daily Attendance Check-In
          </h2>
        </div>

        {/* Dropdown Selector for Available Scheduled Classes */}
        <div className="flex items-center gap-2.5">
          <label htmlFor="session-select" className="text-xs text-slate-500 font-bold whitespace-nowrap">
            Select Class:
          </label>
          <select
            id="session-select"
            value={selectedSessionId || ''}
            onChange={(e) => setSelectedSessionId(Number(e.target.value))}
            className="bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3.5 py-2 text-xs md:text-sm font-semibold focus:border-rose-500 outline-none cursor-pointer max-w-xs shadow-sm"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.class_date} ({s.weekday_name?.slice(0, 3)}) • {s.timing_display || `${s.start_time} - ${s.end_time}`} {s.status === 'completed' ? '✓ Finalized' : '● Open'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. SELECTED CLASS DETAILS BANNER */}
      {sessionDetails && (
        <div className="p-4 md:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
                Target Session
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                sessionDetails.status === 'completed' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {sessionDetails.status === 'completed' ? '✓ Attendance Finalized' : '● Attendance Open'}
              </span>
              {sessionDetails.status === 'completed' && (
                <span className="text-[11px] text-slate-600 flex items-center gap-1 font-semibold bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Audit Protected</span>
                </span>
              )}
            </div>
            <div className="text-lg md:text-xl font-bold text-slate-900 flex flex-wrap items-center gap-2.5">
              <span>{sessionDetails.class_date} ({sessionDetails.weekday_name})</span>
              <span className="text-xs text-rose-700 font-semibold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-600" />
                <span>{sessionDetails.start_time} – {sessionDetails.end_time}</span>
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-3">
            <div>
              <span className="text-slate-400">Dojo:</span>{' '}
              <span className="font-bold text-slate-800">Ranga Nagar</span>
            </div>
            <div className="h-3.5 w-px bg-slate-200" />
            <div>
              <span className="text-slate-400">Active Students:</span>{' '}
              <span className="font-bold text-slate-900">{roster.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. 5 LIVE SUMMARY COUNTERS */}
      {sessionDetails && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 md:gap-3">
          {/* Card 1: Total Students */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Students
            </span>
            <span className="text-2xl font-black text-slate-900 mt-0.5">
              {roster.length}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">Enrolled active</span>
          </div>

          {/* Card 2: Present */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Present
            </span>
            <span className="text-2xl font-black text-emerald-600 mt-0.5">
              {presentCount}
            </span>
            <span className="text-[10px] text-emerald-600/80 mt-0.5">In class</span>
          </div>

          {/* Card 3: Absent */}
          <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
              Absent
            </span>
            <span className="text-2xl font-black text-rose-600 mt-0.5">
              {absentCount}
            </span>
            <span className="text-[10px] text-rose-600/80 mt-0.5">Unexcused</span>
          </div>

          {/* Card 4: Approved Leave */}
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
              Approved Leave
            </span>
            <span className="text-2xl font-black text-amber-600 mt-0.5">
              {leaveCount}
            </span>
            <span className="text-[10px] text-amber-600/80 mt-0.5">Sanctioned</span>
          </div>

          {/* Card 5: Not Marked */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Not Marked
            </span>
            <span className={`text-2xl font-black mt-0.5 ${unmarkedCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
              {unmarkedCount}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {unmarkedCount > 0 ? 'Action required' : 'All marked'}
            </span>
          </div>
        </div>
      )}

      {/* 4. ROSTER CONTROLS: SEARCH, FILTERS, BULK ACTIONS & SAVE */}
      <div className="p-3.5 md:p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[260px]">
          {/* Student Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:border-rose-500 outline-none"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs overflow-x-auto">
            {['ALL', 'PRESENT', 'ABSENT', 'LEAVE', 'NOT MARKED'].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  statusFilter === f 
                    ? 'bg-white text-rose-700 shadow-xs border border-slate-200' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Action Buttons & Save */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllPresent}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Mark all active students as Present"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All Present</span>
          </button>

          <button
            onClick={handleResetAll}
            className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all cursor-pointer shadow-2xs"
            title="Reset All Markers"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleSaveAttendance}
            disabled={saving}
            className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Attendance'}</span>
          </button>
        </div>
      </div>

      {/* 5. STUDENT ROSTER TABLE (DESKTOP) & TOUCH CARDS (MOBILE) */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-5">Student ID</th>
                <th className="py-3 px-5">Student Name</th>
                <th className="py-3 px-5">Belt Rank</th>
                <th className="py-3 px-5 text-center">Attendance Status Control</th>
                <th className="py-3 px-5 text-right">Status Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRoster.length > 0 ? (
                filteredRoster.map((student) => {
                  const status = student.attendance_status;

                  return (
                    <tr 
                      key={student.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3 px-5 font-mono font-bold text-rose-600">
                        {student.student_code}
                      </td>

                      <td className="py-3 px-5 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{student.student_name}</span>
                          {student.record_id && (
                            <span className="text-[10px] text-slate-400 font-normal">
                              (Record #{student.record_id})
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-5 text-slate-600">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">
                          {student.rank}
                        </span>
                      </td>

                      {/* Individual Attendance 4-State Buttons */}
                      <td className="py-3 px-5">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* PRESENT Button */}
                          <button
                            onClick={() => handleStatusChange(student.id, 'PRESENT')}
                            className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                              status === 'PRESENT'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            <span>Present</span>
                          </button>

                          {/* ABSENT Button */}
                          <button
                            onClick={() => handleStatusChange(student.id, 'ABSENT')}
                            className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                              status === 'ABSENT'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:text-rose-700 hover:bg-rose-50'
                            }`}
                          >
                            <X className="w-3 h-3" />
                            <span>Absent</span>
                          </button>

                          {/* LEAVE Button */}
                          <button
                            onClick={() => handleStatusChange(student.id, 'LEAVE')}
                            className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                              status === 'LEAVE'
                                ? 'bg-amber-500 text-slate-950 shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>Leave</span>
                          </button>

                          {/* UNMARKED Button */}
                          <button
                            onClick={() => handleStatusChange(student.id, 'NOT MARKED')}
                            className={`px-2.5 py-1 rounded-lg font-medium text-[11px] transition-all cursor-pointer ${
                              status === 'NOT MARKED'
                                ? 'bg-slate-200 text-slate-800 font-semibold'
                                : 'bg-slate-100 text-slate-400 hover:text-slate-600'
                            }`}
                            title="Unmark student"
                          >
                            Unmarked
                          </button>
                        </div>
                      </td>

                      {/* Status Indicator Badge */}
                      <td className="py-3 px-5 text-right">
                        {status === 'PRESENT' && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Present
                          </span>
                        )}
                        {status === 'ABSENT' && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Absent
                          </span>
                        )}
                        {status === 'LEAVE' && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Leave
                          </span>
                        )}
                        {status === 'NOT MARKED' && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                            Not Marked
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                    No students matched the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Touch Cards View (Responsive & Natural on Phones) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredRoster.length > 0 ? (
            filteredRoster.map((student) => {
              const status = student.attendance_status;
              return (
                <div key={student.id} className="p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <span>{student.student_name}</span>
                        <span className="font-mono text-xs text-rose-600 font-bold">
                          {student.student_code}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px]">
                          {student.rank}
                        </span>
                      </div>
                    </div>

                    <div>
                      {status === 'PRESENT' && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Present
                        </span>
                      )}
                      {status === 'ABSENT' && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Absent
                        </span>
                      )}
                      {status === 'LEAVE' && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Leave
                        </span>
                      )}
                      {status === 'NOT MARKED' && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                          Not Marked
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4 Quick Tap Buttons for Mobile */}
                  <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                    <button
                      onClick={() => handleStatusChange(student.id, 'PRESENT')}
                      className={`py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        status === 'PRESENT'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 active:bg-slate-200'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Present</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.id, 'ABSENT')}
                      className={`py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        status === 'ABSENT'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 active:bg-slate-200'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Absent</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.id, 'LEAVE')}
                      className={`py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        status === 'LEAVE'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-slate-100 text-slate-600 active:bg-slate-200'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Leave</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.id, 'NOT MARKED')}
                      className={`py-2 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                        status === 'NOT MARKED'
                          ? 'bg-slate-200 text-slate-800 font-semibold'
                          : 'bg-slate-100 text-slate-400 active:bg-slate-200'
                      }`}
                    >
                      <span>Unmark</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-xs text-slate-400">
              No students matched the current filter.
            </div>
          )}
        </div>
      </div>

      {/* Audit Log Modal for Finalized Attendance Corrections */}
      <Modal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
        title="Attendance Correction Audit Reason"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <strong className="font-semibold">Audit Compliance:</strong> You are modifying finalized attendance for <strong className="text-slate-900">{auditTarget?.studentName}</strong> from <span className="font-bold underline">{auditTarget?.oldStatus}</span> to <span className="font-bold underline">{auditTarget?.newStatus}</span>. A reason is required for the permanent audit trail.
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              Correction Reason (Required):
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Student arrived late with master permission; Medical certificate verified; Correction of clerical entry."
              value={auditReason}
              onChange={(e) => setAuditReason(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-rose-500 outline-none resize-none text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              onClick={() => setAuditModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmAuditEdit}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>{saving ? 'Updating...' : 'Save Correction'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
