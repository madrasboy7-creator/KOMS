import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserCheck, 
  Calendar, 
  Users, 
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export function DayAttendanceModal({ 
  isOpen, 
  sessionId, 
  onClose, 
  onAttendanceUpdated,
  onOpenFullSession 
}) {
  const { addToast } = useAuth();
  const [session, setSession] = useState(null);
  const [roster, setRoster] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatingStudentId, setUpdatingStudentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const loadDayAttendance = async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      const res = await api.getSessionAttendance(sessionId);
      setSession(res.session);
      setRoster(res.roster || []);
      setSummary(res.summary);
    } catch (err) {
      addToast('Failed to load day attendance list: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && sessionId) {
      loadDayAttendance();
      setSearchQuery('');
      setStatusFilter('ALL');
    }
  }, [isOpen, sessionId]);

  if (!isOpen) return null;

  // Handle quick attendance status update directly in this list
  const handleStatusChange = async (studentId, newStatus) => {
    try {
      setUpdatingStudentId(studentId);
      await api.recordSingleAttendance(sessionId, studentId, newStatus);
      
      // Update local roster
      setRoster(prev => {
        const next = prev.map(s => {
          if (s.id === studentId) {
            return {
              ...s,
              attendance_status: newStatus,
              marked_at: newStatus === 'NOT MARKED' ? null : new Date().toISOString()
            };
          }
          return s;
        });

        // Recalculate summary
        let p = 0, a = 0, l = 0, nm = 0;
        for (const item of next) {
          if (item.attendance_status === 'PRESENT') p++;
          else if (item.attendance_status === 'ABSENT') a++;
          else if (item.attendance_status === 'LEAVE') l++;
          else nm++;
        }
        setSummary({
          total_students: next.length,
          present_count: p,
          absent_count: a,
          leave_count: l,
          unmarked_count: nm,
          attendance_rate: (p + a + l) > 0 ? Math.round((p / (p + a + l)) * 100) : 0
        });

        return next;
      });

      addToast(`Attendance updated to ${newStatus}`, 'success');
      if (onAttendanceUpdated) onAttendanceUpdated();
    } catch (err) {
      addToast('Failed to update status: ' + err.message, 'error');
    } finally {
      setUpdatingStudentId(null);
    }
  };

  const filteredRoster = roster.filter(s => {
    const matchesSearch = s.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.student_code.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (statusFilter === 'PRESENT') return s.attendance_status === 'PRESENT';
    if (statusFilter === 'ABSENT') return s.attendance_status === 'ABSENT';
    if (statusFilter === 'LEAVE') return s.attendance_status === 'LEAVE';
    if (statusFilter === 'NOT MARKED') return !s.attendance_status || s.attendance_status === 'NOT MARKED';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-slate-900">
                  {session?.formatted_date || session?.class_date}
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {session?.weekday_name}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  Ranga Nagar Dojo
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Class Timing: {session?.timing_display || `${session?.start_time} – ${session?.end_time}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenFullSession && (
              <button
                onClick={() => {
                  onClose();
                  onOpenFullSession(sessionId);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 border border-slate-200 transition-colors"
                title="Open in Full Daily Attendance Session"
              >
                <span>Full Session</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Attendance Summary Strip */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3.5 bg-slate-50/60 border-b border-slate-100 text-center">
            <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Total</span>
              <div className="text-base font-black text-slate-900 font-mono mt-0.5">{summary.total_students}</div>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-sm">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Present</span>
              <div className="text-base font-black text-emerald-600 font-mono mt-0.5">{summary.present_count}</div>
            </div>
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 shadow-sm">
              <span className="text-[10px] font-bold text-rose-700 uppercase">Absent</span>
              <div className="text-base font-black text-rose-600 font-mono mt-0.5">{summary.absent_count}</div>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 shadow-sm">
              <span className="text-[10px] font-bold text-amber-700 uppercase">Leave</span>
              <div className="text-base font-black text-amber-600 font-mono mt-0.5">{summary.leave_count}</div>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Rate</span>
              <div className="text-base font-black text-rose-600 font-mono mt-0.5">
                {summary.attendance_rate || 0}%
              </div>
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="p-3.5 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap text-[11px] ${
                statusFilter === 'ALL' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All ({roster.length})
            </button>
            <button
              onClick={() => setStatusFilter('PRESENT')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap text-[11px] ${
                statusFilter === 'PRESENT' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Present ({summary?.present_count || 0})
            </button>
            <button
              onClick={() => setStatusFilter('ABSENT')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap text-[11px] ${
                statusFilter === 'ABSENT' ? 'bg-rose-600 text-white font-bold shadow-sm' : 'text-rose-700 hover:bg-rose-100'
              }`}
            >
              Absent ({summary?.absent_count || 0})
            </button>
            <button
              onClick={() => setStatusFilter('LEAVE')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap text-[11px] ${
                statusFilter === 'LEAVE' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-amber-700 hover:bg-amber-100'
              }`}
            >
              Leave ({summary?.leave_count || 0})
            </button>
            <button
              onClick={() => setStatusFilter('NOT MARKED')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap text-[11px] ${
                statusFilter === 'NOT MARKED' ? 'bg-slate-700 text-white font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Unmarked ({summary?.unmarked_count || 0})
            </button>
          </div>
        </div>

        {/* Daily Attendance Student List */}
        <div className="p-3.5 overflow-y-auto flex-1 divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 text-rose-500 animate-spin mx-auto mb-2" />
              <span>Loading attendance roster for this class...</span>
            </div>
          ) : filteredRoster.length > 0 ? (
            filteredRoster.map((item, idx) => {
              const isUpdating = updatingStudentId === item.id;

              return (
                <div 
                  key={item.id} 
                  className="py-2.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400 w-5 text-center">
                      {idx + 1}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-display font-bold text-rose-600 text-xs">
                      {item.student_name.slice(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {item.student_name}
                        </span>
                        {item.status === 'paused' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                            PAUSED
                          </span>
                        )}
                        {item.status === 'inactive' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                            PREVIOUS
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {item.student_code} • {item.rank}
                      </div>
                    </div>
                  </div>

                  {/* Attendance Controls */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* Status Display Badge */}
                    <div className="mr-1">
                      {item.attendance_status === 'PRESENT' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Present</span>
                        </span>
                      )}
                      {item.attendance_status === 'ABSENT' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3" />
                          <span>Absent</span>
                        </span>
                      )}
                      {item.attendance_status === 'LEAVE' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          <span>Leave</span>
                        </span>
                      )}
                      {(!item.attendance_status || item.attendance_status === 'NOT MARKED') && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                          <span>Not Marked</span>
                        </span>
                      )}
                    </div>

                    {/* Quick Action Button Group */}
                    <div className="flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                      <button
                        title="Mark Present"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(item.id, 'PRESENT')}
                        className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${
                          item.attendance_status === 'PRESENT'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        P
                      </button>
                      <button
                        title="Mark Absent"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(item.id, 'ABSENT')}
                        className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${
                          item.attendance_status === 'ABSENT'
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
                        }`}
                      >
                        A
                      </button>
                      <button
                        title="Mark Leave"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(item.id, 'LEAVE')}
                        className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${
                          item.attendance_status === 'LEAVE'
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                            : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                        }`}
                      >
                        L
                      </button>
                      <button
                        title="Clear / Unmark"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(item.id, 'NOT MARKED')}
                        className="px-1.5 py-0.5 rounded text-xs font-semibold text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all"
                      >
                        —
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No students found matching "{searchQuery}"
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Showing <strong className="text-slate-800">{filteredRoster.length}</strong> of <strong className="text-slate-800">{roster.length}</strong> students
          </div>

          <div className="flex items-center gap-2">
            {onOpenFullSession && (
              <button
                onClick={() => {
                  onClose();
                  onOpenFullSession(sessionId);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>Full Attendance Session</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-600 border border-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
