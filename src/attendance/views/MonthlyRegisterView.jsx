import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StudentModal } from '../components/StudentModal';
import { PastClassModal } from '../components/PastClassModal';
import { PauseStudentModal } from '../components/PauseStudentModal';
import { 
  Table, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  UserPlus, 
  CalendarPlus, 
  Check, 
  X, 
  Clock, 
  Sparkles,
  Info,
  HelpCircle,
  TrendingUp,
  RotateCcw,
  CheckCheck,
  PauseCircle,
  PlayCircle
} from 'lucide-react';

export function MonthlyRegisterView() {
  const { currentMaster, addToast } = useAuth();

  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(11); // November
  const [statusFilter, setStatusFilter] = useState('active'); // default to 'active' which automatically hides paused students next month!
  
  const [registerData, setRegisterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Local modifications state: Map of `${sessionId}_${studentId}` -> status
  const [pendingChanges, setPendingChanges] = useState({});

  // Modals
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [pastClassModalOpen, setPastClassModalOpen] = useState(false);

  // Pause modal
  const [pauseModalOpen, setPauseModalOpen] = useState(false);
  const [studentToPause, setStudentToPause] = useState(null);

  const handleResumeStudent = async (studentId, studentName) => {
    try {
      await api.resumeStudent(studentId);
      addToast(`Attendance for ${studentName} has been resumed to Active.`, 'success');
      loadMonthlyRegister();
    } catch (err) {
      addToast('Failed to resume student: ' + err.message, 'error');
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const loadMonthlyRegister = async () => {
    try {
      setLoading(true);
      const res = await api.getMonthlyRegister({
        year,
        month,
        status: statusFilter
      });
      setRegisterData(res);
      setPendingChanges({});
    } catch (err) {
      addToast('Failed to load monthly register: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentMaster) {
      loadMonthlyRegister();
    }
  }, [currentMaster, year, month, statusFilter]);

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(prev => prev - 1);
    } else {
      setMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(prev => prev + 1);
    } else {
      setMonth(prev => prev + 1);
    }
  };

  // Cell status toggle: NOT MARKED -> PRESENT -> ABSENT -> LEAVE -> NOT MARKED
  const handleToggleCell = (sessionId, studentId, currentStatus) => {
    const key = `${sessionId}_${studentId}`;
    const effectiveStatus = pendingChanges[key] !== undefined ? pendingChanges[key] : currentStatus;

    let nextStatus = 'PRESENT';
    if (effectiveStatus === 'PRESENT') nextStatus = 'ABSENT';
    else if (effectiveStatus === 'ABSENT') nextStatus = 'LEAVE';
    else if (effectiveStatus === 'LEAVE') nextStatus = 'NOT MARKED';
    else nextStatus = 'PRESENT';

    setPendingChanges(prev => ({
      ...prev,
      [key]: nextStatus
    }));
  };

  // Bulk action: Mark entire column (all students on a date) as PRESENT
  const handleMarkDateAllPresent = (sessionId) => {
    if (!registerData?.register) return;
    const newChanges = { ...pendingChanges };
    for (const st of registerData.register) {
      newChanges[`${sessionId}_${st.student_id}`] = 'PRESENT';
    }
    setPendingChanges(newChanges);
    addToast('Marked all students as PRESENT for this date. Click "Save Month Register" to commit.', 'info');
  };

  // Bulk action: Mark entire row (all dates for a student) as PRESENT
  const handleMarkStudentAllPresent = (studentId) => {
    if (!registerData?.sessions) return;
    const newChanges = { ...pendingChanges };
    for (const sess of registerData.sessions) {
      newChanges[`${sess.id}_${studentId}`] = 'PRESENT';
    }
    setPendingChanges(newChanges);
    addToast('Marked all dates as PRESENT for this student.', 'info');
  };

  // Save all pending changes to the database
  const handleSaveAll = async () => {
    const keys = Object.keys(pendingChanges);
    if (keys.length === 0) {
      addToast('No changes to save.', 'info');
      return;
    }

    const updates = keys.map(k => {
      const [class_session_id, student_id] = k.split('_').map(Number);
      return {
        class_session_id,
        student_id,
        status: pendingChanges[k]
      };
    });

    try {
      setSaving(true);
      await api.saveMonthlyRegister(updates);
      addToast(`Successfully saved ${updates.length} attendance records for ${monthNames[month - 1]} ${year}.`, 'success');
      await loadMonthlyRegister();
    } catch (err) {
      addToast('Failed to save register: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const sessions = registerData?.sessions || [];
  const students = registerData?.register || [];
  const totalScheduledClasses = registerData?.total_scheduled_classes || sessions.length;
  const hasChanges = Object.keys(pendingChanges).length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Month Navigation */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
            <Table className="w-4 h-4" />
            <span>Monthly Attendance Sheet</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-3">
            <span>{monthNames[month - 1]} {year} Register</span>
            {hasChanges && (
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
                Unsaved Edits ({Object.keys(pendingChanges).length})
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Maintain attendance month-wise and date-of-the-month. Percentages are calculated as per the weekly class schedule.
          </p>
        </div>

        {/* Month Navigation & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-200">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-800 px-3 min-w-[110px] text-center">
              {monthNames[month - 1]?.slice(0, 3)} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setStudentModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-300 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-rose-600" />
            <span>+ Enter Student</span>
          </button>

          <button
            onClick={() => setPastClassModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-300 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-rose-600" />
            <span>+ Add Past Class</span>
          </button>

          <button
            onClick={handleSaveAll}
            disabled={saving || !hasChanges}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-sm ${
              hasChanges 
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Register'}</span>
          </button>
        </div>
      </div>

      {/* Easy to Understand Calculation Explanation Card */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-900 font-bold">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Schedule Calculation Rule for {monthNames[month - 1]} {year}</span>
          </div>
          <p className="text-slate-700">
            Total Scheduled Classes in Month: <strong className="text-slate-900 font-mono text-sm">{totalScheduledClasses} Classes</strong> (as per weekly Dojo schedule).
          </p>
          <p className="text-slate-600 text-[11px]">
            <strong className="text-amber-800">Formula:</strong> <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-200 text-slate-800">(Attended Classes ÷ {totalScheduledClasses} Total Scheduled Classes) × 100</span>
          </p>
        </div>

        {/* Quick Example Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-white border border-amber-200/90 text-[11px] font-mono shadow-xs">
            <span className="text-slate-500">4 Classes Attended = </span>
            <strong className="text-amber-700">{totalScheduledClasses > 0 ? ((4 / totalScheduledClasses) * 100).toFixed(1) : 0}%</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white border border-amber-200/90 text-[11px] font-mono shadow-xs">
            <span className="text-slate-500">6 Classes Attended = </span>
            <strong className="text-emerald-700">{totalScheduledClasses > 0 ? ((6 / totalScheduledClasses) * 100).toFixed(1) : 0}%</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white border border-amber-200/90 text-[11px] font-mono shadow-xs">
            <span className="text-slate-500">All {totalScheduledClasses} Classes = </span>
            <strong className="text-emerald-700">100%</strong>
          </div>
        </div>
      </div>

      {/* Roster Filter & Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-medium">Show Students:</span>
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs shadow-xs">
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-2.5 py-0.5 rounded font-medium transition-colors ${statusFilter === 'active' ? 'bg-rose-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              title="Shows active students and auto-removes discontinued students from next month"
            >
              Active Roster ({students.length})
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-0.5 rounded font-medium transition-colors ${statusFilter === 'all' ? 'bg-rose-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('paused')}
              className={`px-2.5 py-0.5 rounded font-medium transition-colors ${statusFilter === 'paused' ? 'bg-rose-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Paused / Discontinued
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-2.5 py-0.5 rounded font-medium transition-colors ${statusFilter === 'inactive' ? 'bg-rose-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Previous Students
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-600">
          <span className="font-medium">Toggle:</span>
          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
            P = Present
          </span>
          <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
            A = Absent
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200">
            L = Leave
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-bold border border-slate-200">
            - = Unmarked
          </span>
        </div>
      </div>

      {/* Main Monthly Attendance Matrix Table */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto max-h-[650px] relative">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold sticky top-0 z-20">
              <tr>
                {/* Fixed Student Info Column */}
                <th className="py-3 px-4 sticky left-0 bg-slate-50 z-30 min-w-[200px] border-r border-slate-200">
                  Student Name & Code
                </th>

                {/* Date Columns for each scheduled class session */}
                {sessions.map(sess => (
                  <th 
                    key={sess.id}
                    className="py-2.5 px-2 text-center min-w-[64px] border-r border-slate-200 hover:bg-slate-100 transition-colors group cursor-pointer"
                    title={`Click to mark all students Present on ${sess.class_date}`}
                    onClick={() => handleMarkDateAllPresent(sess.id)}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 leading-tight">
                        {sess.short_weekday}
                      </span>
                      <span className="text-xs font-mono font-black text-slate-900">
                        {sess.day_of_month}
                      </span>
                      <span className="text-[9px] text-slate-400 group-hover:text-rose-600 transition-colors mt-0.5">
                        Mark All
                      </span>
                    </div>
                  </th>
                ))}

                {/* Summary Columns */}
                <th className="py-3 px-3 text-center min-w-[80px] bg-slate-100/80 font-bold text-emerald-700 border-l border-slate-200">
                  Attended
                </th>
                <th className="py-3 px-3 text-center min-w-[65px] bg-slate-100/80 text-rose-700 font-bold">
                  Absent
                </th>
                <th className="py-3 px-3 text-center min-w-[65px] bg-slate-100/80 text-amber-700 font-bold">
                  Leave
                </th>
                <th className="py-3 px-4 text-center min-w-[120px] bg-slate-100/80 font-black text-slate-900 border-l border-slate-200">
                  Monthly %
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-sans">
              {students.map((st, rowIdx) => {
                // Calculate live counters considering pendingChanges
                let liveAttended = 0;
                let liveAbsent = 0;
                let liveLeave = 0;
                let liveUnmarked = 0;

                for (const sess of sessions) {
                  const key = `${sess.id}_${st.student_id}`;
                  const currentStatus = pendingChanges[key] !== undefined ? pendingChanges[key] : (st.dates[sess.id] || 'NOT MARKED');
                  if (currentStatus === 'PRESENT') liveAttended++;
                  else if (currentStatus === 'ABSENT') liveAbsent++;
                  else if (currentStatus === 'LEAVE') liveLeave++;
                  else liveUnmarked++;
                }

                const livePercentage = totalScheduledClasses > 0
                  ? Math.round((liveAttended / totalScheduledClasses) * 1000) / 10
                  : 0;

                return (
                  <tr 
                    key={st.student_id} 
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Sticky Student Column */}
                    <td className="py-3 px-4 sticky left-0 bg-white group-hover:bg-slate-50 transition-colors z-10 border-r border-slate-200">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-slate-900">
                              {st.student_name}
                            </span>
                            {st.status === 'paused' && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold" title={`Paused: ${st.paused_reason || 'Discontinued'}`}>
                                Paused
                              </span>
                            )}
                            {st.status === 'inactive' && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                                Previous
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {st.student_code} • {st.rank?.split(' ')[0]}
                          </div>
                        </div>

                        {/* Row Quick Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {st.status === 'paused' ? (
                            <button
                              type="button"
                              onClick={() => handleResumeStudent(st.student_id, st.student_name)}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-semibold transition-colors"
                              title="Resume student attendance"
                            >
                              Resume
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setStudentToPause({ id: st.student_id, student_name: st.student_name, student_code: st.student_code });
                                setPauseModalOpen(true);
                              }}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-slate-950 font-semibold transition-colors"
                              title="Pause attendance (discontinue class)"
                            >
                              Pause
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleMarkStudentAllPresent(st.student_id)}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 font-mono transition-colors"
                            title="Mark all dates Present for this student"
                          >
                            All P
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Interactive Cells for each date */}
                    {sessions.map(sess => {
                      const key = `${sess.id}_${st.student_id}`;
                      const isDirty = pendingChanges[key] !== undefined;
                      const status = isDirty ? pendingChanges[key] : (st.dates[sess.id] || 'NOT MARKED');

                      let cellBg = 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100 hover:text-slate-700';
                      let label = '—';

                      if (status === 'PRESENT') {
                        cellBg = 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-black shadow-xs';
                        label = 'P';
                      } else if (status === 'ABSENT') {
                        cellBg = 'bg-rose-50 text-rose-700 border border-rose-300 font-black shadow-xs';
                        label = 'A';
                      } else if (status === 'LEAVE') {
                        cellBg = 'bg-amber-50 text-amber-700 border border-amber-300 font-black shadow-xs';
                        label = 'L';
                      }

                      return (
                        <td 
                          key={sess.id}
                          className="py-2 px-1 text-center border-r border-slate-100"
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleCell(sess.id, st.student_id, st.dates[sess.id])}
                            className={`w-9 h-8 mx-auto rounded-lg text-xs transition-all flex items-center justify-center font-mono ${cellBg} ${isDirty ? 'ring-2 ring-amber-400 ring-offset-1' : ''}`}
                            title={`Date: ${sess.class_date} (${sess.weekday_name})\nClick to toggle: Present -> Absent -> Leave -> Unmarked`}
                          >
                            {label}
                          </button>
                        </td>
                      );
                    })}

                    {/* Live Summary Columns on Right */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700 bg-slate-50/50 border-l border-slate-200">
                      {liveAttended} <span className="text-[10px] text-slate-400 font-normal">/ {totalScheduledClasses}</span>
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-bold text-rose-700 bg-slate-50/50">
                      {liveAbsent}
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-bold text-amber-700 bg-slate-50/50">
                      {liveLeave}
                    </td>

                    <td className="py-3 px-4 text-center bg-slate-50/70 border-l border-slate-200">
                      <div className="flex flex-col items-center">
                        <span className="font-mono font-black text-xs text-slate-900">
                          {livePercentage}%
                        </span>
                        {/* Progress Bar */}
                        <div className="w-16 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                          <div 
                            className={`h-full transition-all ${livePercentage >= 80 ? 'bg-emerald-500' : livePercentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${Math.min(100, livePercentage)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Save Bar when modifications are pending */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white border border-rose-300 shadow-2xl rounded-2xl px-6 py-3.5 flex items-center gap-5 animate-in slide-in-from-bottom duration-300">
          <div className="text-xs">
            <span className="font-bold text-slate-900">{Object.keys(pendingChanges).length} Attendance Updates Pending</span>
            <p className="text-[11px] text-slate-500">Remember to save before leaving this month's register.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPendingChanges({})}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Discard
            </button>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="px-5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-500/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Month Register'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Student Entry Modal */}
      <StudentModal
        isOpen={studentModalOpen}
        onClose={() => setStudentModalOpen(false)}
        onStudentSaved={() => loadMonthlyRegister()}
      />

      {/* Past Class Date Modal */}
      <PastClassModal
        isOpen={pastClassModalOpen}
        onClose={() => setPastClassModalOpen(false)}
        onSessionCreated={() => loadMonthlyRegister()}
        defaultDate={`${year}-${String(month).padStart(2, '0')}-01`}
      />

      {/* Pause Student Modal */}
      <PauseStudentModal
        isOpen={pauseModalOpen}
        onClose={() => setPauseModalOpen(false)}
        student={studentToPause}
        onStudentPaused={() => loadMonthlyRegister()}
      />
    </div>
  );
}
