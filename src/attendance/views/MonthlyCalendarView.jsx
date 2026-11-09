import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  ArrowRight,
  Filter,
  Ban,
  RotateCcw
} from 'lucide-react';

export function MonthlyCalendarView({ onSelectClassForAttendance }) {
  const { currentMaster, addToast } = useAuth();
  
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(11); // 1-indexed (November = 11)
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeScheduleDays, setActiveScheduleDays] = useState(new Set([0, 6])); // Sun & Sat default
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'

  // Selected Day Modal State
  const [selectedDaySessions, setSelectedDaySessions] = useState(null);
  const [selectedDayDate, setSelectedDayDate] = useState(null);
  const [dayModalOpen, setDayModalOpen] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const loadMonthData = async () => {
    try {
      setLoading(true);
      const monthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
      
      const [sessRes, schedRes] = await Promise.all([
        api.getSessions({ month: monthStr }).catch(() => ({ sessions: [] })),
        api.getActiveSchedule().catch(() => ({ active: false }))
      ]);

      setSessions(sessRes?.sessions || []);

      if (schedRes?.active && schedRes?.schedule?.days) {
        setActiveScheduleDays(new Set(schedRes.schedule.days));
      }
    } catch (err) {
      addToast('Failed to load monthly calendar: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentMaster) {
      loadMonthData();
    }
  }, [currentMaster, currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleGoToToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(11);
  };

  const handleCancelSession = async (sessionId) => {
    try {
      await api.cancelSession(sessionId);
      addToast('Class session marked as cancelled.', 'info');
      await loadMonthData();
      if (dayModalOpen) {
        setDayModalOpen(false);
      }
    } catch (err) {
      addToast('Failed to cancel session: ' + err.message, 'error');
    }
  };

  const handleUncancelSession = async (sessionId) => {
    try {
      await api.uncancelSession(sessionId);
      addToast('Class session restored to scheduled.', 'success');
      await loadMonthData();
      if (dayModalOpen) {
        setDayModalOpen(false);
      }
    } catch (err) {
      addToast('Failed to restore session: ' + err.message, 'error');
    }
  };

  const handleDayClick = (cell) => {
    if (cell.empty || cell.sessions.length === 0) return;
    setSelectedDayDate(cell.dateStr);
    setSelectedDaySessions(cell.sessions);
    setDayModalOpen(true);
  };

  // Build calendar matrix
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayWeekday = new Date(currentYear, currentMonth - 1, 1).getDay();

  const sessionMap = {};
  for (const s of sessions) {
    if (!sessionMap[s.class_date]) {
      sessionMap[s.class_date] = [];
    }
    sessionMap[s.class_date].push(s);
  }

  const calendarCells = [];
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarCells.push({ empty: true, key: `empty-pad-${i}` });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const cellDate = new Date(currentYear, currentMonth - 1, d);
    const dayOfWeek = cellDate.getDay();
    const cellSessions = sessionMap[dateStr] || [];
    const isScheduleDay = activeScheduleDays.has(dayOfWeek);

    calendarCells.push({
      empty: false,
      key: `day-${dateStr}`,
      day: d,
      dateStr,
      dayOfWeek,
      isScheduleDay,
      sessions: cellSessions,
    });
  }

  return (
    <div className="space-y-5">
      {/* 1. CALENDAR HEADER BAR */}
      <div className="p-4 md:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider mb-0.5">
            <CalendarDays className="w-4 h-4" />
            <span>Schedule Calendar</span>
          </div>
          <h2 className="font-display text-lg md:text-xl font-bold text-slate-900">
            {monthNames[currentMonth - 1]} {currentYear}
          </h2>
        </div>

        {/* View Mode & Month Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white text-rose-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-rose-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              List View
            </button>
          </div>

          <button
            onClick={handleGoToToday}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 transition-colors cursor-pointer"
          >
            Today
          </button>

          <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-200">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-800 px-2.5 min-w-[90px] text-center">
              {monthNames[currentMonth - 1]?.slice(0, 3)} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. LEGEND BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-white rounded-xl border border-slate-200 shadow-sm text-xs">
        <div className="flex flex-wrap items-center gap-3.5 text-slate-600">
          <span className="font-bold text-slate-800">Status:</span>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
            <span>Pending Check-In</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
            <span>Upcoming Class</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
            <span>Cancelled</span>
          </div>
        </div>

        <div className="text-slate-500 text-xs">
          Classes in {monthNames[currentMonth - 1]}: <strong className="text-slate-900">{sessions.length}</strong>
        </div>
      </div>

      {/* 3. CALENDAR GRID VIEW */}
      {viewMode === 'calendar' ? (
        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
          {/* Weekday Column Headers */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            {weekdayHeaders.map((dayName, idx) => {
              const isHighlight = activeScheduleDays.has(idx);
              return (
                <div 
                  key={dayName}
                  className={isHighlight ? 'text-rose-600 font-black' : ''}
                >
                  {dayName} {isHighlight && '•'}
                </div>
              );
            })}
          </div>

          {/* Days Matrix */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 bg-white">
            {calendarCells.map((cell) => {
              if (cell.empty) {
                return (
                  <div 
                    key={cell.key} 
                    className="min-h-[95px] p-2 bg-slate-50/50 select-none"
                  />
                );
              }

              const hasSessions = cell.sessions.length > 0;
              const isWeekendOrScheduled = cell.isScheduleDay;

              return (
                <div
                  key={cell.key}
                  onClick={() => handleDayClick(cell)}
                  className={`min-h-[95px] p-2 transition-all flex flex-col justify-between relative group ${
                    hasSessions ? 'cursor-pointer hover:bg-slate-50' : ''
                  } ${isWeekendOrScheduled ? 'bg-rose-50/15' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold ${
                      isWeekendOrScheduled ? 'text-rose-700' : 'text-slate-500'
                    }`}>
                      {cell.day}
                    </span>

                    {isWeekendOrScheduled && (
                      <span className="text-[9px] font-bold text-rose-500/70 uppercase">
                        Class Day
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 my-1">
                    {cell.sessions.map((s) => {
                      let badgeBg = 'bg-blue-50 border-blue-200 text-blue-800';
                      let statusLabel = 'Scheduled';

                      if (s.completion_status === 'COMPLETED' || s.status === 'completed') {
                        badgeBg = 'bg-emerald-50 border-emerald-200 text-emerald-800';
                        statusLabel = `${s.present_count || 19} Present`;
                      } else if (s.completion_status === 'PENDING') {
                        badgeBg = 'bg-amber-50 border-amber-200 text-amber-800';
                        statusLabel = 'Pending Mark';
                      } else if (s.status === 'cancelled') {
                        badgeBg = 'bg-rose-50 border-rose-200 text-rose-700 line-through';
                        statusLabel = 'Cancelled';
                      }

                      return (
                        <div
                          key={s.id}
                          className={`text-[10px] p-1 rounded-md border font-medium flex items-center justify-between gap-1 shadow-2xs ${badgeBg}`}
                        >
                          <div className="truncate">
                            <span className="font-bold">{s.start_time || s.timing_display?.split('–')[0]?.trim()}</span>
                            <span className="hidden sm:inline"> • {statusLabel}</span>
                          </div>
                          {(s.completion_status === 'COMPLETED' || s.status === 'completed') && (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-[9px] text-slate-400">
                    {hasSessions ? `${cell.sessions.length} class` : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* CHRONOLOGICAL LIST VIEW */
        <div className="p-4 md:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-display font-bold text-base text-slate-900">
            Chronological Sessions for {monthNames[currentMonth - 1]} {currentYear}
          </h3>

          <div className="space-y-2">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="font-bold text-sm text-slate-900">
                    {s.class_date} ({s.weekday_name})
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Timing: <strong className="text-slate-800">{s.timing_display || `${s.start_time} - ${s.end_time}`}</strong> • Status: {s.status}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    s.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {s.status === 'completed' ? '✓ Completed' : 'Pending Check-In'}
                  </span>

                  <button
                    onClick={() => onSelectClassForAttendance && onSelectClassForAttendance(s.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <span>{s.status === 'completed' ? 'Review' : 'Mark'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Day Modal */}
      <Modal
        isOpen={dayModalOpen}
        onClose={() => setDayModalOpen(false)}
        title={`Class Details: ${selectedDayDate}`}
      >
        <div className="space-y-4 text-xs">
          {selectedDaySessions?.map((s) => (
            <div key={s.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">
                  {s.start_time} – {s.end_time}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  s.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {s.status}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <button
                  onClick={() => {
                    setDayModalOpen(false);
                    if (onSelectClassForAttendance) {
                      onSelectClassForAttendance(s.id);
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>Mark Attendance</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                {s.status === 'cancelled' ? (
                  <button
                    onClick={() => handleUncancelSession(s.id)}
                    className="text-xs text-emerald-600 hover:underline cursor-pointer"
                  >
                    Restore Class
                  </button>
                ) : (
                  <button
                    onClick={() => handleCancelSession(s.id)}
                    className="text-xs text-rose-600 hover:underline cursor-pointer"
                  >
                    Cancel Class
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Modal>

    </div>
  );
}
